import chromadb
from chromadb.config import Settings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

import json
import uuid
import dotenv

dotenv.load_dotenv()

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.7,
)

client = chromadb.Client(
    Settings(
        persist_directory="./chroma_db",
        anonymized_telemetry=False
    )
)

collection = client.get_or_create_collection(
    name="long_term_memory"
)

def store_long_term_memory(user_id: str, fact: str):
    """
    Guarda un hecho relevante en Chroma usando embeddings de Gemini.
    """
    vector = embeddings.embed_query(fact)

    collection.add(
        documents=[fact],
        embeddings=[vector],
        metadatas=[{"user_id": user_id}],
        ids=[str(uuid.uuid4())]
    )

def retrieve_long_term_memory(user_id: str, query: str, k: int = 5):
    """
    Recupera los k hechos más relevantes de un usuario según la consulta.
    """
    query_vector = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
        where={"user_id": user_id}
    )

    if results["documents"]:
        return results["documents"][0]
    return []

def extract_relevant_facts(user_message: str):
    prompt = f"""
Extrae SOLO información importante sobre un adulto mayor que deba guardarse en memoria a largo plazo.

Criterios:
- alergias
- enfermedades
- preferencias
- objetivos
- restricciones
- hábitos alimenticios

Si no hay información relevante, devuelve un JSON vacío así:
{{ "facts": [] }}

Usuario:
{user_message}

Devuelve SOLO este formato JSON:
{{ "facts": ["..."] }}

**Importante**: Dame solo el string JSON, no en formato código.
"""

    response = llm.invoke(prompt)
    print(response)
    try:
        return json.loads(response.content).get("facts", [])
    except:
        return []

if __name__ == '__main__':
    text = "Ah, mijo, ¿ves ese reloj de péndulo ahí en la pared? Lleva marcando el tiempo desde que tu abuela y yo nos casamos, y hay que darle cuerda cada ocho días con precisión, no sea que se atrase... eso me recuerda que la puntualidad es una muestra de respeto hacia los demás, un valor que nunca pasa de moda. Hablando de modas, ¿has visto los pantalones rotos que usan ahora? Parecen salidos del taller de carpintería, no del armario. Pero bueno, más me importa contarte que el verdadero tesoro en esta vida no son los bienes materiales, sino las tardes largas compartiendo un café y una buena conversación, como esta... aunque este café hoy ha quedado un poco aguado, debería comprar otra marca, la de la bolsa roja, esa nunca falla. Al final, ya ves, son las pequeñas rutinas y las grandes lecciones las que tejen la tela de una vida bien vivida. Ah, y no olvides regar el geranio del balcón, que con este sol se marchita en un santiamén."

    facts = extract_relevant_facts(text)
    for fact in facts:
        store_long_term_memory("user_123", fact)
    
    retrieved_facts = retrieve_long_term_memory("user_123", "¿Cuáles son las alergias y preferencias alimenticias del usuario?")
    print("Retrieved Facts:", retrieved_facts)
