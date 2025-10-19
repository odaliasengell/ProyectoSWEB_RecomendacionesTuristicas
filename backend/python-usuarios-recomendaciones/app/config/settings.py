from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Recomendaciones Turísticas API"
    DATABASE_URL: str = "sqlite:///./recomendaciones_dev.db"
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"  # Ignorar campos extra del .env
    )

settings = Settings()