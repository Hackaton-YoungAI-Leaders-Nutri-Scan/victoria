import base64
import os
from io import BytesIO

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from PIL import Image

load_dotenv()


def detectar(image_bytes, mime_type="image/jpeg"):
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        return '{"error": "No existe la variable de entorno GEMINI_API_KEY"}'

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", api_key=GEMINI_API_KEY, temperature=0.1
        )

        prompt = """
Actúa como un experto en identificación y nutrición de alimentos.

Analiza la imagen y devuelve EXCLUSIVAMENTE un JSON válido con el formato:
[
    {
        "alimento": "nombre",
        "cantidad": número,
        "unidad": "unidades|porciones",
        "nutricion": {
            "calorias": número,
            "proteina_g": número,
            "carbohidratos_g": número,
            "grasas_g": número
        }
    }
]

REGLAS:
1. Solo incluir alimentos claramente visibles en la imagen.
2. "cantidad" debe ser un número entero.
3. "unidad" debe ser SOLO: "unidades" o "porciones".
4. Los valores nutricionales deben ser aproximados por PORCIÓN o unidad detectada.
5. NO agregar texto fuera del JSON.
6. NO incluir comentarios, explicaciones ni código. SOLO el JSON final.
JSON:

"""

        encoded_image = base64.b64encode(image_bytes).decode("utf-8")

        msg = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{encoded_image}"},
                },
            ]
        )

        response = llm.invoke([msg])
        raw = response.content.strip()

        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(
                [line for line in lines if not line.strip().startswith("```")]
            ).strip()

        return raw

    except Exception as e:
        return f'{{"error": "Error procesando imagen: {str(e)}"}}'


def detectar_auto(image_bytes):
    try:
        image = Image.open(BytesIO(image_bytes))

        mime_map = {
            "JPEG": "image/jpeg",
            "PNG": "image/png",
            "WEBP": "image/webp",
            "GIF": "image/gif",
            "BMP": "image/bmp",
        }

        mime_type = mime_map.get(image.format, "image/jpeg")
        image.close()

    except Exception:
        mime_type = "image/jpeg"

    return detectar(image_bytes, mime_type)
