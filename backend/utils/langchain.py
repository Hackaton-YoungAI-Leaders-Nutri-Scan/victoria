import json

from langchain.chains import ConversationChain
from langchain.memory import ConversationSummaryBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

USER_SESSIONS = {}

# --- PROMPT MAESTRO PARA PERFILAMIENTO DE PERSONALIDAD Y HÁBITOS ---
PROFILE_PROMPT_TEMPLATE = """
Eres Victoria, un compañero de bienestar y nutrición altamente empático, observador y profesional.

TU OBJETIVO ACTUAL:
Realizar una "entrevista casual" por WhatsApp para perfilar al usuario.
No hagas un interrogatorio policial.
Tu meta es completar mentalmente estos 4 pilares, haciendo UNA sola pregunta a la vez:
1. 🧠 ESTADO DE ÁNIMO: ¿Cómo se siente hoy? ¿Tiene energía o está agotado?
2. 🍽️ GUSTOS Y ANTOJOS: ¿Qué le gusta comer cuando está feliz? ¿Y cuando está triste? (Detectar comedores emocionales).
3. 🏃‍♂️ RUTINA Y ACTIVIDAD: ¿Es sedentario? ¿Qué hace en su tiempo libre?
4. 📺 CONSUMO MENTAL: ¿Qué ve en TV/Redes? (Para saber si duerme mal por pantallas o busca motivación).

PERFIL DEL USUARIO (tenlo siempre en cuenta, NO lo vuelvas a preguntar):
- Nombre: {full_name}
- Edad: {age} años | Género: {gender}
- Condiciones médicas: {diseases}
- Alergias: {allergies}
- Datos físicos: Mide {height_cm}cm y pesa {weight_kg}kg.

REGLAS DE INTERACCIÓN (estilo WhatsApp):
- RESPUESTAS CORTAS: máximo 2–3 frases. La gente no lee textos largos en WhatsApp.
- UNA PREGUNTA A LA VEZ: nunca hagas dos preguntas en el mismo mensaje.
- EMPATÍA PRIMERO: si el usuario dice que comió algo "malo" para su condición, NO lo regañes.
  Pregunta qué lo motivó (estrés, antojo, fiesta) para entender el hábito.
- PERSONALIZACIÓN: usa su nombre ({full_name}) de vez en cuando.
- RESPONDE SIEMPRE EN ESPAÑOL NEUTRO.

Historial resumido de la conversación:
{history}

Mensaje más reciente del usuario:
{input}

Responde como Victoria con máximo 2–3 frases y termina con UNA sola pregunta abierta que te ayude a conocerlo mejor.
Victoria:"""


# --- PROMPT PARA SEGUIMIENTO DIARIO ---
DAILY_PROMPT_TEMPLATE = """
Eres Victoria, un compañero de bienestar y nutrición que ya conoce bastante bien al usuario.

Tu objetivo ahora NO es seguir investigando su personalidad, sino acompañarlo en su día a día
con pequeñas preguntas y micro-sugerencias realistas.

PERFIL CLÍNICO:
- Nombre: {full_name}
- Edad: {age} años | Género: {gender}
- Condiciones médicas: {diseases}
- Alergias: {allergies}

RESUMEN DE PERSONALIDAD Y HÁBITOS (no lo repitas, solo úsalo como contexto mental):
- Gustos alimentarios: {likes}
- No le gustan: {dislikes}
- Come por emoción cuando: {emotional_triggers}
- Nivel de actividad: {activity_level}
- Hobbies: {hobbies}
- Plataformas que consume: {platforms}
- Estado de ánimo habitual: {mood_baseline}

REGLAS DE INTERACCIÓN (WhatsApp, seguimiento diario):
- Máximo 2–3 frases por mensaje.
- Siempre termina con UNA sola pregunta concreta sobre su día (comida, energía, sueño, antojos o emociones).
- Puedes dar UNA recomendación pequeña y accionable, adaptada a sus condiciones médicas y personalidad.
- Nunca lo regañes; reconoce sus esfuerzos y propone mejoras suaves.

Historial reciente de conversación:
{history}

Mensaje más reciente del usuario:
{input}

Responde como Victoria con máximo 2–3 frases y termina con UNA sola pregunta concreta sobre hoy.
Victoria:"""


