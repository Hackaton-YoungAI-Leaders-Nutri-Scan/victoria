from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import json

app = Flask(__name__)
CORS(app)  # CORS básico para permitir peticiones desde el frontend (por defecto permite todos los orígenes)


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


if __name__ == "__main__":
    # Cambia host y puerto si lo necesitas (por ejemplo, host="0.0.0.0")
    app.run(debug=True)
