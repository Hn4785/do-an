import { useCallback } from 'react';
import { useEmotionStore } from '@/store/useEmotionStore';
import type {
  EmotionLabel,
  EmotionResult,
  EmotionSnapshot,
  EmotionStats,
} from '@/types/emotion.types';

// ============================================================
// Return Type
// ============================================================

interface UseEmotionDataReturn {
  // ===== State =====
  current:         EmotionResult | null;
  currentEmotion:  EmotionLabel | null;
  dominantOverall: EmotionLabel | null;
  history:         EmotionSnapshot[];
  stats:           EmotionStats | null;
  isProcessing:    boolean;
  lastUpdated:     number | null;

  // ===== Actions =====
  processEmotion:  (result: EmotionResult, frameIndex?: number) => void;
  clearHistory:    () => void;
  reset:           () => void;
}

// ============================================================
// Hook
// ============================================================

export function useEmotionData(): UseEmotionDataReturn {
  // ===== Selectors =====
  const current        = useEmotionStore((s) => s.current);
  const history        = useEmotionStore((s) => s.history);
  const stats          = useEmotionStore((s) => s.stats);
  const isProcessing   = useEmotionStore((s) => s.isProcessing);
  const lastUpdated    = useEmotionStore((s) => s.lastUpdated);

  // ===== Actions =====
  const updateEmotion  = useEmotionStore((s) => s.updateEmotion);
  const clearHistory   = useEmotionStore((s) => s.clearHistory);
  const reset          = useEmotionStore((s) => s.reset);

  // ===== Derived =====
  const currentEmotion  = current?.dominant ?? null;

  // Tính dominant overall từ stats (cảm xúc xuất hiện nhiều nhất)
  const dominantOverall = stats?.mostFrequent ?? null;

  // ===== processEmotion =====
  const processEmotion = useCallback(
    (result: EmotionResult, frameIndex = 0) => {
      if (!result?.dominant || !result?.scores) return;
      updateEmotion(result, frameIndex);
    },
    [updateEmotion]
  );

  return {
    // State
    current,
    currentEmotion,
    dominantOverall,
    history,
    stats,
    isProcessing,
    lastUpdated,

    // Actions
    processEmotion,
    clearHistory,
    reset,
  };
}
