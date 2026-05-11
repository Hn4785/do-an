import { create } from 'zustand';
import type { WsSessionConfig } from '@/types/websocket.types';

interface SettingsState {
  sessionConfig: WsSessionConfig;
  updateConfig: (patch: Partial<WsSessionConfig>) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: WsSessionConfig = {
  targetFps:            10,
  resolution:           '720p',
  enableBlink:          true,
  enableEmotion:        true,
  enableMuscleTension:  true,
  enableHeadPose:       true,
  stressAlertThreshold: 70,
  blinkAlertThreshold:  10,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  sessionConfig: DEFAULT_CONFIG,

  updateConfig: (patch) =>
    set((state) => ({
      sessionConfig: { ...state.sessionConfig, ...patch },
    })),

  resetConfig: () =>
    set({ sessionConfig: DEFAULT_CONFIG }),
}));
