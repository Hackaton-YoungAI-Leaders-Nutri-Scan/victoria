from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import logging
from dotenv import load_dotenv
from datetime import datetime

from utils.gcp import upload_image_to_gcp
from utils.whatsapp import build_whatsapp_reply, send_whatsapp_message, download_whatsapp_media
from db.db import WhatsAppMessage, SessionLocal, init_db

from utils.ai.detector_image import detectar_auto
from utils.ai.detector_audio import transcribir_audio

load_dotenv()
init_db()

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

@app.route("/api/whatsapp/webhook", methods=["GET", "POST"])
def whatsapp_webhook():
    """Endpoint básico para recibir eventos/mensajes de WhatsApp.

    - Espera un cuerpo JSON (por ejemplo, el webhook de Twilio o de la API de WhatsApp).
    - De momento solo registra/inspecciona el payload y responde 200.
    - Aquí puedes agregar la lógica para responder mensajes, llamar a modelos, etc.
    """
    # 1) Verificación de webhook (estilo Meta WhatsApp Cloud API) vía GET
    if request.method == "GET":
        mode = request.args.get("hub.mode")
        token = request.args.get("hub.verify_token")
        challenge = request.args.get("hub.challenge")

        verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN")

        if mode == "subscribe" and token and token == verify_token:
            # Responder el challenge directamente (texto plano) con 200
            return challenge, 200
        return jsonify({"error": "Verificación de webhook no autorizada"}), 403

    # 2) Recepción de mensajes/eventos vía POST
    try:
        payload = request.get_json(force=True, silent=False)
    except Exception:
        logging.exception("[WHATSAPP WEBHOOK] Error parseando JSON de la petición")
        return jsonify({"error": "Cuerpo de la petición no es JSON válido"}), 400

    logging.info("[WHATSAPP WEBHOOK] Payload recibido: %s", json.dumps(payload, ensure_ascii=False))

    # Intentar extraer el mensaje, número y posible media (imagen/audio) siguiendo la
    # estructura típica de WhatsApp Cloud API. Si no coincide, se devuelve el
    # payload completo para facilitar el debug.
    user_message = None
    phone = None
    media_url = None
    media_id = None
    media_type = None

    try:
        entry = (payload.get("entry") or [])[0]
        changes = (entry.get("changes") or [])[0]
        value = changes.get("value") or {}
        messages = value.get("messages") or []
        if messages:
            msg = messages[0]
            phone = msg.get("from")
            msg_type = msg.get("type")
            if msg_type == "text":
                text_obj = msg.get("text") or {}
                user_message = text_obj.get("body")
            elif msg_type == "image":
                image_obj = msg.get("image") or {}
                media_id = image_obj.get("id")
                caption = image_obj.get("caption")

                # Si hay caption, úsalo como mensaje del usuario; si no, un texto por defecto
                user_message = caption or "Imagen enviada por el usuario"

                if media_id:
                    img_bytes = download_whatsapp_media(media_id)
                    if img_bytes:
                        # Nombre de archivo: phone_timestamp_mediaid.jpg (aprox)
                        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%S%fZ")
                        fname = f"whatsapp/{phone}_{ts}_{media_id}.jpg"
                        media_url = upload_image_to_gcp(img_bytes, fname)

                        # 1. Ejecutar modelo Gemini para detectar alimentos
                        result_json = detectar_auto(img_bytes)
                        # 2. Si hubo error en el modelo
                        if '"error"' in result_json:
                            reply_text = "⚠️ Ocurrió un error analizando la imagen, intenta nuevamente."
                        else:
                            reply_text = result_json  # JSON crudo devuelto por Gemini

            elif msg_type == "audio":
                audio_obj = msg.get("audio") or {}
                media_id = audio_obj.get("id")

                # Para audios usamos un mensaje genérico
                user_message = "Audio enviado por el usuario"

                if media_id:
                    audio_bytes = download_whatsapp_media(media_id)
                    if audio_bytes:
                        # Nombre de archivo: phone_timestamp_mediaid.ogg (aprox)
                        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%S%fZ")
                        fname = f"whatsapp/{phone}_{ts}_{media_id}.ogg"
                        media_url = upload_image_to_gcp(audio_bytes, fname)


                        transcripcion = transcribir_audio(audio_bytes)


                        user_message = transcripcion if transcripcion else "No se pudo transcribir el audio."
                        media_type = "audio"  # Initialize media_type variable here

    except Exception:
        # Si algo falla en el parseo, se mantiene user_message = None
        logging.exception("[WHATSAPP WEBHOOK] Error extrayendo mensaje/phone del payload")

    user_message = reply_text if 'reply_text' in locals() else user_message

    if user_message:
        logging.info("[WHATSAPP WEBHOOK] Mensaje de usuario detectado. from=%s body=%s", phone, user_message)
        reply_text = build_whatsapp_reply(user_message, phone)
        db = SessionLocal()

        # Guardar mensaje entrante (incluyendo media_url si existe)
        if phone:
            incoming = WhatsAppMessage(
                phone=phone,
                message=user_message,
                direction="in",
                media_url=media_url,
                media_id=media_id,
                media_type=media_type,
            )
            db.add(incoming)

        send_result = None
        if phone:
            send_result = send_whatsapp_message(phone, reply_text)
            logging.info("[WHATSAPP WEBHOOK] Resultado envío WhatsApp: %s", send_result)

            # Guardar mensaje saliente
            outgoing = WhatsAppMessage(phone=phone, message=reply_text, direction="out")
            db.add(outgoing)

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            logging.exception("[WHATSAPP WEBHOOK] Error guardando mensajes en BD: %s", e)
        finally:
            db.close()

        if not phone:
            logging.warning("[WHATSAPP WEBHOOK] No se encontró número de teléfono en el payload")

        return jsonify(
            {
                "status": "ok",
                "from": phone,
                "user_message": user_message,
                "reply": reply_text,
                "send_result": send_result,
                "media_url": media_url,
            }
        ), 200

    # Caso genérico: devolver el payload completo para debug
    return jsonify({"status": "ok", "received": payload}), 200


