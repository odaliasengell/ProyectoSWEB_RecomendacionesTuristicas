from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from app.database import Base
from datetime import datetime

class Destino(Base):
    __tablename__ = "destinos"
    __table_args__ = {'extend_existing': True}
    
    id_destino = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255))
    descripcion = Column(String(1000))
    ubicacion = Column(String(255))
    ruta = Column(String(500))
    # Nuevos campos para administración
    provincia = Column(String(100))
    ciudad = Column(String(100))
    categoria = Column(String(100))
    calificacion_promedio = Column(Float, default=0.0)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
