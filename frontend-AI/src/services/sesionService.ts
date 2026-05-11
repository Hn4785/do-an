import type {
  Session,
  SessionSummary,
  SessionStatus,
  SessionEndReason,
} from '@/types/session.types';
import { DEFAULT_SESSION_CONFIG } from '@/types/session.types';
import type { WsSessionConfig } from '@/types/websocket.types';
import { useSessionStore } from '@/store/useSessionStore';
import { websocketService } from './websocketService';

// ============================================================
// 🎯 Session Service
// ============================================================

class SessionService {
  private elapsedTimer: ReturnType<typeof setInterval> | null = null;

  // ============================================================
  // 🚀 Bắt đầu phiên
  // ============================================================

  /**
   * Gửi lệnh start_session lên backend qua WebSocket.
   * Store sẽ được cập nhật khi nhận được `session_started` từ backend.
   */
  requestStart(config?: Partial<WsSessionConfig>): void {
    const mergedConfig: WsSessionConfig = {
      ...DEFAULT_SESSION_CONFIG,
      ...config,
    };

    // Cập nhật store sang trạng thái "starting"
    useSessionStore.getState().setStatus('starting');

    // Gửi lệnh qua WebSocket
    websocketService.startSession(mergedConfig);
  }

  /**
   * Gọi sau khi nhận `session_started` từ backend.
   * Khởi tạo session trong store và bắt đầu đếm thời gian.
   */
  onSessionStarted(
    sessionId: string,
    config: WsSessionConfig,
    startedAt: number
  ): void {
    useSessionStore.getState().startSession(sessionId, config);
    websocketService.setSessionId(sessionId);
    this.startElapsedTimer();
  }

  // ============================================================
  // ⏸️ Tạm dừng / Tiếp tục
  // ============================================================

  requestPause(): void {
    const { current } = useSessionStore.getState();
    if (!current || current.status !== 'running') return;

    useSessionStore.getState().pauseSession();
    websocketService.pauseSession(current.sessionId);
    this.stopElapsedTimer();
  }

  requestResume(): void {
    const { current } = useSessionStore.getState();
    if (!current || current.status !== 'paused') return;

    useSessionStore.getState().resumeSession();
    websocketService.resumeSession(current.sessionId);
    this.startElapsedTimer();
  }

  // ============================================================
  // 🛑 Dừng phiên
  // ============================================================

  requestStop(): void {
    const { current } = useSessionStore.getState();
    if (!current) return;

    useSessionStore.getState().setStatus('stopping');
    websocketService.stopSession(current.sessionId);
    this.stopElapsedTimer();
  }

  /**
   * Gọi sau khi nhận `session_ended` từ backend.
   */
  onSessionEnded(
    sessionId: string,
    endedAt: number,
    reason: SessionEndReason
  ): void {
    this.stopElapsedTimer();
    useSessionStore.getState().endSession(reason);

    // Tạo summary và lưu vào history
    const { current } = useSessionStore.getState();
    if (current) {
      const summary = this.buildSummary(current, endedAt);
      useSessionStore.getState().saveToHistory(summary);
    }

    // Reset sessionId trong websocketService
    websocketService.setSessionId(null);
  }

  // ============================================================
  // 📊 Cập nhật frame stats
  // ============================================================

  updateFrameStats(totalFrames: number, averageFps: number): void {
    useSessionStore.getState().updateFrameStats(totalFrames, averageFps);
  }

  // ============================================================
  // 🎯 Calibration
  // ============================================================

  requestCalibration(): void {
    const { current } = useSessionStore.getState();
    if (!current || current.status !== 'running') return;

    useSessionStore.getState().startCalibration();

    // Gửi lệnh calibration qua WebSocket (nếu backend hỗ trợ)
    websocketService.send({
      type:      'start_calibration' as any,
      timestamp: Date.now(),
      messageId: crypto.randomUUID(),
      payload:   {},
    } as any);
  }

  onCalibrationDone(
    success: boolean,
    baselineEar: number,
    baselineMar: number
  ): void {
    if (success) {
      useSessionStore.getState().finishCalibration(baselineEar, baselineMar);
    } else {
      // Nếu thất bại, vẫn kết thúc calibration
      useSessionStore.getState().finishCalibration(0, 0);
      console.warn('[SessionService] Calibration failed');
    }
  }

  // ============================================================
  // ⏱️ Elapsed Timer
  // ============================================================

  private startElapsedTimer(): void {
    this.stopElapsedTimer();
    this.elapsedTimer = setInterval(() => {
      useSessionStore.getState().tickElapsed();
    }, 1000);
  }

  private stopElapsedTimer(): void {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
  }

  // ============================================================
  // 🔧 Helpers
  // ============================================================

  private buildSummary(session: Session, endedAt: number): SessionSummary {
    return {
      sessionId:       session.sessionId,
      startedAt:       session.startedAt,
      endedAt,
      durationMs:      endedAt - session.startedAt,
      totalFrames:     session.totalFrames,
      averageFps:      session.averageFps,
      // Các field thống kê sẽ được cập nhật từ report API sau
      totalBlinks:     0,
      avgBlinkRate:    0,
      avgStressScore:  0,
      peakStressScore: 0,
      dominantEmotion: 'neutral',
      totalAlerts:     0,
    };
  }

  /** Lấy trạng thái phiên hiện tại */
  get currentSession(): Session | null {
    return useSessionStore.getState().current;
  }

  get isRunning(): boolean {
    return useSessionStore.getState().current?.status === 'running';
  }

  get isPaused(): boolean {
    return useSessionStore.getState().current?.status === 'paused';
  }

  /** Reset toàn bộ session state */
  reset(): void {
    this.stopElapsedTimer();
    useSessionStore.getState().reset();
  }
}

// ============================================================
// 🏭 Singleton export
// ============================================================

export const sessionService = new SessionService();
export default sessionService;