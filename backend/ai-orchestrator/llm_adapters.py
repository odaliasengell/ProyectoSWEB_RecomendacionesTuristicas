"""
LLM Adapters - Patrón Strategy para proveedores de IA
Permite intercambiar entre Gemini, OpenAI, etc. sin cambiar lógica de negocio
"""
from abc import ABC, abstractmethod
from enum import Enum
from typing import List, Dict, Any, Optional
import os
import json


class LLMProvider(Enum):
    GEMINI = "gemini"
    GROQ = "groq"


class LLMAdapter(ABC):
    """Interface abstracta para adaptadores LLM"""
    
    @abstractmethod
    async def generate(self, messages: List[Dict[str, str]], tools: Optional[List[Dict]] = None) -> str:
        """Generar respuesta del modelo"""
        pass
    
    @abstractmethod
    def wants_to_use_tool(self, response: str) -> bool:
        """Verificar si la respuesta indica uso de herramientas"""
        pass
    
    @abstractmethod
    def is_configured(self) -> bool:
        """Verificar si el adaptador está configurado"""
        pass


class GeminiAdapter(LLMAdapter):
    """Adaptador para Google Gemini"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        if self.api_key:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            # gemini-2.5-flash tiene 500 RPD vs 20 RPD de 2.5-flash-lite
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.model)
    
    async def generate(self, messages: List[Dict[str, str]], tools: Optional[List[Dict]] = None) -> str:
        if not self.is_configured():
            raise Exception("Gemini no está configurado. Configura GEMINI_API_KEY en .env")
        
        try:
            # Convertir mensajes a formato Gemini
            prompt = self._convert_messages_to_prompt(messages)
            
            # Agregar información de herramientas si están disponibles
            if tools:
                tools_desc = "\n\n🔧 HERRAMIENTAS DISPONIBLES (DEBES USARLAS SIEMPRE):\n"
                for tool in tools:
                    tools_desc += f"- {tool['name']}: {tool['description']}\n"
                    tools_desc += f"  Parámetros: {tool.get('parameters', {})}\n"
                
                tools_desc += """
⚠️ IMPORTANTE: Cuando el usuario pida buscar, consultar, crear o CANCELAR algo, DEBES usar las herramientas.
NO inventes información. Solo usa los datos reales del sistema.

Formato para usar herramientas:
USE_TOOL:nombre_herramienta:{"parametro": "valor"}

FLUJO INTELIGENTE:
- Si el usuario dice "quiero cancelar una reserva" SIN dar ID → Primero usa mis_reservas para mostrarle sus reservas
- Si el usuario dice "quiero reservar" SIN especificar destino → Primero usa buscar_destinos para mostrarle opciones
- Si el usuario da el ID específico → Usa la herramienta directamente

🧠 IMPORTANTE PARA CANCELAR:
- Cuando muestres reservas, RECUERDA los IDs internamente
- Si el usuario dice "cancelar la 1" o "la primera" → Usa el ID de la reserva #1 que mostraste
- Si dice "cancelar la del tour Los Frailes" → Usa el ID de esa reserva
- NUNCA pidas al usuario el ID técnico, usa el número o nombre del tour

Ejemplos:
- Usuario: "busca destinos de playa"
  Tú: USE_TOOL:buscar_destinos:{"query": "playa", "categoria": "playa"}
  
- Usuario: "quiero hacer una reserva"
  Tú: USE_TOOL:buscar_destinos:{"query": ""}
  (Luego pregunta qué destino le interesa)

- Usuario: "quiero cancelar mi reserva"
  Tú: USE_TOOL:mis_reservas:{}
  (Muestra lista numerada: 1. Tour X, 2. Tour Y)

- Usuario: "cancela la 1" (después de ver lista)
  Tú: USE_TOOL:cancelar_reserva:{"reserva_id": "[ID de la reserva #1]"}

- Usuario: "cancela la del tour Los Frailes"
  Tú: USE_TOOL:cancelar_reserva:{"reserva_id": "[ID de esa reserva]"}
"""
                prompt = tools_desc + "\n\n" + prompt
            
            # Generar respuesta
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            raise Exception(f"Error en Gemini: {str(e)}")
    
    def wants_to_use_tool(self, response: str) -> bool:
        return "USE_TOOL:" in response
    
    def _convert_messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Convertir lista de mensajes a prompt único"""
        prompt_parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            if role == "user":
                prompt_parts.append(f"Usuario: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Asistente: {content}")
            elif role == "system":
                prompt_parts.append(f"Sistema: {content}")
            elif role == "tool":
                prompt_parts.append(f"Herramienta: {content}")
        
        return "\n\n".join(prompt_parts)


