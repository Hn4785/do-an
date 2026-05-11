import { v4 as uuidv4 } from 'uuid';
import {
  Alert,
  AlertRule,
  AlertType,
  AlertSeverity,
  AlertData,
} from '@/types/alert.types';
import { EmotionLabel } from '@/types/emotion.types';
import {
  EAR_THRESHOLD_FATIGUE,
  MAR_THRESHOLD_YAWN,
  BROW_THRESHOLD_FROWN,
  STRESS_MEDIUM,
  STRESS_HIGH,
  LOW_BLINK_RATE_THRESHOLD,
  FATIGUE_ALERT_DURATION_MS,
  STRESS_ALERT_COOLDOWN_MS,
} from './constants';

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    alertType:   'stress_high',
    severity:    'warning',
    enabled:     true,
    threshold:   STRESS_MEDIUM,       // 0.6
    debounceMss: 3000,
    cooldownMs:  STRESS_ALERT_COOLDOWN_MS,
  },
  {
    alertType:   'stress_critical',
    severity:    'critical',
    enabled:     true,
    threshold:   STRESS_HIGH,         // 0.85 (hoặc giá trị bạn muốn)
    debounceMss: 2000,
    cooldownMs:  STRESS_ALERT_COOLDOWN_MS,
  },
  {
    alertType:   'blink_low',
    severity:    'warning',
    enabled:     true,
    threshold:   LOW_BLINK_RATE_THRESHOLD,  // 10 lần/phút
    debounceMss: 5000,
    cooldownMs:  60000,
  },
  {
    alertType:   'blink_high',
    severity:    'info',
    enabled:     true,
    threshold:   30,                  // > 30 lần/phút = lo lắng
    debounceMss: 5000,
    cooldownMs:  60000,
  },
  {
    alertType:   'no_blink_long',
    severity:    'warning',
    enabled:     true,
    threshold:   20000,               // Không nháy mắt > 20 giây
    debounceMss: 0,
    cooldownMs:  30000,
  },
  {
    alertType:   'face_lost',
    severity:    'info',
    enabled:     true,
    threshold:   3000,                // Mất mặt > 3 giây
    debounceMss: 0,
    cooldownMs:  10000,
  },
  {
    alertType:   'emotion_negative',
    severity:    'warning',
    enabled:     true,
    threshold:   15000,               // Cảm xúc tiêu cực > 15 giây
    debounceMss: 2000,
    cooldownMs:  30000,
  },
  {
    alertType:   'jaw_tension_high',
    severity:    'warning',
    enabled:     true,
    threshold:   0.7,                 // Jaw tension > 0.7
    debounceMss: 3000,
    cooldownMs:  30000,
  },
  {
    alertType:   'head_pose_extreme',
    severity:    'info',
    enabled:     true,
    threshold:   30,                  // Góc lệch > 30 độ
    debounceMss: 2000,
    cooldownMs:  15000,
  },
];

export const checkStressHigh = (stressLevel: number, threshold: number): boolean =>
  stressLevel >= threshold;

export const checkBlinkLow = (blinkRate: number, threshold: number): boolean =>
  blinkRate < threshold && blinkRate > 0;

export const checkBlinkHigh = (blinkRate: number, threshold: number): boolean =>
  blinkRate > threshold;

export const checkFaceLost = (isFaceDetected: boolean): boolean =>
  !isFaceDetected;

export const checkNegativeEmotion = (emotion: EmotionLabel): boolean =>
  ['angry', 'fear', 'sad'].includes(emotion);

export const checkJawTension = (jawTension: number, threshold: number): boolean =>
  jawTension >= threshold;

export const checkHeadPoseExtreme = (headAngle: number, threshold: number): boolean =>
  Math.abs(headAngle) > threshold;

export const createAlert = (
  alertType: AlertType,
  severity: AlertSeverity,
  message: string,
  data: AlertData = {}
): Alert => ({
  alertId:     uuidv4(),
  alertType,
  severity,
  message,
  triggeredAt: Date.now(),
  isRead:      false,
  data,
});

export interface AlertSnapshot {
  stressLevel:     number;
  blinkRate:       number;
  isFaceDetected:  boolean;
  dominantEmotion: EmotionLabel;
  jawTension?:     number;
  headAngle?:      number;
  lastBlinkMs?:    number;   // Thời điểm nháy mắt cuối cùng (Unix ms)
}

