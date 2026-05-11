import asyncio
import logging
from typing import Dict, Optional
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Quản lý tất cả WebSocket connections đang hoạt động.
    Key: session_id → WebSocket instance
    """

    def __init__(self):
        self._connections: Dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()

    # ─── Connect / Disconnect ────────────────────────────────────────────────

    async def connect(self, session_id: str, websocket: WebSocket) -> None:
        """Chấp nhận kết nối và lưu vào registry."""
        await websocket.accept()
        async with self._lock:
            self._connections[session_id] = websocket
        logger.info(f"[WS] Connected: session_id={session_id} | total={self.count}")

    async def disconnect(self, session_id: str) -> None:
        """Xóa kết nối khỏi registry (không raise nếu không tồn tại)."""
        async with self._lock:
            self._connections.pop(session_id, None)
        logger.info(f"[WS] Disconnected: session_id={session_id} | total={self.count}")

    # ─── Send ────────────────────────────────────────────────────────────────

    async def send_json(self, session_id: str, data: dict) -> bool:
        """
        Gửi JSON tới 1 client cụ thể.
        Returns True nếu gửi thành công, False nếu không tìm thấy hoặc lỗi.
        """
        ws = self._connections.get(session_id)
        if ws is None:
            logger.warning(f"[WS] send_json: session_id={session_id} not found")
            return False
        try:
            await ws.send_json(data)
            return True
        except Exception as e:
            logger.error(f"[WS] send_json error for {session_id}: {e}")
            await self.disconnect(session_id)
            return False

    async def broadcast_json(self, data: dict) -> None:
        """Gửi JSON tới tất cả clients đang kết nối."""
        disconnected = []
        for session_id, ws in list(self._connections.items()):
            try:
                await ws.send_json(data)
            except Exception:
                disconnected.append(session_id)

        for sid in disconnected:
            await self.disconnect(sid)

    # ─── Helpers ─────────────────────────────────────────────────────────────

    def get_websocket(self, session_id: str) -> Optional[WebSocket]:
        return self._connections.get(session_id)

    def is_connected(self, session_id: str) -> bool:
        return session_id in self._connections

    @property
    def count(self) -> int:
        return len(self._connections)

    @property
    def active_sessions(self) -> list[str]:
        return list(self._connections.keys())
