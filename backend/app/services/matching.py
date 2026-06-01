"""
Ventana-Work — Servicio de Matching Geoespacial
==================================================
Implementa la lógica de búsqueda de estudiantes cercanos
a un MicroJob usando PostGIS.

Conceptos Geoespaciales:
  - SRID 4326 (WGS84): Sistema de coordenadas que usa grados (lat/lon).
  - Geography: Tipo de datos PostGIS que calcula distancias sobre
    el esferoide terrestre (en metros), no en un plano cartesiano.
  - ST_DWithin: Función que filtra geometrías dentro de un radio dado.
    Al usar geography, el radio es en metros.
  - ST_Distance: Calcula la distancia geodésica entre dos puntos.
    Con geography, retorna metros. Usa el esferoide WGS84 por defecto.
  - Índice GiST: Índice espacial que ST_DWithin aprovecha para
    no hacer un full table scan (rendimiento O(log n) vs O(n)).

Flujo del Matching:
  1. Se obtiene el MicroJob por job_id.
  2. Se valida que esté en estado PUBLISHED (solo se matchean jobs publicados).
  3. Se ejecuta la query geoespacial contra la tabla de users.
  4. Se filtran solo STUDENT, is_available=True, dentro del radio.
  5. Se ordenan por reputación descendente (los mejores primero).
"""

import uuid

from geoalchemy2.functions import ST_DWithin, ST_Distance
from sqlalchemy import and_, cast
from sqlalchemy.orm import Session

from app.config import settings
from app.models.schema import JobStatus, MicroJob, User, UserType


class MatchingServiceError(Exception):
    """Excepción base para errores del servicio de matching."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def find_nearby_students(
    db: Session,
    job_id: uuid.UUID,
    radius_meters: int | None = None,
) -> tuple[MicroJob, list[tuple[User, float]]]:
    """
    Busca estudiantes disponibles dentro de un radio del MicroJob.

    Lógica Matemática (PostGIS):
    ─────────────────────────────
    La query utiliza ST_DWithin con cast a geography para calcular
    distancias reales en metros sobre la superficie de la Tierra.
    
    Sin el cast a geography, ST_DWithin interpretaría las coordenadas
    como planas y el radio estaría en grados (inútil para distancias reales).
    
    Con geography::use_spheroid=true (default), PostGIS calcula la
    distancia geodésica usando el esferoide WGS84, que tiene:
      - Radio ecuatorial: 6,378,137 m
      - Aplanamiento: 1/298.257223563
    
    Esto da precisión submétrica para distancias cortas (< 1 km),
    que es exactamente nuestro caso de uso (radio de 500 m).

    SQL equivalente:
    ```sql
    SELECT 
        u.*,
        ST_Distance(u.location::geography, j.location::geography) as distance_m
    FROM users u, micro_jobs j
    WHERE j.id = :job_id
      AND u.user_type = 'STUDENT'
      AND u.is_available = TRUE
      AND ST_DWithin(
          u.location::geography,
          j.location::geography,
          :radius_meters
      )
    ORDER BY u.reputation DESC;
    ```

    Args:
        db: Session de SQLAlchemy.
        job_id: UUID del MicroJob.
        radius_meters: Radio de búsqueda en metros. Default: config.

    Returns:
        Tupla de (MicroJob, lista de tuplas (User, distancia_metros)).

    Raises:
        MatchingServiceError: Si el job no existe o no está en estado PUBLISHED.
    """
    radius = radius_meters or settings.MAX_MATCH_RADIUS_METERS

    # --- 1. Obtener el MicroJob ---
    job = db.query(MicroJob).filter(MicroJob.id == job_id).first()

    if job is None:
        raise MatchingServiceError(
            f"MicroJob con id '{job_id}' no encontrado.",
            status_code=404,
        )

    # --- 2. Validar estado ---
    if job.status != JobStatus.PUBLISHED:
        raise MatchingServiceError(
            f"Solo se pueden matchear jobs en estado PUBLISHED. "
            f"Estado actual: {job.status.value}.",
            status_code=400,
        )

    # --- 3. Query Geoespacial ---
    # ST_DWithin(geog_a, geog_b, distance_meters):
    #   Retorna TRUE si la distancia entre geog_a y geog_b es <= distance_meters.
    #   El cast ::geography convierte de geometry (grados) a geography (metros).
    #
    # ST_Distance(geog_a, geog_b):
    #   Retorna la distancia en metros entre los dos puntos.
    #   Se usa como columna calculada para incluir en la respuesta.
    results = (
        db.query(
            User,
            ST_Distance(
                User.location.cast_to("geography"),
                job.location.cast_to("geography"),
            ).label("distance_meters"),
        )
        .filter(
            and_(
                User.user_type == UserType.STUDENT,
                User.is_available.is_(True),
                User.location.isnot(None),
                ST_DWithin(
                    User.location.cast_to("geography"),
                    job.location.cast_to("geography"),
                    radius,
                ),
            )
        )
        .order_by(User.reputation.desc())
        .all()
    )

    return job, results