export const evaluateAlertRules = (
  snapshot: AlertSnapshot,
  rules: AlertRule[],
  lastAlertTimes: Record<AlertType, number>
): Alert[] => {
  const now = Date.now();
  const alerts: Alert[] = [];

  const canTrigger = (alertType: AlertType, cooldownMs: number): boolean => {
    const last = lastAlertTimes[alertType] ?? 0;
    return now - last >= cooldownMs;
  };

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (!canTrigger(rule.alertType, rule.cooldownMs)) continue;

    let triggered = false;
    let message = '';
    let data: AlertData = {};

    switch (rule.alertType) {

      // ===== Stress =====
      case 'stress_high':
        triggered = checkStressHigh(snapshot.stressLevel, rule.threshold);
        message = `Mức căng thẳng đang ở mức cao ( ${(snapshot.stressLevel * 100).toFixed(0)}%). Hãy thư giãn!`;
        data = {
          currentValue: snapshot.stressLevel,
          threshold:    rule.threshold,
        };
        break;

      case 'stress_critical':
        triggered = checkStressHigh(snapshot.stressLevel, rule.threshold);
        message = `⚠️ Căng thẳng ở mức nguy hiểm ( ${(snapshot.stressLevel * 100).toFixed(0)}%)! Nghỉ ngơi ngay!`;
        data = {
          currentValue: snapshot.stressLevel,
          threshold:    rule.threshold,
        };
        break;

      // ===== Blink Rate =====
      case 'blink_low':
        triggered = checkBlinkLow(snapshot.blinkRate, rule.threshold);
        message = `Tần suất nháy mắt quá thấp ( ${snapshot.blinkRate.toFixed(1)} lần/phút). Mắt có thể bị khô!`;
        data = {
          currentValue: snapshot.blinkRate,
          threshold:    rule.threshold,
        };
        break;

      case 'blink_high':
        triggered = checkBlinkHigh(snapshot.blinkRate, rule.threshold);
        message = `Nháy mắt quá nhiều ( ${snapshot.blinkRate.toFixed(1)} lần/phút). Có thể đang lo lắng.`;
        data = {
          currentValue: snapshot.blinkRate,
          threshold:    rule.threshold,
        };
        break;

      // ===== No Blink Long =====
      case 'no_blink_long': {
        const lastBlink = snapshot.lastBlinkMs ?? now;
        const noBlinkDuration = now - lastBlink;
        triggered = noBlinkDuration >= rule.threshold;
        message = `Bạn chưa nháy mắt trong ${Math.round(noBlinkDuration / 1000)} giây. Hãy chớp mắt!`;
        data = {
          durationMs:   noBlinkDuration,
          threshold:    rule.threshold,
        };
        break;
      }

      // ===== Face Lost =====
      case 'face_lost':
        triggered = checkFaceLost(snapshot.isFaceDetected);
        message = 'Không phát hiện khuôn mặt. Hãy nhìn vào camera!';
        data = {};
        break;

      // ===== Emotion Negative =====
      case 'emotion_negative':
        triggered = checkNegativeEmotion(snapshot.dominantEmotion);
        message = `Phát hiện cảm xúc tiêu cực kéo dài. Hãy nghỉ ngơi một chút!`;
        data = {
          emotion: snapshot.dominantEmotion,
        };
        break;

      // ===== Jaw Tension =====
      case 'jaw_tension_high':
        if (snapshot.jawTension !== undefined) {
          triggered = checkJawTension(snapshot.jawTension, rule.threshold);
          message = `Căng thẳng hàm cao ( ${(snapshot.jawTension * 100).toFixed(0)}%). Hãy thả lỏng hàm!`;
          data = {
            currentValue: snapshot.jawTension,
            threshold:    rule.threshold,
          };
        }
        break;

      // ===== Head Pose =====
      case 'head_pose_extreme':
        if (snapshot.headAngle !== undefined) {
          triggered = checkHeadPoseExtreme(snapshot.headAngle, rule.threshold);
          message = `Góc đầu lệch quá nhiều ( ${snapshot.headAngle.toFixed(1)}°). Hãy ngồi thẳng!`;
          data = {
            currentValue: Math.abs(snapshot.headAngle),
            threshold:    rule.threshold,
          };
        }
        break;
    }

    if (triggered) {
      alerts.push(
        createAlert(rule.alertType, rule.severity, message, data)
      );
    }
  }

  return alerts;
};

/** Lấy rule theo alertType */
export const getRuleByType = (
  rules: AlertRule[],
  alertType: AlertType
): AlertRule | undefined =>
  rules.find((r) => r.alertType === alertType);

/** Cập nhật 1 rule trong danh sách */
export const updateRule = (
  rules: AlertRule[],
  alertType: AlertType,
  patch: Partial<AlertRule>
): AlertRule[] =>
  rules.map((r) =>
    r.alertType === alertType ? { ...r, ...patch } : r
  );

/** Đếm số alerts chưa đọc */
export const countUnread = (alerts: Alert[]): number =>
  alerts.filter((a) => !a.isRead).length;

/** Kiểm tra có alert critical chưa đọc không */
export const hasCriticalUnread = (alerts: Alert[]): boolean =>
  alerts.some((a) => a.severity === 'critical' && !a.isRead);