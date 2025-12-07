import os
import requests
import logging

from db.db import SessionLocal, UserProfile, WhatsAppMessage
from utils.langchain import get_user_chain, summarize_personality

logging.basicConfig(level=logging.INFO)


def build_whatsapp_reply(user_message: str, phone: str) -> str:
    """Genera la respuesta nutricional para WhatsApp usando LangChain.

    Ahora intenta recuperar el perfil del usuario desde la BD (UserProfile)
    usando el número de WhatsApp como clave, para personalizar el prompt
    de Victoria (condiciones, alergias, etc.).
    """

    user_profile_dict = None

    personality_stage = "profiling"
    profile = None

    if phone:
        db = SessionLocal()
        try:
            profile = (
                db.query(UserProfile)
                .filter(UserProfile.whatsapp_number == phone)
                .order_by(UserProfile.created_at.desc())
                .first()
            )

            if profile:
                personality_stage = profile.personality_stage or "profiling"
                user_profile_dict = {
                    "full_name": profile.full_name,
                    "age": profile.age,
                    "gender": profile.gender,
                    "height_cm": profile.height_cm,
                    "weight_kg": profile.weight_kg,
                    "diseases": profile.diseases or [],
                    "allergies": profile.allergies or [],
                }
        except Exception:
            logging.exception("[WHATSAPP] Error cargando perfil de usuario para %s", phone)
        finally:
            db.close()

    chain = get_user_chain(
        phone,
        user_profile=user_profile_dict,
        personality_stage=personality_stage,
        personality_profile=(profile.personality_profile if profile else None),
    )
    response = chain.predict(input=user_message).strip()

    # Si estamos en fase de perfilamiento, contar mensajes y decidir si cambiamos a 'daily'
    if phone and profile and personality_stage == "profiling":
        db = SessionLocal()
        try:
            total_msgs = (
                db.query(WhatsAppMessage)
                .filter(WhatsAppMessage.phone == phone)
                .count()
            )

            # Umbral simple: si ya hubo suficientes turnos, generamos resumen
            if total_msgs >= 12 and profile.personality_profile is None:
                # Construir historial simple usuario/Victoria
                msgs = (
                    db.query(WhatsAppMessage)
                    .filter(WhatsAppMessage.phone == phone)
                    .order_by(WhatsAppMessage.created_at.asc())
                    .all()
                )

                history_lines = []
                for m in msgs:
                    prefix = "Usuario" if m.direction == "in" else "Victoria"
                    history_lines.append(f"{prefix}: {m.message}")

                history_text = "\n".join(history_lines[-40:])  # últimos 40 mensajes como contexto

                try:
                    summary = summarize_personality(history_text, user_profile_dict or {})
                    profile.personality_profile = summary
                    profile.personality_stage = "daily"
                    db.add(profile)
                    db.commit()
                    logging.info("[WHATSAPP] Perfil de personalidad generado para %s", phone)
                except Exception:
                    db.rollback()
                    logging.exception("[WHATSAPP] Error generando resumen de personalidad para %s", phone)
        finally:
            db.close()

    return response


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

