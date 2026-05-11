from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class AlertType(str, Enum):
    STRESS_HIGH       = "stress_high"
    STRESS_CRITICAL   = "stress_critical"
    BLINK_LOW         = "blink_low"
    BLINK_HIGH        = "blink_high"
    FACE_LOST         = "face_lost"
    HEAD_POSE_EXTREME = "head_pose_extreme"
    EMOTION_NEGATIVE  = "emotion_negative"
    NO_BLINK_LONG     = "no_blink_long"
    JAW_TENSION_HIGH  = "jaw_tension_high"


class AlertSeverity(str, Enum):
    INFO     = "info"
    WARNING  = "warning"
    CRITICAL = "critical"


class AlertData(BaseModel):
    """Dữ liệu đính kèm theo alert"""
    current_value: Optional[float] = None
    threshold:     Optional[float] = None
    emotion:       Optional[str]   = None
    duration_ms:   Optional[int]   = None
    extra:         Optional[dict]  = None


class AlertCreate(BaseModel):
    """Payload để tạo alert mới"""
    session_id:  str
    alert_type:  AlertType
    severity:    AlertSeverity
    message:     str
    data:        AlertData = Field(default_factory=AlertData)


class AlertResponse(BaseModel):
    """Alert trả về cho client (khớp với WsAlertMessage.payload)"""
    alert_id:     str = Field(default_factory=lambda: str(uuid.uuid4()))
    alert_type:   AlertType
    severity:     AlertSeverity
    message:      str
    triggered_at: float   # Unix ms
    is_read:      bool    = False
    data:         AlertData

    model_config = {"from_attributes": True}


class AlertRule(BaseModel):
    """Quy tắc cảnh báo (đồng bộ với frontend AlertRule)"""
    alert_type:   AlertType
    severity:     AlertSeverity
    enabled:      bool  = True
    threshold:    float = 0.0
    debounce_ms:  int   = 0
    cooldown_ms:  int   = 30000


# ─── Default Rules ───────────────────────────────────────────────────────────

DEFAULT_ALERT_RULES: list[AlertRule] = [
    AlertRule(alert_type=AlertType.STRESS_HIGH,       severity=AlertSeverity.WARNING,  threshold=60.0, cooldown_ms=30000),
    AlertRule(alert_type=AlertType.STRESS_CRITICAL,   severity=AlertSeverity.CRITICAL, threshold=85.0, cooldown_ms=30000),
    AlertRule(alert_type=AlertType.BLINK_LOW,         severity=AlertSeverity.WARNING,  threshold=10.0, cooldown_ms=60000),
    AlertRule(alert_type=AlertType.BLINK_HIGH,        severity=AlertSeverity.INFO,     threshold=30.0, cooldown_ms=60000),
    AlertRule(alert_type=AlertType.NO_BLINK_LONG,     severity=AlertSeverity.WARNING,  threshold=20000, cooldown_ms=30000),
    AlertRule(alert_type=AlertType.FACE_LOST,         severity=AlertSeverity.INFO,     threshold=3000,  cooldown_ms=10000),
    AlertRule(alert_type=AlertType.EMOTION_NEGATIVE,  severity=AlertSeverity.WARNING,  threshold=15000, cooldown_ms=30000),
    AlertRule(alert_type=AlertType.JAW_TENSION_HIGH,  severity=AlertSeverity.WARNING,  threshold=0.7,   cooldown_ms=30000),
    AlertRule(alert_type=AlertType.HEAD_POSE_EXTREME, severity=AlertSeverity.INFO,     threshold=30.0,  cooldown_ms=15000),
]
