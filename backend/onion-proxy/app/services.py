import httpx
from .models import Node, NodeList, OnionRequest
from .config import settings

async def get_available_nodes() -> NodeList:
    """Fetch available Tor nodes from DirectoryAuthorityProxy."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{settings.DIRECTORY_PROXY_URL}/nodes")
        response.raise_for_status()
        return NodeList(**response.json())

async def forward_onion_package(request: OnionRequest) -> str:
    """Forward the onion package to EntryProxy."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.ENTRY_PROXY_URL}/relay",
            json=request.dict()
        )
        response.raise_for_status()
        return response.text
