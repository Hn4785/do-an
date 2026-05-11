import { clsx } from 'clsx';
import { useFeatureStore } from '@/store/useFeatureStore';
import type { MouthState, LipCornerState } from '@/types/feature.types';

// ============================================================
// 🗺️ Config Maps
// ============================================================

const MOUTH_STATE_CONFIG: Record<
  MouthState,
  { label: string; color: string; bgColor: string; emoji: string }
> = {
  closed:        { label: 'Đóng',      color: 'text-gray-400',  bgColor: 'bg-gray-800/60',    emoji: '😐' },
  slightly_open: { label: 'Hé mở',     color: 'text-blue-400',  bgColor: 'bg-blue-900/40',    emoji: '🙂' },
  open:          { label: 'Mở',        color: 'text-yellow-400',bgColor: 'bg-yellow-900/40',  emoji: '😮' },
  wide_open:     { label: 'Há rộng',   color: 'text-orange-400',bgColor: 'bg-orange-900/40',  emoji: '😲' },
};

const LIP_CORNER_CONFIG: Record<
  LipCornerState,
  { label: string; color: string }
> = {
  none:   { label: 'Trung tính', color: 'text-gray-400' },
  slight: { label: 'Nhếch nhẹ', color: 'text-green-400' },
  smile:  { label: 'Cười',      color: 'text-emerald-400' },
  frown:  { label: 'Mếu',       color: 'text-red-400' },
};

// ============================================================
// 🔧 Sub-components
// ============================================================

interface MarBarProps {
  value: number;
  baseline: number;
}

function MarBar({ value, baseline }: MarBarProps) {
  // Normalize MAR về 0-100% dựa trên baseline
  const pct = Math.min(100, (value / Math.max(baseline * 3, 0.3)) * 100);
  const isAboveBaseline = value > baseline;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">MAR</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-[10px]">
            baseline: {baseline.toFixed(3)}
          </span>
          <span
            className={clsx(
              'font-mono font-semibold',
              isAboveBaseline ? 'text-yellow-400' : 'text-gray-300'
            )}
          >
            {value.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        {/* Baseline marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
          style={{ left: `${(1 / 3) * 100}%` }}
        />
        {/* Fill */}
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-200',
            pct > 66 ? 'bg-orange-500' : pct > 33 ? 'bg-yellow-500' : 'bg-blue-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// 🎯 Main Component
// ============================================================

interface MouthIndicatorProps {
  className?: string;
  compact?: boolean;
}

export default function MouthIndicator({
  className,
  compact = false,
}: MouthIndicatorProps) {
  const mouth = useFeatureStore((s) => s.current?.mouth ?? null);
  const faceDetected = useFeatureStore((s) => s.faceDetected);

  // ── No face ──────────────────────────────────────────────
  if (!faceDetected || !mouth) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900/60',
          compact ? 'px-3 py-2' : 'px-4 py-3',
          className
        )}
      >
        <span className="text-xs text-gray-600 italic">Không phát hiện khuôn mặt</span>
      </div>
    );
  }

  const stateConfig = MOUTH_STATE_CONFIG[mouth.state];
  const lipConfig   = LIP_CORNER_CONFIG[mouth.lipCorner];

  // ── Compact mode ─────────────────────────────────────────
  if (compact) {
    return (
      <div
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
          stateConfig.bgColor,
          'border-gray-700/50',
          className
        )}
      >
        <span className="text-base leading-none">{stateConfig.emoji}</span>
        <span className={clsx('text-xs font-medium', stateConfig.color)}>
          {stateConfig.label}
        </span>
        {mouth.isTalking && (
          <span className="text-[10px] text-indigo-400 font-medium animate-pulse">
            Đang nói
          </span>
        )}
      </div>
    );
  }

  // ── Full mode ─────────────────────────────────────────────
  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-800 bg-gray-900/80 p-4 space-y-3',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Miệng
        </span>
        {mouth.isTalking && (
          <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Đang nói
          </span>
        )}
      </div>

      {/* State badge */}
      <div
        className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg',
          stateConfig.bgColor
        )}
      >
        <span className="text-2xl leading-none">{stateConfig.emoji}</span>
        <div>
          <p className={clsx('text-sm font-semibold', stateConfig.color)}>
            {stateConfig.label}
          </p>
          <p className="text-[10px] text-gray-500">Trạng thái miệng</p>
        </div>
      </div>

      {/* MAR Bar */}
      <MarBar value={mouth.mar.value} baseline={mouth.mar.baseline} />

      {/* Lip corner + Corner angle */}
      <div className="grid grid-cols-2 gap-2">
        {/* Lip corner */}
        <div className="bg-gray-800/50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-500 mb-0.5">Khóe môi</p>
          <p className={clsx('text-xs font-semibold', lipConfig.color)}>
            {lipConfig.label}
          </p>
        </div>

        {/* Corner angle */}
        <div className="bg-gray-800/50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-500 mb-0.5">Góc môi</p>
          <p
            className={clsx(
              'text-xs font-mono font-semibold',
              mouth.cornerAngle > 0
                ? 'text-green-400'
                : mouth.cornerAngle < 0
                ? 'text-red-400'
                : 'text-gray-400'
            )}
          >
            {mouth.cornerAngle > 0 ? '+' : ''}
            {mouth.cornerAngle.toFixed(1)}°
          </p>
        </div>
      </div>
    </div>
  );
}
