import uuid

from fastapi import APIRouter, WebSocket

from app.websocket.ws_handler import WebSocketHandler
from app.websocket.ws_manager import WebSocketManager
from app.websocket.ws_processor import FrameProcessor


router = APIRouter()
manager = WebSocketManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    handler = WebSocketHandler(manager)
    await handler.handle(websocket, str(uuid.uuid4()))


__all__ = ["WebSocketManager", "WebSocketHandler", "FrameProcessor", "router"]
