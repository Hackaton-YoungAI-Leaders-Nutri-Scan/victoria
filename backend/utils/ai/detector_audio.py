import base64
import os

import requests
from dotenv import load_dotenv

load_dotenv()


def transcribir_audio(audio_bytes, mime_type="audio/ogg"):
    """
    Transcribe audio usando Google Speech-to-Text v1p1beta1.
    Devuelve SOLO el texto transcrito.
    """
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        return "ERROR: Falta GOOGLE_API_KEY en variables de entorno"

    # Se convierte el audio en base64
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    url = (
        f"https://speech.googleapis.com/v1p1beta1/speech:recognize?key={GOOGLE_API_KEY}"
    )

    body = {
        "audio": {"content": audio_b64},
        "config": {
            "enableAutomaticPunctuation": True,
            "encoding": "OGG_OPUS",  # WhatsApp envía audio .ogg opus
            "languageCode": "es-ES",
            "model": "default",
        },
    }

    response = requests.post(url, json=body)

    if response.status_code != 200:
        return f"ERROR: {response.text}"

    data = response.json()

    # Si no hay resultados
    if "results" not in data or len(data["results"]) == 0:
        return ""

    transcript = data["results"][0]["alternatives"][0]["transcript"]
    return transcript
