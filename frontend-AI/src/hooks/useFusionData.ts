import { useMemo } from 'react';
import { useFeatureStore } from '@/store/useFeatureStore';
import { useEmotionStore } from '@/store/useEmotionStore';
import type { FusionResult, FocusLevel } from '@/types/fusion.types';

interface UseFusionDataReturn {
  fusionResult:  FusionResult | null;
  isReady:       boolean;
  stressScore:   number;
  focusLevel:    FocusLevel;
}

// ===== Tính FocusLevel từ stressScore + blinkCategory =====
const calcFocusLevel = (
  stressScore: number,
  blinkCategory: string
): FocusLevel => {
  if (stressScore >= 70) return 'low';
  if (
    blinkCategory === 'very_slow' ||
    blinkCategory === 'very_fast'
  ) return 'medium';
  if (stressScore >= 40) return 'medium';
  return 'high';
};

export function useFusionData(): UseFusionDataReturn {
  // ===== Selectors =====
  const feature       = useFeatureStore((s) => s.current);
  const emotionResult = useEmotionStore((s) => s.current);   // EmotionResult | null

  const fusionResult = useMemo((): FusionResult | null => {
    if (!feature || !emotionResult) return null;

    // Tính stress từ tension.overallScore (0–100)
    const stressScore = feature.tension.overallScore;

    // Tính focusLevel
    const focusLevel = calcFocusLevel(
      stressScore,
      feature.blink.rateCategory
    );

    return {
      features:    feature,
      emotion:     emotionResult,
      stressScore,
      focusLevel,
      fusedAt:     Date.now(),
      frameIndex:  0,    // Cập nhật từ WS message nếu cần
      currentFps:  0,    // Cập nhật từ WS message nếu cần
    };
  }, [feature, emotionResult]);

  return {
    fusionResult,
    isReady:     fusionResult !== null,
    stressScore: fusionResult?.stressScore ?? 0,
    focusLevel:  fusionResult?.focusLevel  ?? 'unknown',
  };
}
