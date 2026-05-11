from deepface import DeepFace
import numpy as np

EMOTION_LABELS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]


class EmotionDetector:
    """
    Nhận diện cảm xúc bằng DeepFace.
    Chỉ nhận face ROI đã được crop sẵn.

    Hai phương thức:
        detect()             → (str, float)  — dùng cho Mode 6 CLI
        detect_with_scores() → (str, dict)   — dùng cho fastapi_server (WebSocket)
    """

    def __init__(self, analyze_every_n_frames=30):
        """
        analyze_every_n_frames:
            Chỉ chạy DeepFace mỗi N frame để giảm lag.
        """
        self.analyze_every_n_frames = analyze_every_n_frames
        self.last_emotion  = "neutral"
        self.last_confidence = 0.0
        # Cache toàn bộ scores dict cho detect_with_scores()
        self.last_scores: dict = {lbl: 0.0 for lbl in EMOTION_LABELS}
        self.last_scores["neutral"] = 100.0

        print("[EmotionDetector] Đã khởi tạo DeepFace Emotion Detector.")

    def _run_deepface(self, face_roi, frame_count) -> bool:
        """
        Chạy DeepFace và cập nhật last_emotion / last_confidence / last_scores.
        Trả về True nếu đã phân tích (không phải cache), False nếu dùng cache.
        """
        if face_roi is None or face_roi.size == 0:
            return False

        if frame_count % self.analyze_every_n_frames != 0:
            return False

        try:
            result = DeepFace.analyze(
                face_roi,
                actions=['emotion'],
                enforce_detection=False
            )

            if isinstance(result, list):
                result = result[0]

            emotion_scores  = result['emotion']          # dict {label: float (0-100)}
            emotion_label   = result['dominant_emotion']
            confidence      = float(emotion_scores[emotion_label])

            self.last_emotion    = emotion_label
            self.last_confidence = confidence
            # Cập nhật cache scores — chỉ giữ 7 nhãn chuẩn
            self.last_scores = {
                lbl: float(emotion_scores.get(lbl, 0.0))
                for lbl in EMOTION_LABELS
            }

        except Exception as e:
            print(f"[EmotionDetector] Lỗi DeepFace: {e}")

        return True

    def detect(self, face_roi, frame_count) -> tuple[str, float]:
        """
        Dùng cho Mode 6 CLI.
        Trả về: (emotion_label: str, confidence: float)
        """
        self._run_deepface(face_roi, frame_count)
        return self.last_emotion, self.last_confidence

    def detect_with_scores(self, face_roi, frame_count) -> tuple[str, dict]:
        """
        Dùng cho fastapi_server (WebSocket).
        Trả về: (emotion_label: str, scores: dict {label: float (0-100)})
        scores khớp với format DeepFace để build_emotion() xử lý đúng.
        """
        self._run_deepface(face_roi, frame_count)
        return self.last_emotion, dict(self.last_scores)