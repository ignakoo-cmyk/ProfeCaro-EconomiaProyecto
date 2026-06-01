# =============================================================================
# Ventana-Work Backend — Dockerfile
# =============================================================================
# Base: Python 3.12 slim
# Incluye dependencias del sistema necesarias para:
#   - psycopg2: libpq-dev (driver nativo de PostgreSQL)
#   - GeoAlchemy2: libgeos-dev, libproj-dev (operaciones geoespaciales)
# =============================================================================

FROM python:3.12-slim

# Evitar prompts interactivos durante la instalación de paquetes
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema para PostgreSQL y geoespacial
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgeos-dev \
    libproj-dev \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo dentro del contenedor
WORKDIR /code

# Copiar e instalar dependencias de Python primero (cache de Docker layers)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente de la aplicación
COPY . .

# Puerto expuesto (documentación, no binding real)
EXPOSE 8000

# Comando de inicio: uvicorn con hot-reload para desarrollo
# En producción, usar gunicorn + uvicorn workers sin --reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
