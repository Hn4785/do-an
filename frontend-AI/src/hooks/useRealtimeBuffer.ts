import { useRef, useCallback } from 'react';
import { BUFFER_SIZE } from '@/utils/constants';
import type { FaceFeatures } from '@/types/feature.types';
import type { EmotionSnapshot } from '@/types/emotion.types';

interface RealtimeBuffer {
  features:  FaceFeatures[];
  emotions:  EmotionSnapshot[];
}

interface UseRealtimeBufferReturn {
  pushFeature:    (f: FaceFeatures) => void;
  pushEmotion:    (e: EmotionSnapshot) => void;
  getBuffer:      () => RealtimeBuffer;
  clearBuffer:    () => void;
  getLatestFeature: () => FaceFeatures | null;
  getLatestEmotion: () => EmotionSnapshot | null;
}

export function useRealtimeBuffer(size: number = BUFFER_SIZE): UseRealtimeBufferReturn {
  const bufferRef = useRef<RealtimeBuffer>({ features: [], emotions: [] });

  const pushFeature = useCallback((f: FaceFeatures) => {
    const buf = bufferRef.current.features;
    if (buf.length >= size) buf.shift();
    buf.push(f);
  }, [size]);

  const pushEmotion = useCallback((e: EmotionSnapshot) => {
    const buf = bufferRef.current.emotions;
    if (buf.length >= size) buf.shift();
    buf.push(e);
  }, [size]);

  const getBuffer = useCallback(() => ({ ...bufferRef.current }), []);

  const clearBuffer = useCallback(() => {
    bufferRef.current = { features: [], emotions: [] };
  }, []);

  const getLatestFeature = useCallback((): FaceFeatures | null => {
    const arr = bufferRef.current.features;
    return arr.length > 0 ? arr[arr.length - 1] : null;
  }, []);

  const getLatestEmotion = useCallback((): EmotionSnapshot | null => {
    const arr = bufferRef.current.emotions;
    return arr.length > 0 ? arr[arr.length - 1] : null;
  }, []);

  return { pushFeature, pushEmotion, getBuffer, clearBuffer, getLatestFeature, getLatestEmotion };
}
