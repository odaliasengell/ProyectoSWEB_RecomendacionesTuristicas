from sqlalchemy import Column, Integer, String
from app.database import Base

class Destino(Base):
    __tablename__ = "destinos"
    id_destino = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255))
    descripcion = Column(String(1000))
    ubicacion = Column(String(255))
    ruta = Column(String(500))
