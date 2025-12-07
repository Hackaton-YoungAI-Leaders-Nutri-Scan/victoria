from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import json
import os
import requests
import logging
from datetime import datetime
from sqlalchemy import create_engine, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session, Mapped, mapped_column
from google.cloud import storage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationSummaryBufferMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv

from detector_image import detectar_auto

load_dotenv()

logging.basicConfig(level=logging.INFO)

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))
Base = declarative_base()

app = Flask(__name__)
CORS(app)  # CORS básico para permitir peticiones desde el frontend (por defecto permite todos los orígenes)

USER_SESSIONS = {}

## LANGCHAIN CONFIG
prompt_template = PromptTemplate(
    input_variables=["input", "history"],
    template="""
Eres Nutri-Scan, un asistente experto en nutrición clínica y educación alimentaria.
Tu tarea es responder mensajes de WhatsApp de forma:

- Breve
- Clara
- Amigable
- Basada en evidencia
- Sin usar jerga médica innecesaria
- Sin dar diagnósticos médicos

Historial resumido de la conversación:
{history}

Mensaje del usuario:
"{input}"
"""
)
## LANGCHAIN


def get_user_chain(user_id: str) -> ConversationChain:
    """
    Devuelve la cadena (LLM + memoria) asociada a un usuario.
    Si no existe, la crea.
    """
    if user_id not in USER_SESSIONS:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7
        )

        memory = ConversationSummaryBufferMemory(
            llm=llm,
            max_token_limit=600,
            return_messages=True
        )

        chain = ConversationChain(
            llm=llm,
            memory=memory,
            verbose=False
        )

        USER_SESSIONS[user_id] = chain

    return USER_SESSIONS.get(user_id)


def simulate_model_from_filename(filename: str):
    """Devuelve (food_name, recommendation) en base al nombre de archivo."""
    if not filename:
        return "Desconocido", "AMARILLO"

    name_lower = filename.lower()

    green_keywords = ["manzana", "zanahoria", "vegetal"]
    red_keywords = ["hamburguesa", "frito", "pizza"]

    for kw in green_keywords:
        if kw in name_lower:
            return kw.capitalize(), "VERDE"

    for kw in red_keywords:
        if kw in name_lower:
            return kw.capitalize(), "ROJO"

    # Caso por defecto
    return filename.rsplit(".", 1)[0].capitalize(), "AMARILLO"


class FoodEntry(Base):
    __tablename__ = "food_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "category": self.category}


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    phone: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    message: Mapped[str] = mapped_column(String(4096), nullable=False)
    direction: Mapped[str] = mapped_column(String(8), nullable=False)  # 'in' o 'out'
    media_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "phone": self.phone,
            "message": self.message,
            "direction": self.direction,
            "media_url": self.media_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


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


