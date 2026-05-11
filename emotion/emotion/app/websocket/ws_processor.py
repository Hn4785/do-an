import time
import logging
from typing import Optional

from ..schemas.feature_schema import (
    FrameResult,
    BlinkResult,
    EmotionResult,
    EmotionScore,
    MuscleTensionResult,
    HeadPoseResult,
    LandmarkPoint,
    BoundingBox,
)
from ..schemas.session_schema import SessionConfig

logger = logging.getLogger(__name__)


class FrameProcessor:
    """
    Xử lý từng frame từ client:
    - Nhận raw frame data (bytes hoặc base64)
    - Chạy MediaPipe → landmarks, blink, head pose
    - Chạy DeepFace → emotion
    - Tổng hợp → FrameResult
    """

    def __init__(self, config: SessionConfig):
        self.config = config
        self._frame_count = 0
        self._blink_count = 0
        self._last_blink_time: Optional[float] = None
        self._blink_timestamps: list[float] = []

        logger.info(f"[Processor] Initialized with config: {config.model_dump()}")

    # ─── Main Process ────────────────────────────────────────────────────────

    async def process_frame(
        self,
        session_id: str,
        frame_data: bytes,
    ) -> FrameResult:
        """
        Xử lý 1 frame và trả về FrameResult đầy đủ.
        """
        start_ms = time.time() * 1000
        self._frame_count += 1

        # ── Placeholder: thay bằng MediaPipe thực tế ──
        face_detected = True
        landmarks: Optional[list[LandmarkPoint]] = None
        bounding_box: Optional[BoundingBox] = None
        blink_result: Optional[BlinkResult] = None
        emotion_result: Optional[EmotionResult] = None
        tension_result: Optional[MuscleTensionResult] = None
        head_pose_result: Optional[HeadPoseResult] = None

        try:
            # ── 1. Detect landmarks ──
            landmarks, bounding_box = await self._detect_landmarks(frame_data)
            face_detected = landmarks is not None

            if face_detected and landmarks:
                # ── 2. Blink detection ──
                if self.config.enable_blink:
                    blink_result = await self._detect_blink(landmarks)

                # ── 3. Head pose ──
                if self.config.enable_head_pose:
                    head_pose_result = await self._detect_head_pose(landmarks)

                # ── 4. Muscle tension ──
                if self.config.enable_muscle_tension:
                    tension_result = await self._detect_muscle_tension(landmarks)

                # ── 5. Emotion (DeepFace) ──
                if self.config.enable_emotion:
                    emotion_result = await self._detect_emotion(frame_data)

        except Exception as e:
            logger.error(f"[Processor] Frame processing error: {e}", exc_info=True)
            face_detected = False

        processing_ms = time.time() * 1000 - start_ms

        return FrameResult(
            session_id=session_id,
            frame_id=self._frame_count,
            timestamp=time.time() * 1000,
            face_detected=face_detected,
            landmarks=landmarks,
            bounding_box=bounding_box,
            blink=blink_result,
            emotion=emotion_result,
            muscle_tension=tension_result,
            head_pose=head_pose_result,
            processing_ms=processing_ms,
        )

    # ─── Private Helpers (Placeholder) ───────────────────────────────────────

    async def _detect_landmarks(
        self, frame_data: bytes
    ) -> tuple[Optional[list[LandmarkPoint]], Optional[BoundingBox]]:
        """
        TODO: Tích hợp MediaPipe FaceMesh.
        Hiện tại trả về placeholder data.
        """
        # Placeholder — thay bằng MediaPipe thực tế
        return None, None

    async def _detect_blink(
        self, landmarks: list[LandmarkPoint]
    ) -> BlinkResult:
        """
        Tính EAR từ landmarks và phát hiện nháy mắt.
        TODO: Tích hợp thuật toán EAR thực tế.
        """
        now = time.time()
        ear = 0.3  # Placeholder

        is_blinking = ear < 0.2

        if is_blinking and (
            self._last_blink_time is None
            or now - self._last_blink_time > 0.15
        ):
            self._blink_count += 1
            self._last_blink_time = now
            self._blink_timestamps.append(now)

        # Tính blink rate trong 60 giây gần nhất
        cutoff = now - 60.0
        self._blink_timestamps = [t for t in self._blink_timestamps if t > cutoff]
        blink_rate = len(self._blink_timestamps)

        return BlinkResult(
            ear=ear,
            is_blinking=is_blinking,
            blink_count=self._blink_count,
            blink_rate=float(blink_rate),
        )

    async def _detect_head_pose(
        self, landmarks: list[LandmarkPoint]
    ) -> HeadPoseResult:
        """
        TODO: Tính pitch/yaw/roll từ landmarks.
        """
        return HeadPoseResult(pitch=0.0, yaw=0.0, roll=0.0)

    async def _detect_muscle_tension(
        self, landmarks: list[LandmarkPoint]
    ) -> MuscleTensionResult:
        """
        TODO: Tính MAR, brow distance, jaw tension từ landmarks.
        """
        return MuscleTensionResult(
            mar=0.3,
            brow_distance=25.0,
            jaw_tension=0.2,
            stress_score=30.0,
            fusion_vector=[0.0] * 8,
        )

    async def _detect_emotion(self, frame_data: bytes) -> EmotionResult:
        """
        TODO: Tích hợp DeepFace để nhận diện cảm xúc.
        """
        return EmotionResult(
            dominant="neutral",
            dominant_score=0.8,
            scores=[
                EmotionScore(label="neutral",  score=0.8,  percentage=80.0),
                EmotionScore(label="happy",    score=0.1,  percentage=10.0),
                EmotionScore(label="sad",      score=0.05, percentage=5.0),
                EmotionScore(label="angry",    score=0.02, percentage=2.0),
                EmotionScore(label="fear",     score=0.01, percentage=1.0),
                EmotionScore(label="disgust",  score=0.01, percentage=1.0),
                EmotionScore(label="surprise", score=0.01, percentage=1.0),
            ],
        )

    # ─── Stats ───────────────────────────────────────────────────────────────

    @property
    def frame_count(self) -> int:
        return self._frame_count

    @property
    def blink_count(self) -> int:
        return self._blink_count

    def reset(self) -> None:
        self._frame_count = 0
        self._blink_count = 0
        self._last_blink_time = None
        self._blink_timestamps = []
