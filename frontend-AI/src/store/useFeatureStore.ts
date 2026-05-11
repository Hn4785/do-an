import { create } from 'zustand';
import { FaceFeatures, FeatureState } from '@/types/feature.types';

interface FeatureStore extends FeatureState {
  history: FaceFeatures[];
  updateFeature: (feature: FaceFeatures) => void;
  setFaceDetected: (detected: boolean) => void;
  clearHistory: () => void;
  reset: () => void;
}

const MAX_HISTORY = 300; // ~5 phút @ 1fps

export const useFeatureStore = create<FeatureStore>((set) => ({
  // ===== State =====
  current: null,
  faceDetected: false,
  lastUpdated: null,
  history: [],

  // ===== Actions =====
  updateFeature: (feature: FaceFeatures) =>
    set((state) => ({
      current: feature,
      faceDetected: feature.boundingBox !== null,
      lastUpdated: feature.extractedAt,
      history: [...state.history.slice(-MAX_HISTORY + 1), feature],
    })),

  setFaceDetected: (detected: boolean) =>
    set({ faceDetected: detected }),

  clearHistory: () =>
    set({ history: [] }),

  reset: () =>
    set({
      current: null,
      faceDetected: false,
      lastUpdated: null,
      history: [],
    }),
}));