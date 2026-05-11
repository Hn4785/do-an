import { clsx } from 'clsx';
import {
  EMOTION_LABELS,
  EMOTION_LABELS_VI,
  EMOTION_COLORS,
  EMOTION_ICONS,
} from '@/types/emotion.types';
import type { EmotionScore, EmotionLabel } from '@/types/emotion.types';

interface EmotionScoreBarProps {
  scores: EmotionScore[] | null;
  dominant?: EmotionLabel | null;
  className?: string;
}

export default function EmotionScoreBar({
  scores,
  dominant,
  className,
}: EmotionScoreBarProps) {
  const scoreMap: Partial<Record<EmotionLabel, number>> = {};
  scores?.forEach((s) => { scoreMap[s.label] = s.percentage; });

  return (
    <div className={clsx('space-y-2', className)}>
      {EMOTION_LABELS.map((label) => {
        const pct   = scoreMap[label] ?? 0;
        const color = EMOTION_COLORS[label];
        const isDominant = label === dominant;

        return (
          <div key={label} className="flex items-center gap-2">
            <span className="w-5 text-center text-sm">{EMOTION_ICONS[label]}</span>
            <span
              className={clsx(
                'w-16 text-xs shrink-0',
                isDominant ? 'text-white font-semibold' : 'text-gray-400'
              )}
            >
              {EMOTION_LABELS_VI[label]}
            </span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="w-10 text-right text-xs font-mono text-gray-400">
              {pct.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
