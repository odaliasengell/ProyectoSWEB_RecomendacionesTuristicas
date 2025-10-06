import httpx
from typing import Optional, Dict, Any

class HTTPClient:
    def __init__(self, base_url: str = "", timeout: int = 10):
        self.base_url = base_url
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)

    async def get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        async with self.client as client:
            response = await client.get(f"{self.base_url}{url}", params=params)
            response.raise_for_status()
            return response.json()

    async def post(self, url: str, json: Dict[str, Any]) -> Dict[str, Any]:
        async with self.client as client:
            response = await client.post(f"{self.base_url}{url}", json=json)
            response.raise_for_status()
            return response.json()

    async def close(self):
        await self.client.aclose()