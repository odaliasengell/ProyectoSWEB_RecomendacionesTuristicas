from sqlalchemy import Column, Integer, String, Date
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    apellido = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    contraseña = Column(String(255), nullable=False)
    fecha_nacimiento = Column(Date, nullable=True)
    pais = Column(String(100), nullable=True)
