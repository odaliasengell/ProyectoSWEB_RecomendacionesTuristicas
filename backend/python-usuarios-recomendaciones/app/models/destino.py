from sqlalchemy import Column, Integer, String
from database import Base

class Destino(Base):
    __tablename__ = "destinos"
    id_destino = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    descripcion = Column(String)
    ubicacion = Column(String)
    ruta = Column(String)
