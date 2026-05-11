import { useMemo } from 'react';
import { clsx } from 'clsx';
import { useStressLevel } from '@/hooks/useStressLevel';
import { useFeatureStore } from '@/store/useFeatureStore';
import { useEmotionStore } from '@/store/useEmotionStore';
import Tooltip from '@/components/common/Tooltip';

interface StressGaugeProps {
  className?: string;
  compact?: boolean;
  size?: number;
}

export default function StressGauge({
  className,
  compact = false,
  size = 120,
}: StressGaugeProps) {
  // ✅ Lấy dữ liệu từ store rồi truyền vào hook
  const feature = useFeatureStore((s) => s.current);
  const emotion = useEmotionStore((s) => s.current);

  // ✅ Gọi đúng signature: useStressLevel(feature, emotion)
  const { score, level, label, color, components } = useStressLevel(feature, emotion);

  // ✅ Derived values khớp với StressAnalysis
  const stressScore    = Math.round(score * 100);   // 0–100
  const stressRaw      = score;                      // 0–1
  const stressCategory = level;                      // 'low' | 'medium' | 'high'

  const CATEGORY_CONFIG: Record<
    'low' | 'medium' | 'high',
    { label: string; color: string; textColor: string; bg: string }
  > = {
    low:    { label: 'Thấp',       color: '#4ade80', textColor: 'text-green-400',  bg: 'bg-green-950/40 border-green-800/40' },
    medium: { label: 'Trung bình', color: '#fb923c', textColor: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40' },
    high:   { label: 'Cao',        color: '#f87171', textColor: 'text-red-400',    bg: 'bg-red-950/40 border-red-800/40' },
  };

  // ✅ Fix ts(7053): dùng type-safe key
  const cfg = CATEGORY_CONFIG[stressCategory];

  // SVG Arc gauge
  const radius     = (size - 20) / 2;
  const cx         = size / 2;
  const cy         = size / 2;
  const startAngle = -210;
  const endAngle   = 30;
  const totalAngle = endAngle - startAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number, r: number) => {
    const s     = toRad(start);
    const e     = toRad(end);
    const x1    = cx + r * Math.cos(s);
    const y1    = cy + r * Math.sin(s);
    const x2    = cx + r * Math.cos(e);
    const y2    = cy + r * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const valueAngle = startAngle + stressRaw * totalAngle;
  const trackPath  = arcPath(startAngle, endAngle, radius);
  const fillPath   = arcPath(startAngle, valueAngle, radius);

  // Needle
  const needleAngle = toRad(valueAngle);
  const needleLen   = radius - 8;
  const nx          = cx + needleLen * Math.cos(needleAngle);
  const ny          = cy + needleLen * Math.sin(needleAngle);

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <span className="text-xs text-gray-400">Stress</span>
        <span className={clsx('text-sm font-mono font-bold', cfg.textColor)}>
          {stressScore}%
        </span>
        <span className={clsx('text-xs', cfg.textColor)}>{cfg.label}</span>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Tooltip content="Chỉ số căng thẳng tổng hợp từ cơ mặt, cảm xúc và khoảng cách lông mày">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-help">
            Stress 😤
          </span>
        </Tooltip>
        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border', cfg.bg, cfg.textColor)}>
          {cfg.label}
        </span>
      </div>

      {/* SVG Gauge */}
      <div className="flex justify-center">
        <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#374151"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Fill */}
          <path
            d={fillPath}
            fill="none"
            stroke={cfg.color}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ transition: 'all 0.5s ease' }}
          />

          {/* Needle */}
          <line
            x1={cx} y1={cy}
            x2={nx} y2={ny}
            stroke={cfg.color}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: 'all 0.5s ease' }}
          />
          <circle cx={cx} cy={cy} r="4" fill={cfg.color} />

          {/* Score text */}
          <text
            x={cx} y={cy + 20}
            textAnchor="middle"
            fill={cfg.color}
            fontSize="18"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {stressScore}%
          </text>
        </svg>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {(
          [
            { label: 'Thấp', range: '0-40%',  key: 'low'    as const, color: 'text-green-400'  },
            { label: 'TB',   range: '40-70%', key: 'medium' as const, color: 'text-orange-400' },
            { label: 'Cao',  range: '70%+',   key: 'high'   as const, color: 'text-red-400'    },
          ] as const
        ).map((item) => (
          <div
            key={item.key}
            className={clsx(
              'rounded-lg px-1 py-1.5 border transition-all',
              stressCategory === item.key
                ? 'bg-gray-700/60 border-gray-600'
                : 'bg-gray-800/30 border-gray-800'
            )}
          >
            <p className={clsx('text-xs font-semibold', stressCategory === item.key ? item.color : 'text-gray-600')}>
              {item.label}
            </p>
            <p className="text-[10px] text-gray-600">{item.range}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
