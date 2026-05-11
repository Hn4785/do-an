import asyncio
import json
import logging
import time
import uuid
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect

from ..schemas.session_schema import SessionConfig, SessionStatus
from ..schemas.feature_schema import FrameResult
from .ws_manager import WebSocketManager
from .ws_processor import FrameProcessor

logger = logging.getLogger(__name__)

# ─── Message Builders ────────────────────────────────────────────────────────

def _make_message(msg_type: str, payload: dict) -> dict:
    return {
        "type":      msg_type,
        "timestamp": time.time() * 1000,
        "messageId": str(uuid.uuid4()),
        "payload":   payload,
    }


def _session_started_msg(session_id: str, started_at: float, config: SessionConfig) -> dict:
    return _make_message("session_started", {
        "sessionId": session_id,
        "startedAt": started_at,
        "config":    config.model_dump(),
    })


def _session_ended_msg(session_id: str, reason: str) -> dict:
    return _make_message("session_ended", {
        "sessionId": session_id,
        "endedAt":   time.time() * 1000,
        "reason":    reason,
    })


def _frame_result_msg(result: FrameResult, current_fps: float) -> dict:
    return _make_message("frame_result", {
        "frameIndex": result.frame_id,
        "currentFps": current_fps,
        "features": {
            "sessionId":     result.session_id,
            "frameId":       result.frame_id,
            "timestamp":     result.timestamp,
            "faceDetected":  result.face_detected,
            "landmarks":     [lm.model_dump() for lm in result.landmarks] if result.landmarks else None,
            "boundingBox":   result.bounding_box.model_dump() if result.bounding_box else None,
            "blink":         result.blink.model_dump() if result.blink else None,
            "headPose":      result.head_pose.model_dump() if result.head_pose else None,
            "muscleTension": result.muscle_tension.model_dump() if result.muscle_tension else None,
            "processingMs":  result.processing_ms,
        },
        "emotion": result.emotion.model_dump() if result.emotion else None,
    })


def _heartbeat_msg() -> dict:
    return _make_message("heartbeat", {"serverTime": time.time() * 1000})


def _error_msg(code: str, message: str, fatal: bool = False) -> dict:
    return _make_message("error", {
        "code":    code,
        "message": message,
        "fatal":   fatal,
    })


def _calibration_done_msg(
    success: bool,
    baseline_ear: float,
    baseline_mar: float,
    message: str,
) -> dict:
    return _make_message("calibration_done", {
        "success":     success,
        "baselineEar": baseline_ear,
        "baselineMar": baseline_mar,
        "message":     message,
    })


# ─── WebSocket Handler ───────────────────────────────────────────────────────

class WebSocketHandler:
    """
    Xử lý toàn bộ vòng đời của 1 WebSocket connection:
    - Nhận message từ client
    - Dispatch tới đúng handler
    - Gửi response về client
    """

    HEARTBEAT_INTERVAL = 30  # giây

    def __init__(self, manager: WebSocketManager):
        self.manager = manager

    async def handle(self, websocket: WebSocket, session_id: str) -> None:
        """Entry point — gọi từ FastAPI route."""
        await self.manager.connect(session_id, websocket)

        processor: Optional[FrameProcessor] = None
        heartbeat_task: Optional[asyncio.Task] = None
        status = SessionStatus.IDLE
        started_at: Optional[float] = None
        fps_tracker: list[float] = []

        try:
            heartbeat_task = asyncio.create_task(
                self._heartbeat_loop(session_id)
            )

            async for raw_message in websocket.iter_text():
                try:
                    msg = json.loads(raw_message)
                except json.JSONDecodeError:
                    await self.manager.send_json(
                        session_id,
                        _error_msg("INVALID_JSON", "Message không hợp lệ")
                    )
                    continue

                msg_type = msg.get("type", "")
                payload  = msg.get("payload", {})

                # ── Dispatch ──────────────────────────────────────────────
                if msg_type == "start_session":
                    config = SessionConfig(**payload.get("config", {}))
                    processor = FrameProcessor(config)
                    status = SessionStatus.RUNNING
                    started_at = time.time() * 1000
                    fps_tracker.clear()

                    await self.manager.send_json(
                        session_id,
                        _session_started_msg(session_id, started_at, config)
                    )
                    logger.info(f"[Handler] Session started: {session_id}")

                elif msg_type == "stop_session":
                    status = SessionStatus.ENDED
                    await self.manager.send_json(
                        session_id,
                        _session_ended_msg(session_id, "user_stopped")
                    )
                    logger.info(f"[Handler] Session stopped: {session_id}")
                    break

                elif msg_type == "pause_session":
                    status = SessionStatus.PAUSED
                    logger.info(f"[Handler] Session paused: {session_id}")

                elif msg_type == "resume_session":
                    if status == SessionStatus.PAUSED:
                        status = SessionStatus.RUNNING
                    logger.info(f"[Handler] Session resumed: {session_id}")

                elif msg_type == "heartbeat_ack":
                    pass  # Client đã nhận heartbeat

                elif msg_type == "start_calibration":
                    # TODO: Thực hiện calibration thực tế
                    await self.manager.send_json(
                        session_id,
                        _calibration_done_msg(
                            success=True,
                            baseline_ear=0.28,
                            baseline_mar=0.35,
                            message="Calibration hoàn thành"
                        )
                    )

                elif msg_type == "update_config":
                    if processor:
                        new_config_data = {
                            **processor.config.model_dump(),
                            **payload.get("config", {})
                        }
                        processor.config = SessionConfig(**new_config_data)
                        logger.info(f"[Handler] Config updated: {session_id}")

                elif msg_type == "frame_data":
                    # Nhận frame bytes (base64 hoặc binary)
                    if status != SessionStatus.RUNNING or processor is None:
                        continue

                    frame_bytes = payload.get("data", b"")
                    if isinstance(frame_bytes, str):
                        import base64
                        frame_bytes = base64.b64decode(frame_bytes)

                    # Xử lý frame
                    frame_start = time.time()
                    result = await processor.process_frame(session_id, frame_bytes)
                    frame_end = time.time()

                    # Tính FPS
                    fps_tracker.append(frame_end)
                    cutoff = frame_end - 1.0
                    fps_tracker = [t for t in fps_tracker if t > cutoff]
                    current_fps = float(len(fps_tracker))

                    # Gửi kết quả về client
                    await self.manager.send_json(
                        session_id,
                        _frame_result_msg(result, current_fps)
                    )

                else:
                    logger.warning(f"[Handler] Unknown message type: {msg_type}")

        except WebSocketDisconnect:
            logger.info(f"[Handler] Client disconnected: {session_id}")
        except Exception as e:
            logger.error(f"[Handler] Unexpected error: {e}", exc_info=True)
            await self.manager.send_json(
                session_id,
                _error_msg("INTERNAL_ERROR", str(e), fatal=True)
            )
        finally:
            if heartbeat_task:
                heartbeat_task.cancel()
            await self.manager.disconnect(session_id)

    # ─── Heartbeat Loop ───────────────────────────────────────────────────────

    async def _heartbeat_loop(self, session_id: str) -> None:
        """Gửi heartbeat định kỳ để giữ kết nối."""
        while True:
            await asyncio.sleep(self.HEARTBEAT_INTERVAL)
            success = await self.manager.send_json(
                session_id,
                _heartbeat_msg()
            )
            if not success:
                break
