"""
OpenAI Adapter - ChatGPT / GPT-4
"""
from typing import Dict, List, Any, Optional
from openai import AsyncOpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL
from .llm_provider import LLMProvider, LLMResponse, ToolCall
import json
import base64


class OpenAIAdapter(LLMProvider):
    """Adapter para OpenAI (ChatGPT, GPT-4)"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL

    async def generate_response(
        self,
        messages: List[Dict],
        tools: List[Dict] = None,
        context: Dict = None
    ) -> LLMResponse:
        """Generar respuesta con soporte para function calling"""
        try:
            # Preparar tools en formato OpenAI
            openai_tools = None
            if tools:
                openai_tools = self._convert_tools_to_openai(tools)
            
            # Llamar a OpenAI
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=openai_tools,
                tool_choice="auto" if openai_tools else None,
                temperature=0.7
            )
            
            # Procesar respuesta
            choice = response.choices[0]
            text = choice.message.content or ""
            tool_calls = []
            
            # Extraer tool calls
            if choice.message.tool_calls:
                for tool_call in choice.message.tool_calls:
                    try:
                        params = json.loads(tool_call.function.arguments)
                        tool_calls.append(
                            ToolCall(
                                tool_name=tool_call.function.name,
                                parameters=params
                            )
                        )
                    except json.JSONDecodeError:
                        continue
            
            return LLMResponse(
                text=text,
                tool_calls=tool_calls,
                tokens_used=response.usage.total_tokens if response.usage else 0
            )
        except Exception as e:
            print(f"Error en OpenAIAdapter.generate_response: {e}")
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
            messages = conversation_history or []
            messages.append({"role": "user", "content": message})
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"

    async def process_image(
        self,
        image_data: bytes,
        prompt: str,
        image_format: str = "jpeg"
    ) -> str:
        """Procesar imagen con visión de OpenAI"""
        try:
            # Convertir imagen a base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/{image_format};base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ]
            )
            
            return response.choices[0].message.content
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
                
                # Enviar texto a OpenAI
                response = await self.chat_completion(
                    f"{prompt}\n\nDocumento:\n{text}"
                )
                return response
            else:
                return "Formato no soportado"
        except Exception as e:
            return f"Error procesando documento: {str(e)}"

    def _convert_tools_to_openai(self, tools: List[Dict]) -> List[Dict]:
        """Convertir tools a formato OpenAI function calling"""
        openai_tools = []
        for tool in tools:
            openai_tools.append({
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool.get("parameters", {})
                }
            })
        return openai_tools
