from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class SessionStatus(str, Enum):
    IDLE      = "idle"
    RUNNING   = "running"
    PAUSED    = "paused"
    ENDED     = "ended"
    ERROR     = "error"


class SessionConfig(BaseModel):
    """Cấu hình phiên từ client (WsSessionConfig)"""
    target_fps:            int   = Field(default=10,    ge=1, le=30)
    resolution:            str   = Field(default="480p", pattern="^(480p|720p|1080p)$")
    enable_blink:          bool  = True
    enable_emotion:        bool  = True
    enable_muscle_tension: bool  = True
    enable_head_pose:      bool  = True
    stress_alert_threshold: float = Field(default=70.0, ge=0, le=100)
    blink_alert_threshold:  float = Field(default=10.0, ge=0)


class SessionCreate(BaseModel):
    config: SessionConfig = Field(default_factory=SessionConfig)


class SessionResponse(BaseModel):
    session_id:  str
    status:      SessionStatus
    config:      SessionConfig
    started_at:  datetime
    ended_at:    Optional[datetime] = None
    duration_ms: Optional[int]      = None

    model_config = {"from_attributes": True}


class SessionSummary(BaseModel):
    """Tổng kết phiên sau khi kết thúc"""
    session_id:       str
    duration_ms:      int
    total_frames:     int
    total_blinks:     int
    avg_blink_rate:   float   # lần/phút
    avg_stress_score: float   # 0–100
    peak_stress_score: float
    dominant_emotion: str
    total_alerts:     int
    started_at:       datetime
    ended_at:         datetime
