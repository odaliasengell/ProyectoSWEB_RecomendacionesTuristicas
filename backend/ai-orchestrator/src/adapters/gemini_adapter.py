"""
Adapter para Google Gemini
Autor: Odalis Senge
"""

from typing import Dict, Any, List, Optional
from .llm_provider import LLMProvider
import google.generativeai as genai
import os


class GeminiAdapter(LLMProvider):
    """Adapter para Google Gemini"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY no configurada")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.vision_model = genai.GenerativeModel('gemini-pro-vision')
    
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generar respuesta con Gemini"""
        # Convertir formato de mensajes
        prompt = self._build_prompt(messages)
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature
                )
            )
            
            return {
                "content": response.text,
                "provider": "gemini",
                "tool_calls": []  # Gemini Pro no soporta function calling directamente
            }
        except Exception as e:
            return {
                "error": str(e),
                "provider": "gemini"
            }
    
    async def process_multimodal_input(
        self,
        text: str,
        image_data: Optional[bytes] = None,
        pdf_data: Optional[bytes] = None
    ) -> str:
        """Procesar entrada multimodal"""
        if image_data:
            # Procesar imagen
            import PIL.Image
            import io
            image = PIL.Image.open(io.BytesIO(image_data))
            
            response = self.vision_model.generate_content([text, image])
            return response.text
        
        # Solo texto
        response = self.model.generate_content(text)
        return response.text
    
    def get_provider_name(self) -> str:
        return "gemini"
    
    def _build_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Construir prompt desde historial de mensajes"""
        prompt_parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            if role == "system":
                prompt_parts.append(f"Instrucciones del sistema: {content}")
            elif role == "user":
                prompt_parts.append(f"Usuario: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Asistente: {content}")
        
        return "\n\n".join(prompt_parts)
