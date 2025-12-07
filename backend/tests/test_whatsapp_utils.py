
from utils import whatsapp as wa_mod
from utils.whatsapp import build_whatsapp_reply


class _FakeProfile:
    def __init__(self, stage: str = "profiling", personality_profile=None) -> None:
        self.personality_stage = stage
        self.personality_profile = personality_profile
        # Campos usados para armar user_profile_dict
        self.full_name = "Test User"
        self.age = 30
        self.gender = "masculino"
        self.height_cm = 170
        self.weight_kg = 70
        self.diseases = ["hipertensión"]
        self.allergies = ["maní"]


class _FakeQuery:
    def __init__(self, profile):
        self._profile = profile

    def filter(self, *args, **kwargs):  # pragma: no cover - encadenamiento simple
        return self

    def order_by(self, *args, **kwargs):  # pragma: no cover
        return self

    def count(self):  # pragma: no cover - no lo usamos en estos tests
        return 0

    def all(self):  # pragma: no cover
        return []

    def first(self):
        return self._profile


class _FakeSession:
    def __init__(self, profile):
        self._profile = profile

    def query(self, *args, **kwargs):
        return _FakeQuery(self._profile)

    def close(self):  # pragma: no cover - sin efecto
        pass


class _FakeChain:
    def __init__(self, expected_response: str):
        self._expected_response = expected_response
        self.last_input = None

    def predict(self, input: str):  # type: ignore[override]
        self.last_input = input
        return self._expected_response


def test_build_whatsapp_reply_calls_chain_with_profiling(monkeypatch):
    """Cuando no hay perfil en DB, debe llamar get_user_chain con stage profiling."""
    captured = {}

    def fake_sessionlocal():
        # No hay perfil almacenado
        return _FakeSession(profile=None)

    def fake_get_user_chain(
        user_id,
        user_profile=None,
        personality_stage="profiling",
        personality_profile=None,
    ):
        captured["user_id"] = user_id
        captured["user_profile"] = user_profile
        captured["personality_stage"] = personality_stage
        captured["personality_profile"] = personality_profile
        return _FakeChain("respuesta de prueba")

    monkeypatch.setattr(wa_mod, "SessionLocal", fake_sessionlocal)
    monkeypatch.setattr(wa_mod, "get_user_chain", fake_get_user_chain)

    msg = "Hola"
    phone = "12345"

    result = build_whatsapp_reply(msg, phone)

    assert result == "respuesta de prueba"
    # Debe usar el teléfono como user_id
    assert captured["user_id"] == phone
    # Sin perfil en BD, no se pasa user_profile ni personality_profile
    assert captured["user_profile"] is None
    assert captured["personality_profile"] is None
    # Stage por defecto debe ser profiling
    assert captured["personality_stage"] == "profiling"


def test_build_whatsapp_reply_uses_daily_stage_when_profile_daily(monkeypatch):
    """Si el perfil en BD tiene stage 'daily', debe propagarlo a get_user_chain."""
    profile_obj = _FakeProfile(stage="daily", personality_profile={"foo": "bar"})
    captured = {}

    def fake_sessionlocal():
        return _FakeSession(profile=profile_obj)

    def fake_get_user_chain(
        user_id,
        user_profile=None,
        personality_stage="profiling",
        personality_profile=None,
    ):
        captured["user_id"] = user_id
        captured["user_profile"] = user_profile
        captured["personality_stage"] = personality_stage
        captured["personality_profile"] = personality_profile
        return _FakeChain("respuesta diaria")

    monkeypatch.setattr(wa_mod, "SessionLocal", fake_sessionlocal)
    monkeypatch.setattr(wa_mod, "get_user_chain", fake_get_user_chain)

    msg = "Buenos días"
    phone = "99999"

    result = build_whatsapp_reply(msg, phone)

    assert result == "respuesta diaria"
    assert captured["user_id"] == phone
    # Debe propagar el stage y el personality_profile del modelo
    assert captured["personality_stage"] == "daily"
    assert captured["personality_profile"] == profile_obj.personality_profile
    # El user_profile que se pasa a LangChain debe tener datos básicos
    assert captured["user_profile"]["full_name"] == "Test User"
    assert captured["user_profile"]["diseases"] == ["hipertensión"]
