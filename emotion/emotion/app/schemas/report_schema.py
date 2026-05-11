from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


# ─── Timeline ────────────────────────────────────────────────────────────────

class ReportTimelinePoint(BaseModel):
    """1 điểm dữ liệu trên timeline (mỗi giây hoặc mỗi N frame)"""
    elapsed_sec:      float   # Giây kể từ đầu phiên
    stress_score:     float   # 0–100
    blink_rate:       float   # lần/phút
    dominant_emotion: str
    ear:              float
    mar:              float


# ─── Blink Report ────────────────────────────────────────────────────────────

class ReportBlink(BaseModel):
    total_blinks:      int
    avg_rate_per_min:  float
    min_rate_per_min:  float
    max_rate_per_min:  float
    avg_ear:           float
    long_no_blink_ms:  int     # Khoảng không nháy mắt dài nhất (ms)


# ─── Stress Report ───────────────────────────────────────────────────────────

class ReportStress(BaseModel):
    avg_score:               float
    peak_score:              float
    time_above_warning_pct:  float   # % thời gian stress > warning threshold
    time_above_critical_pct: float


# ─── Emotion Report ──────────────────────────────────────────────────────────

class ReportEmotion(BaseModel):
    dominant:     str
    distribution: dict[str, float]   # label → % thời gian


# ─── Alert Summary ───────────────────────────────────────────────────────────

class ReportAlertSummary(BaseModel):
    total:       int
    by_type:     dict[str, int]     # alert_type → count
    by_severity: dict[str, int]     # severity → count


# ─── Full Session Report ─────────────────────────────────────────────────────

class SessionReport(BaseModel):
    """
    Báo cáo đầy đủ 1 phiên học — dùng để render ReportPage và xuất PDF/CSV
    """
    session_id:  str
    started_at:  datetime
    ended_at:    datetime
    duration_ms: int

    blink:   ReportBlink
    stress:  ReportStress
    emotion: ReportEmotion
    alerts:  ReportAlertSummary

    timeline: list[ReportTimelinePoint]

    # Metadata
    total_frames:    int
    avg_fps:         float
    config_snapshot: Optional[dict] = None   # SessionConfig tại thời điểm chạy

    model_config = {"from_attributes": True}


# ─── List Response ───────────────────────────────────────────────────────────

class SessionReportListItem(BaseModel):
    """Dùng cho trang lịch sử — chỉ hiển thị thông tin tóm tắt"""
    session_id:       str
    started_at:       datetime
    duration_ms:      int
    avg_stress_score: float
    dominant_emotion: str
    total_alerts:     int
