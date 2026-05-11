from typing import Optional
from pydantic import BaseModel, Field


# ─── Emotion ────────────────────────────────────────────────────────────────

class EmotionScore(BaseModel):
    label:      str
    score:      float = Field(ge=0.0, le=1.0)
    percentage: float = Field(ge=0.0, le=100.0)


class EmotionResult(BaseModel):
    dominant:       str
    dominant_score: float = Field(ge=0.0, le=1.0)
    scores:         list[EmotionScore]


# ─── Blink ──────────────────────────────────────────────────────────────────

class BlinkResult(BaseModel):
    ear:            float = Field(ge=0.0)
    is_blinking:    bool
    blink_count:    int   = Field(ge=0)
    blink_rate:     float = Field(ge=0.0)   # lần/phút


# ─── Head Pose ──────────────────────────────────────────────────────────────

class HeadPoseResult(BaseModel):
    pitch: float   # Gật đầu (độ)
    yaw:   float   # Lắc đầu (độ)
    roll:  float   # Nghiêng đầu (độ)


# ─── Muscle Tension ─────────────────────────────────────────────────────────

class MuscleTensionResult(BaseModel):
    mar:              float = Field(ge=0.0)
    brow_distance:    float = Field(ge=0.0)
    jaw_tension:      float = Field(ge=0.0, le=1.0)
    stress_score:     float = Field(ge=0.0, le=100.0)
    fusion_vector:    list[float]


# ─── Landmarks ──────────────────────────────────────────────────────────────

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float = 0.0


class BoundingBox(BaseModel):
    x:      float
    y:      float
    width:  float
    height: float


# ─── Frame Result (tổng hợp) ────────────────────────────────────────────────

class FrameResult(BaseModel):
    """
    Kết quả xử lý 1 frame — gửi qua WS dưới dạng WsFrameResultMessage.payload
    """
    session_id:     str
    frame_id:       int
    timestamp:      float                           # Unix ms

    face_detected:  bool
    landmarks:      Optional[list[LandmarkPoint]]   = None
    bounding_box:   Optional[BoundingBox]           = None

    blink:          Optional[BlinkResult]           = None
    emotion:        Optional[EmotionResult]         = None
    muscle_tension: Optional[MuscleTensionResult]   = None
    head_pose:      Optional[HeadPoseResult]        = None

    processing_ms:  float = Field(default=0.0, ge=0)   # Thời gian xử lý (ms)
