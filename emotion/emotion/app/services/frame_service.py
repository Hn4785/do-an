import time
from collections import deque
from typing import Optional

import cv2
import numpy as np

from app.schemas.feature_schema import (
    BlinkResult,
    BoundingBox,
    EmotionResult,
    EmotionScore,
    FrameResult,
    HeadPoseResult,
    LandmarkPoint,
    MuscleTensionResult,
)
from app.schemas.session_schema import SessionConfig


# ─── Constants ───────────────────────────────────────────────────────────────

EAR_BLINK_THRESHOLD = 0.20      # EAR < ngưỡng này → đang nháy
BLINK_WINDOW_SEC    = 60        # Cửa sổ tính blink rate (giây)
MAR_YAWN_THRESHOLD  = 0.60      # MAR > ngưỡng này → ngáp
BROW_FROWN_THRESHOLD = 0.25     # Khoảng cách mày < ngưỡng → nhíu mày


# ─── Blink Tracker ───────────────────────────────────────────────────────────

class BlinkTracker:
    """Theo dõi nháy mắt theo cửa sổ thời gian cuốn."""

    def __init__(self, window_sec: int = BLINK_WINDOW_SEC):
        self._window_sec  = window_sec
        self._blink_times: deque[float] = deque()
        self._total_blinks = 0
        self._prev_blinking = False

    def update(self, ear: float, timestamp_ms: float) -> tuple[bool, int, float]:
        """
        Cập nhật trạng thái nháy mắt.

        Returns:
            (is_blinking, blink_count_total, blink_rate_per_min)
        """
        is_blinking = ear < EAR_BLINK_THRESHOLD
        now_sec = timestamp_ms / 1000.0

        # Phát hiện sườn xuống (bắt đầu nháy)
        if is_blinking and not self._prev_blinking:
            self._total_blinks += 1
            self._blink_times.append(now_sec)

        self._prev_blinking = is_blinking

        # Loại bỏ các blink cũ ngoài cửa sổ
        cutoff = now_sec - self._window_sec
        while self._blink_times and self._blink_times[0] < cutoff:
            self._blink_times.popleft()

        # Tính rate
        elapsed = min(now_sec, self._window_sec)
        rate = (len(self._blink_times) / elapsed * 60) if elapsed > 0 else 0.0

        return is_blinking, self._total_blinks, round(rate, 2)

    def reset(self):
        self._blink_times.clear()
        self._total_blinks = 0
        self._prev_blinking = False


# ─── EAR / MAR Calculation ───────────────────────────────────────────────────

def _euclidean(p1, p2) -> float:
    return float(np.linalg.norm(np.array(p1) - np.array(p2)))


def calc_ear(landmarks: list, indices_left: list[int], indices_right: list[int]) -> float:
    """
    Tính Eye Aspect Ratio trung bình hai mắt.
    indices: [p1, p2, p3, p4, p5, p6] theo thứ tự MediaPipe.
    """
    def _ear(pts):
        v1 = _euclidean(pts[1], pts[5])
        v2 = _euclidean(pts[2], pts[4])
        h  = _euclidean(pts[0], pts[3])
        return (v1 + v2) / (2.0 * h + 1e-6)

    pts_l = [(landmarks[i].x, landmarks[i].y) for i in indices_left]
    pts_r = [(landmarks[i].x, landmarks[i].y) for i in indices_right]
    return round((_ear(pts_l) + _ear(pts_r)) / 2.0, 4)


def calc_mar(landmarks: list, indices: list[int]) -> float:
    """Tính Mouth Aspect Ratio."""
    pts = [(landmarks[i].x, landmarks[i].y) for i in indices]
    v1 = _euclidean(pts[1], pts[7])
    v2 = _euclidean(pts[2], pts[6])
    v3 = _euclidean(pts[3], pts[5])
    h  = _euclidean(pts[0], pts[4])
    return round((v1 + v2 + v3) / (3.0 * h + 1e-6), 4)


def calc_brow_distance(landmarks: list, left_idx: int, right_idx: int) -> float:
    """Khoảng cách normalized giữa hai đầu lông mày."""
    lx, ly = landmarks[left_idx].x, landmarks[left_idx].y
    rx, ry = landmarks[right_idx].x, landmarks[right_idx].y
    return round(_euclidean((lx, ly), (rx, ry)), 4)


# ─── Stress Score ─────────────────────────────────────────────────────────────

def calc_stress_score(
    ear: float,
    mar: float,
    brow_distance: float,
    emotion_label: str,
    blink_rate: float,
) -> float:
    """
    Tính stress score tổng hợp (0–100).
    Công thức heuristic đơn giản — có thể thay bằng ML model.
    """
    score = 0.0

    # EAR thấp → mệt mỏi
    if ear < 0.20:
        score += 25.0
    elif ear < 0.25:
        score += 10.0

    # MAR cao → ngáp / căng thẳng
    if mar > MAR_YAWN_THRESHOLD:
        score += 15.0
    elif mar > 0.4:
        score += 5.0

    # Brow distance thấp → nhíu mày
    if brow_distance < BROW_FROWN_THRESHOLD:
        score += 20.0
    elif brow_distance < 0.35:
        score += 8.0

    # Cảm xúc tiêu cực
    negative_emotions = {"angry": 30, "fear": 25, "sad": 15, "disgust": 10}
    score += negative_emotions.get(emotion_label, 0)

    # Blink rate bất thường
    if blink_rate < 8 or blink_rate > 30:
        score += 10.0

    return round(min(score, 100.0), 2)


