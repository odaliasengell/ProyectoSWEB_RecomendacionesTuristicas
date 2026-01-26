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
    
    # Integration with Equipo B
    equipo_b_url: str = "https://heuristically-farraginous-marquitta.ngrok-free.dev"
    equipo_b_local_url: str = "http://localhost:8082"
    equipo_b_secret_key: str = "integracion-turismo-2026-uleam"
    equipo_b_enabled: bool = True
    equipo_b_verify_ssl: bool = False

    # Cargar variables desde .env si existe, ignorando campos extra
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"  # Ignorar campos extra en el archivo .env
    )


settings = Settings()