def get_user_chain(
    user_id: str,
    user_profile: dict | None = None,
    personality_stage: str = "profiling",
    personality_profile: dict | None = None,
) -> ConversationChain:
    """
    Devuelve la cadena (LLM + memoria) asociada a un usuario.

    Ahora acepta un `user_profile` opcional con claves como:
    {
      "full_name": str,
      "age": int,
      "gender": str,
      "height_cm": int,
      "weight_kg": int,
      "diseases": list[str],
      "allergies": list[str]
    }
    """
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.6,
        convert_system_message_to_human=True,
    )

    # Normalizar perfil
    if user_profile is None:
        user_profile = {}

    def safe_get(key: str, default: str = "No especificado") -> str:
        val = user_profile.get(key)
        return str(val) if val not in (None, "") else default

    diseases_list = user_profile.get("diseases", []) or []
    allergies_list = user_profile.get("allergies", []) or []

    diseases_str = ", ".join(diseases_list) if diseases_list else "Ninguna reportada"
    allergies_str = ", ".join(allergies_list) if allergies_list else "Ninguna reportada"

    personality_profile = personality_profile or {}
    food_prefs = personality_profile.get("food_preferences", {}) or {}
    activity = personality_profile.get("activity", {}) or {}
    content = personality_profile.get("content", {}) or {}

    likes = ", ".join(food_prefs.get("likes", []) or []) or "sin datos claros"
    dislikes = ", ".join(food_prefs.get("dislikes", []) or []) or "sin datos claros"
    emotional_triggers = (
        ", ".join(food_prefs.get("emotional_eating_triggers", []) or [])
        or "sin datos claros"
    )
    activity_level = activity.get("level", "desconocido")
    hobbies = ", ".join(activity.get("hobbies", []) or []) or "sin datos claros"
    platforms = ", ".join(content.get("platforms", []) or []) or "sin datos claros"
    mood_baseline = personality_profile.get("mood_baseline", "desconocido")

    template_to_use = (
        PROFILE_PROMPT_TEMPLATE
        if personality_stage == "profiling"
        else DAILY_PROMPT_TEMPLATE
    )

    prompt = PromptTemplate(
        input_variables=["history", "input"],
        template=template_to_use,
        partial_variables={
            "full_name": safe_get("full_name", "Amigo"),
            "age": safe_get("age", "?"),
            "gender": safe_get("gender", "?"),
            "height_cm": safe_get("height_cm", "?"),
            "weight_kg": safe_get("weight_kg", "?"),
            "diseases": diseases_str,
            "allergies": allergies_str,
            "likes": likes,
            "dislikes": dislikes,
            "emotional_triggers": emotional_triggers,
            "activity_level": activity_level,
            "hobbies": hobbies,
            "platforms": platforms,
            "mood_baseline": mood_baseline,
        },
    )

    # Reusar sesión si existe
    if user_id in USER_SESSIONS:
        chain = USER_SESSIONS[user_id]
        # Si mandan nuevo perfil, actualizamos el prompt
        if user_profile:
            chain.prompt = prompt
        return chain

    memory = ConversationSummaryBufferMemory(
        llm=llm,
        max_token_limit=1024,
        return_messages=True,
    )

    chain = ConversationChain(
        llm=llm,
        memory=memory,
        prompt=prompt,
        verbose=False,
    )

    USER_SESSIONS[user_id] = chain
    return chain


def summarize_personality(history: str, user_profile: dict | None = None) -> dict:
    """
    Genera un resumen estructurado de personalidad/hábitos a partir del historial.

    Devuelve SIEMPRE un dict con la forma:
    {
      "food_preferences": { ... },
      "activity": { ... },
      "content": { ... },
      "mood_baseline": str
    }
    """
    if user_profile is None:
        user_profile = {}

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.3,
        convert_system_message_to_human=True,
    )

    summary_template = """
Eres Victoria, una IA de nutrición y bienestar.

Con base en el siguiente historial de conversación de WhatsApp entre el usuario y Victoria,
y el perfil clínico del usuario, genera SOLO un JSON válido (sin comentarios, sin texto adicional)
con la siguiente estructura exacta:

{{
  "food_preferences": {{
    "likes": ["..."],
    "dislikes": ["..."],
    "emotional_eating_triggers": ["..."]
  }},
  "activity": {{
    "level": "sedentario | moderado | activo",
    "hobbies": ["..."]
  }},
  "content": {{
    "platforms": ["..."],
    "tone": "breve descripción"
  }},
  "mood_baseline": "frase corta que describa cómo suele sentirse (estresado, tranquilo, ansioso, motivado, etc.)"
}}

Perfil clínico conocido (no lo repitas, solo úsalo como contexto):
- Nombre: {full_name}
- Edad: {age}
- Condiciones médicas: {diseases}
- Alergias: {allergies}

Historial de conversación (usuario y Victoria):
{history}

Recuerda: responde SOLO el JSON.
"""

    diseases = ", ".join(user_profile.get("diseases", []) or []) or "Ninguna reportada"
    allergies = (
        ", ".join(user_profile.get("allergies", []) or []) or "Ninguna reportada"
    )

    prompt = summary_template.format(
        full_name=user_profile.get("full_name", "Usuario"),
        age=user_profile.get("age", "?"),
        diseases=diseases,
        allergies=allergies,
        history=history,
    )

    raw = llm.invoke(prompt).content

    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    # Fallback seguro
    return {
        "food_preferences": {
            "likes": [],
            "dislikes": [],
            "emotional_eating_triggers": [],
        },
        "activity": {
            "level": "desconocido",
            "hobbies": [],
        },
        "content": {
            "platforms": [],
            "tone": "desconocido",
        },
        "mood_baseline": "desconocido",
    }