# ─── Frame Service ────────────────────────────────────────────────────────────

class FrameService:
    """
    Xử lý từng frame: tích hợp kết quả từ MediaPipe + DeepFace
    và tạo FrameResult để gửi qua WebSocket.
    """

    # MediaPipe landmark indices (FaceMesh 468 points)
    _LEFT_EYE  = [362, 385, 387, 263, 373, 380]
    _RIGHT_EYE = [33,  160, 158, 133, 153, 144]
    _MOUTH     = [61,  39,  37,  0,   267, 269, 291, 405]
    _BROW_L    = 70
    _BROW_R    = 300

    def __init__(self):
        self._blink_tracker = BlinkTracker()
        self._frame_counter = 0

    def reset(self):
        """Reset khi bắt đầu phiên mới."""
        self._blink_tracker.reset()
        self._frame_counter = 0

    def process_frame(
        self,
        session_id: str,
        raw_landmarks: Optional[list],
        bounding_box_raw: Optional[dict],
        emotion_raw: Optional[dict],
        config: SessionConfig,
        timestamp_ms: Optional[float] = None,
    ) -> FrameResult:
        """
        Tổng hợp kết quả từ các module AI thành FrameResult.

        Args:
            raw_landmarks:    Danh sách landmark từ MediaPipe (list of NormalizedLandmark)
            bounding_box_raw: Dict {x, y, width, height} từ MediaPipe
            emotion_raw:      Dict {dominant_emotion, emotion: {label: score}} từ DeepFace
            config:           SessionConfig
            timestamp_ms:     Unix ms (nếu None → dùng time.time() * 1000)
        """
        t_start = time.perf_counter()
        self._frame_counter += 1
        ts = timestamp_ms or (time.time() * 1000)

        face_detected = raw_landmarks is not None and len(raw_landmarks) > 0

        # ── Landmarks ──
        landmarks: Optional[list[LandmarkPoint]] = None
        if face_detected:
            landmarks = [
                LandmarkPoint(x=lm.x, y=lm.y, z=getattr(lm, "z", 0.0))
                for lm in raw_landmarks
            ]

        # ── Bounding Box ──
        bounding_box: Optional[BoundingBox] = None
        if bounding_box_raw:
            bounding_box = BoundingBox(**bounding_box_raw)

        # ── Blink ──
        blink_result: Optional[BlinkResult] = None
        ear = 0.0
        blink_rate = 0.0
        if face_detected and config.enable_blink and landmarks:
            ear = calc_ear(raw_landmarks, self._LEFT_EYE, self._RIGHT_EYE)
            is_blinking, blink_count, blink_rate = self._blink_tracker.update(ear, ts)
            blink_result = BlinkResult(
                ear=ear,
                is_blinking=is_blinking,
                blink_count=blink_count,
                blink_rate=blink_rate,
            )

        # ── Emotion ──
        emotion_result: Optional[EmotionResult] = None
        dominant_emotion = "neutral"
        if face_detected and config.enable_emotion and emotion_raw:
            dominant_emotion = emotion_raw.get("dominant_emotion", "neutral")
            raw_scores = emotion_raw.get("emotion", {})
            scores = [
                EmotionScore(
                    label=label,
                    score=round(pct / 100.0, 4),
                    percentage=round(pct, 2),
                )
                for label, pct in raw_scores.items()
            ]
            dominant_score = next(
                (s.score for s in scores if s.label == dominant_emotion), 0.0
            )
            emotion_result = EmotionResult(
                dominant=dominant_emotion,
                dominant_score=dominant_score,
                scores=scores,
            )

        # ── Muscle Tension ──
        muscle_tension: Optional[MuscleTensionResult] = None
        if face_detected and config.enable_muscle_tension and landmarks:
            mar = calc_mar(raw_landmarks, self._MOUTH)
            brow_dist = calc_brow_distance(raw_landmarks, self._BROW_L, self._BROW_R)
            jaw_tension = min(1.0, max(0.0, 1.0 - brow_dist * 2))
            stress_score = calc_stress_score(
                ear, mar, brow_dist, dominant_emotion, blink_rate
            )
            fusion_vector = [ear, mar, brow_dist, jaw_tension, stress_score / 100.0]
            muscle_tension = MuscleTensionResult(
                mar=mar,
                brow_distance=brow_dist,
                jaw_tension=round(jaw_tension, 4),
                stress_score=stress_score,
                fusion_vector=fusion_vector,
            )

        # ── Head Pose ──
        head_pose: Optional[HeadPoseResult] = None
        if face_detected and config.enable_head_pose and landmarks:
            # Placeholder — thay bằng solvePnP hoặc MediaPipe FaceMesh angles
            head_pose = HeadPoseResult(pitch=0.0, yaw=0.0, roll=0.0)

        processing_ms = round((time.perf_counter() - t_start) * 1000, 2)

        return FrameResult(
            session_id=session_id,
            frame_id=self._frame_counter,
            timestamp=ts,
            face_detected=face_detected,
            landmarks=landmarks,
            bounding_box=bounding_box,
            blink=blink_result,
            emotion=emotion_result,
            muscle_tension=muscle_tension,
            head_pose=head_pose,
            processing_ms=processing_ms,
        )


# Singleton instance
frame_service = FrameService()
