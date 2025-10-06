from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Recomendaciones Turísticas API"
    DATABASE_URL: str = "mysql+pymysql://user:password@localhost/recomendaciones_db"
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()