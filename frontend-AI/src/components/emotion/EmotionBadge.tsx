import { clsx } from 'clsx';
import { EMOTION_COLORS, EMOTION_ICONS, EMOTION_LABELS_VI } from '@/types/emotion.types';
import type { EmotionLabel } from '@/types/emotion.types';

interface EmotionBadgeProps {
  emotion: EmotionLabel | null;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

export default function EmotionBadge({
  emotion,
  score,
  size = 'md',
  showScore = false,
  className,
}: EmotionBadgeProps) {
  if (!emotion) {
    return (
      <span className={clsx(
        'inline-flex items-center rounded-full border border-gray-700 bg-gray-800 text-gray-400',
        sizeClasses[size],
        className
      )}>
        <span>😶</span>
        <span>Chưa xác định</span>
      </span>
    );
  }

  const color = EMOTION_COLORS[emotion];
  const icon  = EMOTION_ICONS[emotion];
  const label = EMOTION_LABELS_VI[emotion];

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}22`,
        borderColor:     `${color}55`,
        color,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-70">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
}
