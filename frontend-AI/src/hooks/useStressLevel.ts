import { useMemo } from 'react';
import { EmotionLabel, EmotionResult } from '@/types/emotion.types';
import { FaceFeatures } from '@/types/feature.types';
import {
  STRESS_LOW,
  STRESS_MEDIUM,
  EAR_THRESHOLD_FATIGUE,
  BROW_THRESHOLD_FROWN,
} from '@/utils/constants';

export type StressLevel = 'low' | 'medium' | 'high';

export interface StressAnalysis {
  level:    StressLevel;
  score:    number;       // 0.0 – 1.0
  label:    string;
  color:    string;
  bgColor:  string;
  components: {
    emotionScore: number;
    earScore:     number;
    browScore:    number;
  };
}

// ============================================================
// 🔧 INTERNAL HELPERS
// ============================================================

/** Tính stress từ EmotionResult (dùng scores[] array) */
const calcEmotionStress = (result: EmotionResult): number => {
  const NEGATIVE_EMOTIONS: EmotionLabel[] = ['angry', 'fear', 'disgust', 'sad'];

  const negativeTotal = result.scores
    .filter((s) => NEGATIVE_EMOTIONS.includes(s.label))
    .reduce((sum, s) => sum + s.score, 0); // score đã là 0–1

  return Math.min(negativeTotal, 1);
};

/** Tính stress từ EAR (mắt nhắm = mệt mỏi) */
const calcEARStress = (ear: number): number => {
  if (ear <= 0) return 0;
  if (ear < EAR_THRESHOLD_FATIGUE) return 0.8;
  return 0;
};

/** Tính stress từ brow distance (nhíu mày) */
const calcBrowStress = (browInnerDistance: number): number => {
  if (browInnerDistance <= 0) return 0;
  if (browInnerDistance < BROW_THRESHOLD_FROWN) return 0.6;
  return 0;
};

/** Phân loại mức stress */
const classifyStressLevel = (score: number): StressLevel => {
  if (score <= STRESS_LOW)   return 'low';
  if (score <= STRESS_MEDIUM) return 'medium';
  return 'high';
};

/** Lấy label & màu theo mức stress */
const getStressDisplay = (level: StressLevel) => {
  switch (level) {
    case 'low':
      return { label: 'Thấp',       color: '#22c55e', bgColor: '#dcfce7' };
    case 'medium':
      return { label: 'Trung bình', color: '#f59e0b', bgColor: '#fef3c7' };
    case 'high':
      return { label: 'Cao',        color: '#ef4444', bgColor: '#fee2e2' };
  }
};

// ============================================================
// 🎯 HOOK CHÍNH
// ============================================================

/**
 * Tính toán mức độ stress từ FaceFeatures + EmotionResult
 *
 * @param feature  - Dữ liệu khuôn mặt hiện tại (từ useFeatureStore)
 * @param emotion  - Kết quả cảm xúc hiện tại (từ useEmotionStore)
 */
export const useStressLevel = (
  feature: FaceFeatures | null,
  emotion:  EmotionResult | null
): StressAnalysis => {
  return useMemo(() => {
    // Giá trị mặc định khi chưa có dữ liệu
    if (!feature && !emotion) {
      return {
        level:   'low',
        score:   0,
        label:   'Thấp',
        color:   '#22c55e',
        bgColor: '#dcfce7',
        components: { emotionScore: 0, earScore: 0, browScore: 0 },
      };
    }

    // ===== Tính từng thành phần =====
    const emotionScore = emotion
      ? calcEmotionStress(emotion)
      : 0;

    const earScore = feature
      ? calcEARStress(feature.blink.ear.average)
      : 0;

    const browScore = feature
      ? calcBrowStress(feature.brow.innerDistance)
      : 0;

    // ===== Tổng hợp (weighted average) =====
    // Emotion: 50%, EAR: 30%, Brow: 20%
    const totalScore =
      emotionScore * 0.5 +
      earScore     * 0.3 +
      browScore    * 0.2;

    const clampedScore = Math.max(0, Math.min(1, totalScore));
    const level        = classifyStressLevel(clampedScore);
    const display      = getStressDisplay(level);

    return {
      level,
      score: clampedScore,
      ...display,
      components: { emotionScore, earScore, browScore },
    };
  }, [feature, emotion]);
};
