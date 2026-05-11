from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.ws_manager import WebSocketManager
from app.websocket.ws_handler import WebSocketHandler
from app.websocket.ws_processor import FrameProcessor

# ===== Tạo router WebSocket =====
router = APIRouter()
manager = WebSocketManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    handler = WebSocketHandler(websocket, manager)
    await handler.handle()

__all__ = ["WebSocketManager", "WebSocketHandler", "FrameProcessor", "router"]
