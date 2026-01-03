"""
Configuración del AI Orchestrator
"""
import os
from dotenv import load_dotenv

load_dotenv()

# LLM Provider
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")

# MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/ai_service")

# Auth Service
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:3001")

# REST API
REST_API_URL = os.getenv("REST_API_URL", "http://localhost:8000")

# Service
PORT = int(os.getenv("PORT", 8002))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

# Multimodal
ENABLE_MULTIMODAL = os.getenv("ENABLE_MULTIMODAL", "true").lower() == "true"
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", "10485760"))  # 10MB
SUPPORTED_FORMATS = os.getenv("SUPPORTED_FORMATS", "jpg,jpeg,png,pdf,txt").split(",")

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
