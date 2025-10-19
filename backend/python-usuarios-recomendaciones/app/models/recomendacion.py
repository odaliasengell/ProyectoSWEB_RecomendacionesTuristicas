from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class Recomendacion(Base):
    __tablename__ = "recomendaciones"
    id_recomendacion = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    calificacion = Column(Integer)
    comentario = Column(String(1000))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
