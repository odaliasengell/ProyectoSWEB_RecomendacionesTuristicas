"""
Configuración del Payment Service
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_USERNAME = os.getenv("DB_USERNAME", "paymentuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "paymentpassword")
DB_NAME = os.getenv("DB_NAME", "payment_service")
DB_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Payment Provider
PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "mock")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY")
MERCADOPAGO_ACCESS_TOKEN = os.getenv("MERCADOPAGO_ACCESS_TOKEN")

# Redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 1))

# n8n
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/payments")
N8N_WEBHOOK_SECRET = os.getenv("N8N_WEBHOOK_SECRET", "n8n-secret")

# Auth Service
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:3001")

# Service
PORT = int(os.getenv("PORT", 8001))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
