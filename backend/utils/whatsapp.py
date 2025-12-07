import os
import requests
import logging

from utils.langchain import get_user_chain

logging.basicConfig(level=logging.INFO)


def build_whatsapp_reply(user_message: str, phone: str) -> str:
    """Genera la respuesta nutricional para WhatsApp usando PromptTemplate."""
    chain = get_user_chain(phone)
    response = chain.predict(input=user_message)

    return response.strip()


def send_whatsapp_message(phone: str, text: str) -> dict:
    """Envía un mensaje de texto usando WhatsApp Cloud API.

    Requiere las variables de entorno:
    - WHATSAPP_ACCESS_TOKEN
    - WHATSAPP_PHONE_NUMBER_ID
    """

    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

    if not access_token or not phone_number_id:
        return {"error": "Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID"}

    url = f"https://graph.facebook.com/v17.0/{phone_number_id}/messages"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": text},
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return {"status_code": resp.status_code, "response": resp.json()}
    except Exception as e:
        return {"error": str(e)}


def download_whatsapp_media(media_id: str) -> bytes | None:
    """Descarga el binario de un media de WhatsApp Cloud API usando su media_id.

    1) GET https://graph.facebook.com/v17.0/{media_id} para obtener la URL.
    2) GET a esa URL con el mismo Bearer token para obtener los bytes.
    """

    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    if not access_token:
        logging.error("[WHATSAPP MEDIA] Falta WHATSAPP_ACCESS_TOKEN para descargar media")
        return None

    meta_url = f"https://graph.facebook.com/v17.0/{media_id}"
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        meta_resp = requests.get(meta_url, headers=headers, timeout=10)
        meta_resp.raise_for_status()
        meta_data = meta_resp.json()
        media_url = meta_data.get("url")
        if not media_url:
            logging.error("[WHATSAPP MEDIA] Respuesta sin URL para media_id=%s: %s", media_id, meta_data)
            return None

        bin_resp = requests.get(media_url, headers=headers, timeout=20)
        bin_resp.raise_for_status()
        return bin_resp.content
    except Exception as e:
        logging.exception("[WHATSAPP MEDIA] Error descargando media %s: %s", media_id, e)
        return None

