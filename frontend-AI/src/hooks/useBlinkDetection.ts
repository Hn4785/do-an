import { useRef, useCallback, useEffect } from 'react';
import { BLINK_RATE_WINDOW_SEC } from '@/utils/constants';
import { useFeatureStore } from '@/store/useFeatureStore';

interface UseBlinkDetectionReturn {
  blinkCount:    number;
  blinkRatePpm:  number;
  resetBlink:    () => void;
}

export function useBlinkDetection(): UseBlinkDetectionReturn {
  const blinkCountRef = useRef(0);
  const blinkTimesRef = useRef<number[]>([]);
  const prevIsBlinking = useRef(false);

  const current = useFeatureStore((s) => s.current);

  // ===== Tính blink rate =====
  const getBlinkRate = useCallback((): number => {
    const now = Date.now();
    const windowMs = BLINK_RATE_WINDOW_SEC * 1000;
    const recent = blinkTimesRef.current.filter((t) => now - t <= windowMs);
    blinkTimesRef.current = recent;
    return (recent.length / BLINK_RATE_WINDOW_SEC) * 60;
  }, []);

  // ===== Auto-detect từ BlinkData trong FaceFeatures =====
  useEffect(() => {
    if (!current) return;

    const isBlinking = current.blink.isBlinking;

    // Phát hiện trailing edge (kết thúc nháy mắt)
    if (prevIsBlinking.current && !isBlinking) {
      blinkCountRef.current += 1;
      blinkTimesRef.current.push(Date.now());
    }

    prevIsBlinking.current = isBlinking;
  }, [current]);

  const resetBlink = useCallback(() => {
    blinkCountRef.current = 0;
    blinkTimesRef.current = [];
    prevIsBlinking.current = false;
  }, []);

  return {
    blinkCount:   blinkCountRef.current,
    blinkRatePpm: getBlinkRate(),
    resetBlink,
  };
}
