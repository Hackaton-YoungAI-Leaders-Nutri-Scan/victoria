import pytest

from utils import langchain as lc_mod
from utils.langchain import USER_SESSIONS, get_user_chain, summarize_personality


class _FakeResponse:
    def __init__(self, content: str) -> None:
        self.content = content


class _FakeLLM:
    """LLM fake para simular ChatGoogleGenerativeAI en los tests.

    No hace llamadas externas; solo devuelve un contenido fijo en `invoke`.
    """

    def __init__(self, *args, **kwargs) -> None:  # pragma: no cover - sólo compat
        pass

    def invoke(self, prompt: str) -> _FakeResponse:  # type: ignore[override]
        # Para get_user_chain no usamos el resultado de invoke en estos tests,
        # así que este valor sólo importa para summarize_personality.
        return _FakeResponse(
            """{
  "food_preferences": {
    "likes": ["ensaladas"],
    "dislikes": ["comida rápida"],
    "emotional_eating_triggers": ["estrés"]
  },
  "activity": {
    "level": "moderado",
    "hobbies": ["caminar"]
  },
  "content": {
    "platforms": ["YouTube"],
    "tone": "motivacional"
  },
  "mood_baseline": "tranquilo"
}"""
        )


@pytest.fixture(autouse=True)
def patch_llm_and_clear_sessions(monkeypatch):
    """Parchea ChatGoogleGenerativeAI por un LLM falso y limpia sesiones.

    Evita llamadas reales a Gemini y asegura que USER_SESSIONS no comparta
    estado entre pruebas.
    """

    USER_SESSIONS.clear()
    monkeypatch.setattr(lc_mod, "ChatGoogleGenerativeAI", _FakeLLM)
    yield
    USER_SESSIONS.clear()


def test_get_user_chain_uses_profile_prompt_by_default():
    """Si personality_stage es profiling (por defecto) debe usar PROFILE_PROMPT_TEMPLATE."""
    chain = get_user_chain(
        user_id="test-user-1",
        user_profile={
            "full_name": "Juan Perez",
            "age": 30,
            "gender": "masculino",
            "height_cm": 175,
            "weight_kg": 80,
            "diseases": ["hipertensión"],
            "allergies": ["maní"],
        },
        personality_stage="profiling",
        personality_profile=None,
    )

    # Debe ser una ConversationChain de LangChain
    assert hasattr(chain, "prompt")
    template = chain.prompt.template

    # Verificamos que el template base corresponde al de perfilamiento
    assert "TU OBJETIVO ACTUAL:" in template
    assert "Realizar una \"entrevista casual\"" in template
    # Y que ya se inyectó el nombre del usuario
    assert "Juan Perez" in template
    # Aseguramos que NO está usando el prompt diario
    assert "Tu objetivo ahora NO es seguir investigando su personalidad" not in template


def test_get_user_chain_uses_daily_prompt_when_stage_daily():
    """Si personality_stage es daily debe usar DAILY_PROMPT_TEMPLATE."""
    chain = get_user_chain(
        user_id="test-user-2",
        user_profile={
            "full_name": "Ana",
            "age": 28,
            "gender": "femenino",
        },
        personality_stage="daily",
        personality_profile={
            "food_preferences": {"likes": ["frutas"], "dislikes": [], "emotional_eating_triggers": []},
            "activity": {"level": "activo", "hobbies": ["correr"]},
            "content": {"platforms": ["YouTube"], "tone": "motivacional"},
            "mood_baseline": "motivado",
        },
    )

    template = chain.prompt.template

    # Verificamos que el template base corresponde al de seguimiento diario
    assert "Tu objetivo ahora NO es seguir investigando su personalidad" in template
    assert "RESUMEN DE PERSONALIDAD Y HÁBITOS" in template
    # Y que el nombre se haya inyectado
    assert "Ana" in template


def test_summarize_personality_parses_valid_json():
    """summarize_personality debe devolver el dict parseado cuando el LLM responde JSON válido."""

    history = "Usuario: Me siento un poco estresado pero estoy intentando comer mejor."
    profile = {
        "full_name": "Carlos",
        "age": 35,
        "diseases": ["diabetes"],
        "allergies": [],
    }

    result = summarize_personality(history, profile)

    # Debe ser un dict con la estructura esperada
    assert isinstance(result, dict)
    assert "food_preferences" in result
    assert "activity" in result
    assert "content" in result
    assert "mood_baseline" in result

    assert result["food_preferences"]["likes"] == ["ensaladas"]
    assert result["activity"]["level"] == "moderado"
    assert result["mood_baseline"] == "tranquilo"


class _FakeLLMInvalid:
    """LLM fake que devuelve una respuesta NO JSON para probar el fallback."""

    def __init__(self, *args, **kwargs) -> None:  # pragma: no cover - sólo compat
        pass

    def invoke(self, prompt: str) -> _FakeResponse:  # type: ignore[override]
        # Respuesta que no es JSON válido
        return _FakeResponse("Esto no es un JSON válido")


def test_summarize_personality_invalid_json_returns_fallback(monkeypatch):
    """Si el LLM devuelve JSON inválido, summarize_personality debe usar el fallback seguro."""

    # Parcheamos temporalmente el LLM por uno que responde basura
    monkeypatch.setattr(lc_mod, "ChatGoogleGenerativeAI", _FakeLLMInvalid)

    history = "Usuario: No sé qué comer hoy."
    profile = {"full_name": "Sofía"}

    result = summarize_personality(history, profile)

    # Debe seguir devolviendo un dict con todas las claves esperadas
    assert isinstance(result, dict)
    assert set(result.keys()) == {"food_preferences", "activity", "content", "mood_baseline"}

    assert result["food_preferences"]["likes"] == []
    assert result["activity"]["level"] == "desconocido"
    assert result["content"]["platforms"] == []
    assert result["mood_baseline"] == "desconocido"