def upload_image_to_gcp(image_bytes: bytes, filename: str) -> str | None:
    """Sube una imagen a un bucket de GCP y devuelve la URL pública (si el bucket lo permite).

    Requiere:
    - GCP_BUCKET_NAME: nombre del bucket
    - Credenciales de servicio configuradas (GOOGLE_APPLICATION_CREDENTIALS o similar)
    """

    bucket_name = os.getenv("GCP_BUCKET_NAME")
    if not bucket_name:
        logging.error("[GCP STORAGE] Falta GCP_BUCKET_NAME en variables de entorno")
        return None

    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(filename)
        blob.upload_from_string(image_bytes)

        # Si el bucket es público o tiene acceso anónimo, esta será la URL accesible
        return blob.public_url
    except Exception as e:
        logging.exception("[GCP STORAGE] Error subiendo imagen a bucket %s: %s", bucket_name, e)
        return None

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

    # Intentar extraer el mensaje, número y posible media (imagen) siguiendo la
    # estructura típica de WhatsApp Cloud API. Si no coincide, se devuelve el
    # payload completo para facilitar el debug.
    user_message = None
    phone = None
    media_url = None

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

                        result_json = detectar_auto(img_bytes)

                        if '"error"' in result_json:
                            reply_text = "Ocurrió un error analizando la imagen, intenta nuevamente."
                        else:
                            reply_text = result_json

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

    except Exception:
        # Si algo falla en el parseo, se mantiene user_message = None
        logging.exception("[WHATSAPP WEBHOOK] Error extrayendo mensaje/phone del payload")

    if user_message:
        logging.info("[WHATSAPP WEBHOOK] Mensaje de usuario detectado. from=%s body=%s", phone, user_message)
        reply_text = build_whatsapp_reply(user_message, phone)
        db = SessionLocal()

        if phone:
            incoming = WhatsAppMessage(
                phone=phone,
                message=user_message,
                direction="in",
                media_url=media_url,
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
    reply_text = build_whatsapp_reply(user_message)

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


@app.route("/api/recommendation", methods=["POST"])
def recommendation():
    # Validar presencia de archivo
    if "photo" not in request.files:
        return jsonify({"error": "Falta el archivo 'photo'"}), 400

    photo_file = request.files["photo"]

    if not photo_file.filename:
        return jsonify({"error": "El archivo 'photo' no tiene nombre"}), 400

    # Intentar leer la imagen con Pillow (para validar que es una imagen)
    try:
        img_bytes = photo_file.read()
        Image.open(io.BytesIO(img_bytes))  # Solo para validar. No se usa luego.
    except Exception:
        return jsonify({"error": "El archivo 'photo' no es una imagen válida"}), 400

    # Volver a colocar el puntero del archivo al inicio por si se quisiera reutilizar
    photo_file.stream.seek(0)

    # Leer y parsear user_data
    user_data_raw = request.form.get("user_data")
    if not user_data_raw:
        return jsonify({"error": "Falta el campo 'user_data' en el formulario"}), 400

    try:
        user_data = json.loads(user_data_raw)
    except json.JSONDecodeError:
        return jsonify({"error": "'user_data' debe ser un JSON válido"}), 400

    # Extraer algunos campos del usuario (opcionalmente para detalles)
    edad = user_data.get("edad")
    genero = user_data.get("genero")
    tipo_sangre = user_data.get("tipo_sangre")
    rh = user_data.get("rh")
    peso = user_data.get("peso")
    enfermedades = user_data.get("enfermedades", [])
    alergias = user_data.get("alergias", [])

    # Simulación de modelo basada en el nombre del archivo
    food_name, recommendation = simulate_model_from_filename(photo_file.filename)

    # Construir mensaje de detalles
    # NOTA: Esta lógica es solo un ejemplo simple usando los datos del usuario.
    detalles_partes = []

    if edad is not None:
        detalles_partes.append(f"Edad: {edad} años.")
    if genero:
        detalles_partes.append(f"Género: {genero}.")
    if tipo_sangre and rh:
        detalles_partes.append(f"Tipo de sangre: {tipo_sangre}{rh}.")
    elif tipo_sangre:
        detalles_partes.append(f"Tipo de sangre: {tipo_sangre}.")

    if peso is not None:
        detalles_partes.append(f"Peso registrado: {peso} kg.")

    if enfermedades:
        detalles_partes.append(f"Enfermedades reportadas: {', '.join(enfermedades)}.")
    if alergias:
        detalles_partes.append(f"Alergias reportadas: {', '.join(alergias)}.")

    if recommendation == "VERDE":
        base_msg = f"El alimento {food_name} es recomendado para ti según la información proporcionada."
    elif recommendation == "ROJO":
        base_msg = f"El alimento {food_name} NO es recomendado para ti según la información proporcionada."
    else:
        base_msg = f"El alimento {food_name} debe consumirse con moderación según la información proporcionada."

    if detalles_partes:
        details = base_msg + " " + " ".join(detalles_partes)
    else:
        details = base_msg

    response = {
        "food_name": food_name,
        "recommendation": recommendation,
        "details": details,
    }

    return jsonify(response), 200

def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        count = db.query(FoodEntry).count()
        if count == 0:
            sample = FoodEntry(name="Manzana", category="Fruta")
            db.add(sample)
            db.commit()
    except Exception as e:
        logging.exception("[DB] Error inicializando la base de datos: %s", e)
    finally:
        db.close()


# Inicializar la base de datos al cargar la aplicación
init_db()


@app.route("/api/test-db", methods=["GET"])
def test_db():
    db = SessionLocal()
    try:
        entries = db.query(FoodEntry).all()
        return jsonify([e.to_dict() for e in entries]), 200
    except Exception as e:
        logging.exception("[DB] Error consultando la base de datos: %s", e)
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


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
