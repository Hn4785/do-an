from datetime import datetime
from typing import Optional
from collections import Counter

from models.session_model import Session
from models.frame_result_model import FrameResult
from schemas.report_schema import (
    SessionReport,
    ReportOverview,
    ReportBlink,
    ReportStress,
    ReportEmotion,
    ReportAlerts,
    ReportTimelinePoint,
)


class ReportService:
    """
    Service tổng hợp báo cáo từ dữ liệu session và frame results.
    """

    def generate_report(
        self,
        session: Session,
        frames: list[FrameResult],
        alerts: Optional[list[dict]] = None,
    ) -> SessionReport:
        """
        Tạo báo cáo đầy đủ từ session và danh sách frame results.
        """
        if not frames:
            raise ValueError("Không có dữ liệu frame để tạo báo cáo.")

        overview  = self._build_overview(session, frames)
        blink     = self._build_blink(frames)
        stress    = self._build_stress(frames)
        emotion   = self._build_emotion(frames)
        alert_rpt = self._build_alerts(alerts or [])
        timeline  = self._build_timeline(frames, session.started_at)

        return SessionReport(
            reportId    = f"report_{session.session_id}",
            sessionId   = session.session_id,
            generatedAt = int(datetime.utcnow().timestamp() * 1000),
            overview    = overview,
            blink       = blink,
            stress      = stress,
            emotion     = emotion,
            alerts      = alert_rpt,
            timeline    = timeline,
        )

    # ===== Overview =====
    def _build_overview(self, session: Session, frames: list[FrameResult]) -> ReportOverview:
        face_detected = [f for f in frames if f.face_detected]
        avg_fps = (
            sum(f.current_fps for f in frames) / len(frames)
            if frames else 0.0
        )

        return ReportOverview(
            startedAt          = session.started_at,
            endedAt            = session.ended_at or int(datetime.utcnow().timestamp() * 1000),
            durationMs         = session.duration_ms,
            totalFrames        = len(frames),
            averageFps         = round(avg_fps, 2),
            faceDetectedFrames = len(face_detected),
            faceDetectionRate  = round(len(face_detected) / len(frames), 4) if frames else 0.0,
        )

    # ===== Blink =====
    def _build_blink(self, frames: list[FrameResult]) -> ReportBlink:
        blink_frames = [f for f in frames if f.features and f.features.blink]
        if not blink_frames:
            return ReportBlink(
                totalBlinks=0, avgRatePerMin=0, minRatePerMin=0,
                maxRatePerMin=0, avgEar=0, longNoBlinkMs=0,
            )

        rates = [f.features.blink.rate_per_minute for f in blink_frames]
        ears  = [f.features.blink.ear.average for f in blink_frames]

        # Tổng số lần nháy mắt (đếm từ is_blinking transitions)
        total_blinks = sum(
            1 for i in range(1, len(blink_frames))
            if not blink_frames[i - 1].features.blink.is_blinking
            and blink_frames[i].features.blink.is_blinking
        )

        # Thời gian không nháy dài nhất (ms)
        long_no_blink_ms = self._calc_long_no_blink(blink_frames)

        return ReportBlink(
            totalBlinks    = total_blinks,
            avgRatePerMin  = round(sum(rates) / len(rates), 2),
            minRatePerMin  = round(min(rates), 2),
            maxRatePerMin  = round(max(rates), 2),
            avgEar         = round(sum(ears) / len(ears), 4),
            longNoBlinkMs  = long_no_blink_ms,
        )

    def _calc_long_no_blink(self, frames: list[FrameResult]) -> int:
        """Tính khoảng thời gian không nháy mắt dài nhất (ms)."""
        max_gap = 0
        gap_start = None

        for f in frames:
            if not f.features.blink.is_blinking:
                if gap_start is None:
                    gap_start = f.timestamp
            else:
                if gap_start is not None:
                    gap = f.timestamp - gap_start
                    max_gap = max(max_gap, gap)
                    gap_start = None

        return max_gap

    # ===== Stress =====
    def _build_stress(self, frames: list[FrameResult]) -> ReportStress:
        stress_frames = [f for f in frames if f.features and f.features.tension]
        if not stress_frames:
            return ReportStress(
                avgScore=0, peakScore=0, minScore=0,
                avgForeheadScore=0, avgJawScore=0, avgPeriocularScore=0,
            )

        scores     = [f.features.tension.overall_score for f in stress_frames]
        foreheads  = [f.features.tension.forehead_score for f in stress_frames]
        jaws       = [f.features.tension.jaw_score for f in stress_frames]
        periocs    = [f.features.tension.periocular_score for f in stress_frames]

        return ReportStress(
            avgScore          = round(sum(scores) / len(scores), 2),
            peakScore         = round(max(scores), 2),
            minScore          = round(min(scores), 2),
            avgForeheadScore  = round(sum(foreheads) / len(foreheads), 2),
            avgJawScore       = round(sum(jaws) / len(jaws), 2),
            avgPeriocularScore= round(sum(periocs) / len(periocs), 2),
        )

    # ===== Emotion =====
    def _build_emotion(self, frames: list[FrameResult]) -> ReportEmotion:
        emotion_frames = [f for f in frames if f.emotion and f.emotion.dominant]
        if not emotion_frames:
            return ReportEmotion(dominant="neutral", distribution={})

        labels = [f.emotion.dominant for f in emotion_frames]
        counts = Counter(labels)
        total  = len(labels)

        dominant = counts.most_common(1)[0][0]
        distribution = {
            label: round(count / total, 4)
            for label, count in counts.items()
        }

        return ReportEmotion(
            dominant     = dominant,
            distribution = distribution,
        )

    # ===== Alerts =====
    def _build_alerts(self, alerts: list[dict]) -> ReportAlerts:
        by_severity = {"info": 0, "warning": 0, "critical": 0}
        for alert in alerts:
            sev = alert.get("severity", "info")
            if sev in by_severity:
                by_severity[sev] += 1

        return ReportAlerts(
            totalCount  = len(alerts),
            bySeverity  = by_severity,
        )

    # ===== Timeline =====
    def _build_timeline(
        self,
        frames: list[FrameResult],
        session_start_ms: int,
    ) -> list[ReportTimelinePoint]:
        timeline = []

        for f in frames:
            if not f.features or not f.emotion:
                continue

            elapsed_sec = round((f.timestamp - session_start_ms) / 1000, 1)

            timeline.append(ReportTimelinePoint(
                timestamp   = f.timestamp,
                elapsedSec  = elapsed_sec,
                stressScore = round(f.features.tension.overall_score, 2) if f.features.tension else 0,
                blinkRate   = round(f.features.blink.rate_per_minute, 2) if f.features.blink else 0,
                earAverage  = round(f.features.blink.ear.average, 4) if f.features.blink else 0,
                emotion     = f.emotion.dominant,
                focusLevel  = self._calc_focus_level(f),
            ))

        return timeline

    def _calc_focus_level(self, frame: FrameResult) -> str:
        """Tính mức tập trung dựa trên stress + emotion."""
        stress = frame.features.tension.overall_score if frame.features and frame.features.tension else 0
        emotion = frame.emotion.dominant if frame.emotion else "neutral"

        if stress > 0.7 or emotion in ("angry", "fear", "disgust"):
            return "low"
        if stress > 0.4 or emotion in ("sad",):
            return "medium"
        return "high"
