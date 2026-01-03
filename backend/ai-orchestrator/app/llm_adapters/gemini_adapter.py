"""
Gemini Adapter - Google Gemini
"""
import google.generativeai as genai
from typing import Dict, List, Any, Optional
from config import GEMINI_API_KEY
from .llm_provider import LLMProvider, LLMResponse, ToolCall
import json
import base64


class GeminiAdapter(LLMProvider):
    """Adapter para Google Gemini"""

    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        self.vision_model = genai.GenerativeModel('gemini-pro-vision')

    async def generate_response(
        self,
        messages: List[Dict],
        tools: List[Dict] = None,
        context: Dict = None
    ) -> LLMResponse:
        """Generar respuesta con soporte para tools"""
        try:
            # Convertir mensajes a formato Gemini
            history = []
            for msg in messages[:-1]:  # Excluir último mensaje
                history.append({
                    "role": "user" if msg["role"] == "user" else "model",
                    "parts": [msg.get("content", "")]
                })
            
            # Iniciar chat
            chat = self.model.start_chat(history=history)
            
            # Mensaje actual
            current_msg = messages[-1]["content"] if messages else ""
            
            # Si hay tools, incluir instrucciones
            if tools:
                tools_prompt = self._format_tools_prompt(tools)
                current_msg = f"{current_msg}\n\n{tools_prompt}"
            
            # Enviar mensaje
            response = chat.send_message(current_msg)
            
            # Parsear respuesta
            text = response.text
            tool_calls = self._extract_tool_calls(text, tools)
            
            return LLMResponse(
                text=text,
                tool_calls=tool_calls,
                tokens_used=0  # Gemini API no retorna token count fácilmente
            )
        except Exception as e:
            print(f"Error en GeminiAdapter.generate_response: {e}")
            return LLMResponse(
                text="Error procesando tu solicitud",
                tool_calls=[]
            )

    async def chat_completion(
        self,
        message: str,
        conversation_history: List[Dict] = None
    ) -> str:
        """Chat simple"""
        try:
            chat = self.model.start_chat()
            response = chat.send_message(message)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    async def process_image(
        self,
        image_data: bytes,
        prompt: str,
        image_format: str = "jpeg"
    ) -> str:
        """Procesar imagen con Gemini Vision"""
        try:
            from PIL import Image
            import io
            
            # Convertir bytes a imagen
            img = Image.open(io.BytesIO(image_data))
            
            # Enviar a Gemini con prompt
            response = self.vision_model.generate_content(
                [prompt, img]
            )
            
            return response.text
        except Exception as e:
            return f"Error procesando imagen: {str(e)}"

    async def process_document(
        self,
        document_data: bytes,
        document_type: str,
        prompt: str
    ) -> str:
        """Procesar PDF"""
        try:
            if document_type.lower() == "pdf":
                import PyPDF2
                import io
                
                pdf = PyPDF2.PdfReader(io.BytesIO(document_data))
                text = ""
                for page in pdf.pages:
                    text += page.extract_text()
                
                # Enviar texto a Gemini
                response = await self.chat_completion(
                    f"{prompt}\n\nDocumento:\n{text}"
                )
                return response
            else:
                return "Formato no soportado"
        except Exception as e:
            return f"Error procesando documento: {str(e)}"

    def _format_tools_prompt(self, tools: List[Dict]) -> str:
        """Formatear tools como instrucciones para el modelo"""
        prompt = "Herramientas disponibles:\n\n"
        for tool in tools:
            prompt += f"- {tool['name']}: {tool['description']}\n"
            if "parameters" in tool:
                prompt += f"  Parámetros: {json.dumps(tool['parameters'], indent=2)}\n"
        
        prompt += "\nSi necesitas usar una herramienta, responde con formato JSON:\n"
        prompt += '{"tool": "nombre_herramienta", "params": {...}}'
        
        return prompt

    def _extract_tool_calls(self, text: str, tools: List[Dict] = None) -> List[ToolCall]:
        """Extraer llamadas a herramientas de la respuesta"""
        tool_calls = []
        try:
            # Buscar JSON en la respuesta
            import re
            json_pattern = r'\{.*?"tool".*?\}'
            matches = re.findall(json_pattern, text, re.DOTALL)
            
            for match in matches:
                try:
                    data = json.loads(match)
                    if "tool" in data and "params" in data:
                        tool_calls.append(
                            ToolCall(
                                tool_name=data["tool"],
                                parameters=data["params"]
                            )
                        )
                except json.JSONDecodeError:
                    continue
        except Exception as e:
            print(f"Error extrayendo tool calls: {e}")
        
        return tool_calls
