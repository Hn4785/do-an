from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlalchemy.orm import Session

from app.models.session_model import SessionModel
from app.schemas.session_schema import (
    SessionConfig,
    SessionCreate,
    SessionResponse,
    SessionStatus,
    SessionSummary,
)


class SessionService:
    """
    Quản lý vòng đời phiên học:
    - Tạo / bắt đầu / tạm dừng / tiếp tục / kết thúc phiên
    - Lưu trữ và truy vấn phiên từ DB
    """

    # ─── CRUD ────────────────────────────────────────────────────────────────

    def create_session(
        self,
        db: Session,
        payload: SessionCreate,
    ) -> SessionModel:
        """Tạo phiên mới với trạng thái IDLE."""
        session = SessionModel(
            session_id=str(uuid.uuid4()),
            status=SessionStatus.IDLE,
            config=payload.config.model_dump(),
            started_at=datetime.now(timezone.utc),
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def start_session(self, db: Session, session_id: str) -> Optional[SessionModel]:
        """Chuyển trạng thái IDLE → RUNNING."""
        session = self._get_or_none(db, session_id)
        if session and session.status == SessionStatus.IDLE:
            session.status = SessionStatus.RUNNING
            db.commit()
            db.refresh(session)
        return session

    def pause_session(self, db: Session, session_id: str) -> Optional[SessionModel]:
        """Chuyển trạng thái RUNNING → PAUSED."""
        session = self._get_or_none(db, session_id)
        if session and session.status == SessionStatus.RUNNING:
            session.status = SessionStatus.PAUSED
            db.commit()
            db.refresh(session)
        return session

    def resume_session(self, db: Session, session_id: str) -> Optional[SessionModel]:
        """Chuyển trạng thái PAUSED → RUNNING."""
        session = self._get_or_none(db, session_id)
        if session and session.status == SessionStatus.PAUSED:
            session.status = SessionStatus.RUNNING
            db.commit()
            db.refresh(session)
        return session

    def end_session(self, db: Session, session_id: str) -> Optional[SessionModel]:
        """Kết thúc phiên: RUNNING / PAUSED → ENDED."""
        session = self._get_or_none(db, session_id)
        if session and session.status in (SessionStatus.RUNNING, SessionStatus.PAUSED):
            now = datetime.now(timezone.utc)
            session.status   = SessionStatus.ENDED
            session.ended_at = now
            session.duration_ms = int(
                (now - session.started_at).total_seconds() * 1000
            )
            db.commit()
            db.refresh(session)
        return session

    def mark_error(self, db: Session, session_id: str) -> Optional[SessionModel]:
        """Đánh dấu phiên lỗi."""
        session = self._get_or_none(db, session_id)
        if session:
            session.status = SessionStatus.ERROR
            db.commit()
            db.refresh(session)
        return session

    # ─── Query ───────────────────────────────────────────────────────────────

    def get_session(self, db: Session, session_id: str) -> Optional[SessionModel]:
        return self._get_or_none(db, session_id)

    def list_sessions(
        self,
        db: Session,
        limit: int = 20,
        offset: int = 0,
    ) -> list[SessionModel]:
        return (
            db.query(SessionModel)
            .order_by(SessionModel.started_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_active_session(self, db: Session) -> Optional[SessionModel]:
        """Lấy phiên đang RUNNING (nếu có)."""
        return (
            db.query(SessionModel)
            .filter(SessionModel.status == SessionStatus.RUNNING)
            .first()
        )

    # ─── Schema Conversion ───────────────────────────────────────────────────

    def to_response(self, session: SessionModel) -> SessionResponse:
        return SessionResponse(
            session_id=session.session_id,
            status=session.status,
            config=SessionConfig(**session.config),
            started_at=session.started_at,
            ended_at=session.ended_at,
            duration_ms=session.duration_ms,
        )

    def to_summary(
        self,
        session: SessionModel,
        total_frames: int = 0,
        total_blinks: int = 0,
        avg_blink_rate: float = 0.0,
        avg_stress_score: float = 0.0,
        peak_stress_score: float = 0.0,
        dominant_emotion: str = "neutral",
        total_alerts: int = 0,
    ) -> SessionSummary:
        return SessionSummary(
            session_id=session.session_id,
            duration_ms=session.duration_ms or 0,
            total_frames=total_frames,
            total_blinks=total_blinks,
            avg_blink_rate=avg_blink_rate,
            avg_stress_score=avg_stress_score,
            peak_stress_score=peak_stress_score,
            dominant_emotion=dominant_emotion,
            total_alerts=total_alerts,
            started_at=session.started_at,
            ended_at=session.ended_at or datetime.now(timezone.utc),
        )

    # ─── Private ─────────────────────────────────────────────────────────────

    def _get_or_none(self, db: Session, session_id: str) -> Optional[SessionModel]:
        return (
            db.query(SessionModel)
            .filter(SessionModel.session_id == session_id)
            .first()
        )


# Singleton instance
session_service = SessionService()
