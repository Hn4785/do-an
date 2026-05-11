import { clsx } from 'clsx';
import { useFusionData } from '@/hooks/useFusionData';
import { EMOTION_COLORS, EMOTION_LABELS_VI } from '@/types/emotion.types';
import type { EmotionLabel } from '@/types/emotion.types';
import Tooltip from '@/components/common/Tooltip';

interface FusionVectorDisplayProps {
  className?: string;
  compact?: boolean;
}

const VECTOR_FIELDS: {
  key: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  color: string;
}[] = [
  { key: 'ear',           label: 'EAR',       min: 0,   max: 0.5, color: '#60a5fa' },
  { key: 'mar',           label: 'MAR',       min: 0,   max: 0.8, color: '#34d399' },
  { key: 'browDistance',  label: 'Brow Dist', min: 0,   max: 0.3, color: '#a78bfa' },
  { key: 'muscleTension', label: 'Tension',   min: 0,   max: 100, color: '#f87171' },
  { key: 'headPitch',     label: 'Pitch', unit: '°', min: -45, max: 45, color: '#fb923c' },
  { key: 'headYaw',       label: 'Yaw',   unit: '°', min: -45, max: 45, color: '#fbbf24' },
  { key: 'headRoll',      label: 'Roll',  unit: '°', min: -45, max: 45, color: '#e879f9' },
];

export default function FusionVectorDisplay({ className, compact = false }: FusionVectorDisplayProps) {
  // ✅ Fix: dùng fusionResult thay vì fusionVector
  const { fusionResult, isReady } = useFusionData();

  if (!isReady || !fusionResult) {
    return (
      <div className={clsx('flex items-center justify-center py-6', className)}>
        <p className="text-xs text-gray-600">Chưa có dữ liệu fusion</p>
      </div>
    );
  }

  // ✅ Map FusionResult → flat object để dùng với VECTOR_FIELDS
  const vectorFlat: Record<string, number> = {
    ear:           fusionResult.features.blink.ear.average,
    mar:           fusionResult.features.mouth.mar.value,
    browDistance:  fusionResult.features.brow.innerDistance,
    muscleTension: fusionResult.features.tension.overallScore,
    headPitch:     fusionResult.features.headPose?.pitch ?? 0,
    headYaw:       fusionResult.features.headPose?.yaw   ?? 0,
    headRoll:      fusionResult.features.headPose?.roll  ?? 0,
  };

  // ✅ Map EmotionScore[] → Record<EmotionLabel, number>
  const emotionScoresMap = Object.fromEntries(
    fusionResult.emotion.scores.map((s) => [s.label, s.score])
  ) as Record<EmotionLabel, number>;

  const getBarWidth = (value: number, min: number, max: number): number => {
    const range = max - min;
    return Math.min(100, Math.max(0, ((value - min) / range) * 100));
  };

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2 flex-wrap', className)}>
        {VECTOR_FIELDS.slice(0, 4).map((field) => {
          const val = vectorFlat[field.key] ?? 0;
          return (
            <div key={field.key} className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">{field.label}</span>
              <span className="text-xs font-mono" style={{ color: field.color }}>
                {val.toFixed(2)}{field.unit ?? ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Tooltip content="Vector đặc trưng tổng hợp từ facial features + emotion scores">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-help">
            Fusion Vector 🔬
          </span>
        </Tooltip>
        <span className="text-[10px] text-gray-600 font-mono">
          t={new Date(fusionResult.fusedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Feature bars */}
      <div className="space-y-2">
        {VECTOR_FIELDS.map((field) => {
          const val = vectorFlat[field.key] ?? 0;
          const pct = getBarWidth(val, field.min, field.max);

          return (
            <div key={field.key} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-16 shrink-0">{field.label}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: field.color }}
                />
              </div>
              <span className="text-[10px] font-mono w-12 text-right shrink-0" style={{ color: field.color }}>
                {val.toFixed(2)}{field.unit ?? ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Emotion scores mini */}
      <div className="pt-2 border-t border-gray-800">
        <p className="text-[10px] text-gray-500 mb-2">Emotion Scores</p>
        <div className="grid grid-cols-7 gap-1">
          {(Object.entries(emotionScoresMap) as [EmotionLabel, number][]).map(([label, score]) => (
            <div key={label} className="text-center">
              <div
                className="rounded-sm mx-auto w-3 transition-all duration-300"
                style={{
                  background: EMOTION_COLORS[label],
                  opacity: 0.3 + score * 0.7,
                  height: `${Math.max(4, score * 32)}px`,
                }}
              />
              <p className="text-[8px] text-gray-600 mt-0.5">
                {EMOTION_LABELS_VI[label]?.slice(0, 3)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dominant emotion */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50">
        <span className="text-xs text-gray-400">Cảm xúc chủ đạo:</span>
        <span
          className="text-xs font-semibold"
          style={{ color: EMOTION_COLORS[fusionResult.emotion.dominant] }}
        >
          {EMOTION_LABELS_VI[fusionResult.emotion.dominant] ?? fusionResult.emotion.dominant}
        </span>
      </div>
    </div>
  );
}
