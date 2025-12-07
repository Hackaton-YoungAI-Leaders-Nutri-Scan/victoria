from google.cloud import storage
import logging
import os

logging.basicConfig(level=logging.INFO)

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
