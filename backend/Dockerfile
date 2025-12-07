# Imagen base de Python
FROM python:3.11-slim

# Evitar que Python genere pyc y usar bufferado
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Crear directorio de la app
WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para aprovechar cache de Docker
COPY requirementsDocker.txt /app/requirements.txt

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la app
COPY . /app

# Exponer el puerto por donde corre Flask
EXPOSE 5000

# Comando por defecto para arrancar la app
# Si tu app usa otro archivo o nombre de aplicación, ajusta FLASK_APP
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5000

CMD ["flask", "run"]
