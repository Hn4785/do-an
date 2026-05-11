from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.schemas.session_schema import (
    SessionCreate,
    SessionResponse,
    SessionSummary,
    SessionStatus,
    SessionConfig,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])

# ─── In-memory store (thay bằng DB thực tế sau) ─────────────────────────────
_sessions: dict[str, dict] = {}


def _get_session_or_404(session_id: str) -> dict:
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' không tồn tại")
    return session


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("", summary="Danh sách phiên đã lưu")
async def list_sessions(
    page:      int = Query(default=1,  ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    from_date: Optional[float] = Query(default=None, description="Unix ms"),
    to_date:   Optional[float] = Query(default=None, description="Unix ms"),
    sort_by:   str = Query(default="started_at", pattern="^(started_at|duration_ms|avg_stress_score)$"),
    order:     str = Query(default="desc", pattern="^(asc|desc)$"),
):
    """
    GET /sessions — Trả về danh sách phiên có phân trang.
    """
    items = list(_sessions.values())

    # Lọc theo khoảng thời gian
    if from_date:
        items = [s for s in items if s["started_at"].timestamp() * 1000 >= from_date]
    if to_date:
        items = [s for s in items if s["started_at"].timestamp() * 1000 <= to_date]

    # Sắp xếp
    reverse = order == "desc"
    items.sort(key=lambda s: s.get(sort_by, 0), reverse=reverse)

    # Phân trang
    total = len(items)
    start = (page - 1) * page_size
    end   = start + page_size
    page_items = items[start:end]

    return {
        "success": True,
        "data": {
            "items": page_items,
            "pagination": {
                "page":        page,
                "page_size":   page_size,
                "total":       total,
                "total_pages": max(1, -(-total // page_size)),  # ceil division
            },
        },
    }


@router.get("/{session_id}", response_model=SessionResponse, summary="Chi tiết phiên")
async def get_session(session_id: str) -> SessionResponse:
    """
    GET /sessions/:id — Trả về thông tin chi tiết 1 phiên.
    """
    session = _get_session_or_404(session_id)
    return SessionResponse(**session)


@router.delete("/{session_id}", summary="Xóa phiên")
async def delete_session(session_id: str):
    """
    DELETE /sessions/:id — Xóa phiên khỏi store.
    """
    _get_session_or_404(session_id)
    del _sessions[session_id]
    return {
        "success": True,
        "data": {"deleted": True},
        "message": f"Session '{session_id}' đã được xóa",
    }


# ─── Internal helpers (dùng từ WebSocket handler) ────────────────────────────

def create_session_internal(session_id: str, config: SessionConfig) -> dict:
    """Tạo session mới — gọi từ WebSocket khi nhận start_session"""
    now = datetime.now(timezone.utc)
    session = {
        "session_id":  session_id,
        "status":      SessionStatus.RUNNING,
        "config":      config,
        "started_at":  now,
        "ended_at":    None,
        "duration_ms": None,
    }
    _sessions[session_id] = session
    return session


def end_session_internal(session_id: str) -> Optional[dict]:
    """Kết thúc session — gọi từ WebSocket khi nhận stop_session"""
    session = _sessions.get(session_id)
    if not session:
        return None

    now = datetime.now(timezone.utc)
    duration_ms = int(
        (now - session["started_at"]).total_seconds() * 1000
    )
    session.update({
        "status":      SessionStatus.ENDED,
        "ended_at":    now,
        "duration_ms": duration_ms,
    })
    return session