class OpenAIAdapter(LLMAdapter):
    """Adaptador para OpenAI GPT"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                from openai import AsyncOpenAI
                self.client = AsyncOpenAI(api_key=self.api_key)
            except ImportError:
                pass
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.client)
    
    async def generate(self, messages: List[Dict[str, str]], tools: Optional[List[Dict]] = None) -> str:
        if not self.is_configured():
            raise Exception("OpenAI no está configurado. Configura OPENAI_API_KEY en .env")
        
        try:
            # Preparar mensajes
            formatted_messages = []
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                
                # OpenAI usa 'system', 'user', 'assistant'
                if role in ["system", "user", "assistant"]:
                    formatted_messages.append({"role": role, "content": content})
                elif role == "tool":
                    formatted_messages.append({"role": "system", "content": f"Resultado de herramienta: {content}"})
            
            # Agregar información de herramientas
            if tools:
                tools_message = "Herramientas disponibles:\n"
                for tool in tools:
                    tools_message += f"- {tool['name']}: {tool['description']}\n"
                tools_message += "\nPara usar una herramienta, responde con: USE_TOOL:{nombre_herramienta}:{parametros_json}"
                formatted_messages.insert(0, {"role": "system", "content": tools_message})
            
            # Llamar a OpenAI
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=formatted_messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Error en OpenAI: {str(e)}")
    
    def wants_to_use_tool(self, response: str) -> bool:
        return "USE_TOOL:" in response


class GroqAdapter(LLMAdapter):
    """Adaptador para Groq (gratis y rápido)"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                from groq import AsyncGroq
                self.client = AsyncGroq(api_key=self.api_key)
            except ImportError:
                # Si no está instalado, usar httpx directamente
                self.client = "httpx"
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.client)
    
    async def generate(self, messages: List[Dict[str, str]], tools: Optional[List[Dict]] = None) -> str:
        if not self.is_configured():
            raise Exception("Groq no está configurado. Configura GROQ_API_KEY en .env")
        
        try:
            # Preparar mensajes
            formatted_messages = []
            
            # Agregar herramientas como system message
            if tools:
                tools_message = """🔧 ERES UN ASISTENTE DE TURISMO CON ACCESO A HERRAMIENTAS REALES.

HERRAMIENTAS DISPONIBLES:
"""
                for tool in tools:
                    tools_message += f"- {tool['name']}: {tool['description']}\n"
                    tools_message += f"  Parámetros: {tool.get('parameters', {})}\n"
                
                tools_message += """
🚨 REGLAS OBLIGATORIAS:
1. Si el usuario quiere CREAR una reserva → USA: USE_TOOL:crear_reserva:{"destino_id": "...", "fecha": "YYYY-MM-DD", "personas": N}
2. Si el usuario quiere BUSCAR destinos → USA: USE_TOOL:buscar_destinos:{"query": "..."}
3. Si el usuario quiere VER una reserva → USA: USE_TOOL:ver_reserva:{"reserva_id": "..."}
4. Si el usuario quiere BUSCAR guías → USA: USE_TOOL:buscar_guias:{"especialidad": "..."}
5. Si el usuario quiere ESTADÍSTICAS → USA: USE_TOOL:estadisticas_ventas:{}
6. Si el usuario quiere CANCELAR una reserva → USA: USE_TOOL:cancelar_reserva:{"reserva_id": "..."}
7. Si el usuario dice "mis reservas" o "quiero cancelar" SIN ID → USA: USE_TOOL:mis_reservas:{}

🧠 FLUJO INTELIGENTE:
- "quiero cancelar mi reserva" (sin ID) → Primero usa mis_reservas, luego pregunta cuál cancelar
- "quiero reservar" (sin destino) → Primero usa buscar_destinos, luego pregunta cuál elegir

⛔ NUNCA digas "no puedo hacer eso" o "no tengo acceso". TÚ SÍ PUEDES porque tienes las herramientas.
⛔ NUNCA inventes información. USA las herramientas para obtener datos REALES.

✅ Responde SOLO con el formato: USE_TOOL:nombre:{"param": "valor"}
"""
                formatted_messages.append({"role": "system", "content": tools_message})
            
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                
                if role in ["system", "user", "assistant"]:
                    formatted_messages.append({"role": role, "content": content})
                elif role == "tool":
                    formatted_messages.append({"role": "system", "content": f"Resultado: {content}"})
            
            # Llamar a Groq
            if self.client == "httpx":
                # Fallback con httpx
                import httpx
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json={
                            "model": "llama-3.3-70b-versatile",
                            "messages": formatted_messages,
                            "temperature": 0.5,
                            "max_tokens": 1000
                        }
                    )
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
            else:
                # Usar SDK oficial
                response = await self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=formatted_messages,
                    temperature=0.5,
                    max_tokens=1000
                )
                return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Error en Groq: {str(e)}")
    
    def wants_to_use_tool(self, response: str) -> bool:
        return "USE_TOOL:" in response


class LLMAdapterFactory:
    """Factory para crear adaptadores LLM"""
    
    def __init__(self):
        self._adapters = {
            LLMProvider.GEMINI: GeminiAdapter(),
            LLMProvider.GROQ: GroqAdapter()
        }
    
    def get_adapter(self, provider: LLMProvider) -> LLMAdapter:
        """Obtener adaptador según proveedor"""
        adapter = self._adapters.get(provider)
        if not adapter:
            raise ValueError(f"Proveedor no soportado: {provider}")
        return adapter
    
    def is_provider_configured(self, provider: LLMProvider) -> bool:
        """Verificar si un proveedor está configurado"""
        adapter = self._adapters.get(provider)
        return adapter.is_configured() if adapter else False
