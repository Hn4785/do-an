import { EMOTION_COLORS, EMOTION_ICONS, EMOTION_LABELS_VI } from '@/types/emotion.types';
import type { EmotionSnapshot } from '@/types/emotion.types';
import { formatTime } from '@/utils/formatters';   // ✅ Fix: import named function
import { clsx } from 'clsx';

interface EmotionHistoryProps {
  history: EmotionSnapshot[];
  maxItems?: number;
  className?: string;
}

export default function EmotionHistory({
  history,
  maxItems = 20,
  className,
}: EmotionHistoryProps) {
  const items = [...history].reverse().slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className={clsx('text-center text-gray-500 text-sm py-8', className)}>
        Chưa có lịch sử cảm xúc
      </div>
    );
  }

  return (
    <div className={clsx('space-y-1 overflow-y-auto', className)}>
      {items.map((snap, idx) => {
        const { dominant, dominantScore } = snap.result;
        const color = EMOTION_COLORS[dominant];

        return (
          <div
            key={idx}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {idx < items.length - 1 && (
                <div className="w-px h-4 bg-gray-700 mt-1" />
              )}
            </div>

            {/* Emotion info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span>{EMOTION_ICONS[dominant]}</span>
                <span className="text-sm font-medium" style={{ color }}>
                  {EMOTION_LABELS_VI[dominant]}
                </span>
                <span className="text-xs text-gray-500">
                  {(dominantScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <span className="text-xs text-gray-500 shrink-0">
              {formatTime(snap.timestamp)}  {/* ✅ Fix: gọi trực tiếp */}
            </span>
          </div>
        );
      })}
    </div>
  );
}