@app.route("/api/whatsapp/message", methods=["POST"])
def whatsapp_message():
    """Recibe un mensaje de usuario y devuelve una respuesta sencilla.

    Espera un JSON como:
    {
        "message": "texto del usuario",
        "phone": "+573001112233"  # opcional
    }
    """

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Se requiere un cuerpo JSON"}), 400

    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "Falta el campo 'message'"}), 400

    phone = data.get("phone")

    # Lógica de respuesta reutilizando la misma función que el webhook
    reply_text = build_whatsapp_reply(user_message, phone)

    # Guardar mensajes en BD (si hay teléfono)
    if phone:
        db = SessionLocal()
        try:
            incoming = WhatsAppMessage(phone=phone, message=user_message, direction="in")
            outgoing = WhatsAppMessage(phone=phone, message=reply_text, direction="out")
            db.add(incoming)
            db.add(outgoing)
            db.commit()
        except Exception as e:
            db.rollback()
            logging.exception("[WHATSAPP MESSAGE] Error guardando mensajes en BD: %s", e)
        finally:
            db.close()

    response = {
        "to": phone,
        "user_message": user_message,
        "reply": reply_text,
    }

    return jsonify(response), 200


@app.route("/api/whatsapp/messages/<phone>", methods=["GET"])
def get_whatsapp_messages(phone: str):
    db = SessionLocal()
    try:
        msgs = (
            db.query(WhatsAppMessage)
            .filter(WhatsAppMessage.phone == phone)
            .order_by(WhatsAppMessage.created_at.asc())
            .all()
        )
        return jsonify([m.to_dict() for m in msgs]), 200
    except Exception as e:
        logging.exception("[WHATSAPP MESSAGES] Error consultando historial para %s: %s", phone, e)
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


if __name__ == "__main__":
    # Cambia host y puerto si lo necesitas (por ejemplo, host="0.0.0.0")
    app.run(debug=True)
