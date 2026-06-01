# Ventana-Work 🪟💼

Plataforma SaaS/Marketplace hiper-local para que estudiantes universitarios tomen micro-empleos de 1 a 3 horas en locales cercanos a su campus.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS v4, Zustand |
| **Backend** | FastAPI (Python), SQLAlchemy 2.0, Pydantic v2 |
| **Base de Datos** | PostgreSQL 16 + PostGIS 3.4 |
| **Containerización** | Docker Compose |

## Inicio Rápido

### 1. Clonar y configurar

```bash
cp .env.example .env
# Editar .env con tus valores si es necesario
```

### 2. Levantar Backend + DB con Docker

```bash
docker-compose up -d
```

Esto levanta:
- **PostgreSQL + PostGIS** en `localhost:5432`
- **FastAPI** en `localhost:8000`

Verificar:
- Health check: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Levantar Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en http://localhost:3000

## Estructura del Proyecto

```
ventana-work/
├── backend/
│   ├── app/
│   │   ├── main.py              # Entry point FastAPI
│   │   ├── config.py            # Settings (Pydantic BaseSettings)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/schema.py     # User, MicroJob, Transaction
│   │   ├── schemas/responses.py # Pydantic request/response schemas
│   │   ├── routers/jobs.py      # Endpoints REST
│   │   └── services/
│   │       ├── matching.py      # Lógica geoespacial PostGIS
│   │       └── qr_validation.py # Validación QR + transacciones
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (pages)
│   │   ├── components/
│   │   │   └── JobCard.tsx      # Tarjeta de micro-empleo
│   │   ├── lib/api.ts           # Cliente API tipado
│   │   └── stores/jobStore.ts   # Zustand state management
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/jobs/{id}/match` | Match geoespacial (500m) |
| `POST` | `/api/jobs/{id}/complete` | Validación QR → COMPLETED |

## Lógica Geoespacial

El matching usa PostGIS para encontrar estudiantes dentro de un radio de 500 metros:

```sql
-- ST_DWithin con geography cast calcula distancia real en metros
-- sobre el esferoide WGS84 (no euclidiana)
SELECT u.*, ST_Distance(u.location::geography, j.location::geography) as distance_m
FROM users u, micro_jobs j
WHERE j.id = :job_id
  AND u.user_type = 'STUDENT'
  AND u.is_available = TRUE
  AND ST_DWithin(u.location::geography, j.location::geography, 500)
ORDER BY u.reputation DESC;
```

## Licencia

Uso interno — Universidad Alberto Hurtado.
