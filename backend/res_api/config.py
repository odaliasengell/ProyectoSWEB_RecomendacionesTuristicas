"""
Configuraciones del módulo res_api (valores por defecto / stubs).
Reemplazar o enlazar con la configuración global del proyecto cuando se integre.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuraciones cargadas desde variables de entorno o `.env`.

    Usa `SettingsConfigDict` para admitir la carga desde un archivo `.env` en
    entornos de desarrollo locales.
    """
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "turismo_db"
    secret_key: str = "changeme"
    algorithm: str = "HS256"

    # Cargar variables desde .env si existe
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
