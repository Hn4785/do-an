import { clsx } from 'clsx';
import { useFeatureStore } from '@/store/useFeatureStore';
import type { BrowFurrowLevel } from '@/types/feature.types';

interface BrowIndicatorProps {
  className?: string;
}

const FURROW_CONFIG: Record<BrowFurrowLevel, {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  bars: number;
}> = {
  none:     { label: 'Bình thường', emoji: '😐', color: 'text-green-400',  bg: 'bg-green-500',  bars: 1 },
  slight:   { label: 'Nhíu nhẹ',   emoji: '🤨', color: 'text-yellow-400', bg: 'bg-yellow-500', bars: 2 },
  moderate: { label: 'Nhíu vừa',   emoji: '😤', color: 'text-orange-400', bg: 'bg-orange-500', bars: 3 },
  strong:   { label: 'Nhíu mạnh',  emoji: '😠', color: 'text-red-400',    bg: 'bg-red-500',    bars: 4 },
};

export default function BrowIndicator({ className }: BrowIndicatorProps) {
  const current = useFeatureStore((s) => s.current);

  const furrowLevel = current?.brow.furrowLevel ?? 'none';
  const innerDist   = current?.brow.innerDistance ?? null;
  const isAsymmetric = current?.brow.isAsymmetric ?? false;

  const cfg = FURROW_CONFIG[furrowLevel];

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Lông Mày 🤨
        </span>
        {isAsymmetric && (
          <span className="text-[10px] text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded-full">
            Bất đối xứng
          </span>
        )}
      </div>

      {/* Emoji + Label */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{cfg.emoji}</span>
        <div>
          <p className={clsx('text-sm font-semibold', cfg.color)}>{cfg.label}</p>
          {innerDist !== null && (
            <p className="text-xs text-gray-500">
              Khoảng cách: {innerDist.toFixed(3)}
            </p>
          )}
        </div>
      </div>

      {/* Intensity bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={clsx(
              'flex-1 h-2 rounded-full transition-all duration-300',
              i <= cfg.bars ? cfg.bg : 'bg-gray-800'
            )}
          />
        ))}
      </div>
    </div>
  );
}
