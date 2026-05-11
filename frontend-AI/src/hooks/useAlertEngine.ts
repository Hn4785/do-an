import { useEffect, useRef, useCallback } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { useFeatureStore } from '@/store/useFeatureStore';
import {
  STRESS_ALERT_COOLDOWN_MS,
  LOW_BLINK_RATE_THRESHOLD,
  FATIGUE_ALERT_DURATION_MS,
  EAR_THRESHOLD_FATIGUE,
} from '@/utils/constants';
import type { Alert, AlertType, AlertSeverity, AlertData } from '@/types/alert.types';

export function useAlertEngine(blinkRatePpm: number, stressScore: number) {
  const addAlert = useAlertStore((s) => s.addAlert);
  const rules    = useAlertStore((s) => s.rules);
  const current  = useFeatureStore((s) => s.current);

  const lastStressAlertRef  = useRef<number>(0);
  const lastFatigueAlertRef = useRef<number>(0);
  const lastBlinkAlertRef   = useRef<number>(0);

  // ✅ Fix 1: Dùng Alert (không phải AlertEvent), đúng với alert.types.ts
  const createAlert = useCallback((
    alertType: AlertType,
    severity:  AlertSeverity,
    message:   string,
    data:      AlertData = {}
  ): Alert => ({
    alertId:     `${alertType}_${Date.now()}`,
    alertType,
    severity,
    message,
    triggeredAt: Date.now(),
    isRead:      false,
    data,
  }), []);

  useEffect(() => {
    const now = Date.now();

    // ===== Cảnh báo stress =====
    // ✅ Fix 2: Dùng rule.alertType (không phải rule.id)
    const stressRule      = rules.find((r) => r.alertType === 'stress_high');
    const stressThreshold = stressRule?.threshold ?? 70;

    if (
      stressScore >= stressThreshold &&
      now - lastStressAlertRef.current > STRESS_ALERT_COOLDOWN_MS
    ) {
      lastStressAlertRef.current = now;

      // ✅ Fix 3: Dùng đúng AlertType từ union ('stress_high' | 'stress_critical')
      const alertType: AlertType = stressScore >= 85 ? 'stress_critical' : 'stress_high';

      addAlert(createAlert(
        alertType,
        stressScore >= 85 ? 'critical' : 'warning',
        `Mức độ căng thẳng: ${stressScore}%`,
        { currentValue: stressScore / 100, threshold: stressThreshold / 100 }
      ));
    }

    // ===== Cảnh báo mệt mỏi (EAR thấp) =====
    // ✅ Fix 4: Dùng current.blink.ear.average (FaceFeatures structure)
    const earValue = current?.blink?.ear?.average;

    if (
      earValue !== undefined &&
      earValue < EAR_THRESHOLD_FATIGUE &&
      now - lastFatigueAlertRef.current > FATIGUE_ALERT_DURATION_MS
    ) {
      lastFatigueAlertRef.current = now;
      addAlert(createAlert(
        'blink_low',   // ✅ AlertType hợp lệ
        'warning',
        `Phát hiện dấu hiệu mệt mỏi (EAR: ${earValue.toFixed(3)})`,
        { currentValue: earValue, threshold: EAR_THRESHOLD_FATIGUE }
      ));
    }

    // ===== Cảnh báo nháy mắt thấp =====
    if (
      blinkRatePpm > 0 &&
      blinkRatePpm < LOW_BLINK_RATE_THRESHOLD &&
      now - lastBlinkAlertRef.current > STRESS_ALERT_COOLDOWN_MS
    ) {
      lastBlinkAlertRef.current = now;
      addAlert(createAlert(
        'no_blink_long',   // ✅ AlertType hợp lệ
        'info',
        `Tần suất nháy mắt thấp: ${blinkRatePpm.toFixed(1)} lần/phút`,
        { currentValue: blinkRatePpm, threshold: LOW_BLINK_RATE_THRESHOLD }
      ));
    }

    // ===== Cảnh báo jaw tension =====
    const jawScore = current?.tension?.jawScore;
    const jawRule  = rules.find((r) => r.alertType === 'jaw_tension_high');
    const jawThreshold = jawRule?.threshold ?? 70;

    if (
      jawScore !== undefined &&
      jawScore >= jawThreshold &&
      now - lastStressAlertRef.current > (jawRule?.cooldownMs ?? STRESS_ALERT_COOLDOWN_MS)
    ) {
      addAlert(createAlert(
        'jaw_tension_high',
        'warning',
        `Căng thẳng hàm cao: ${jawScore.toFixed(0)}%`,
        { currentValue: jawScore / 100, threshold: jawThreshold / 100 }
      ));
    }

  }, [stressScore, blinkRatePpm, current, rules, addAlert, createAlert]);
}
