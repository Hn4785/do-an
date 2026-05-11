import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { ReportTimelinePoint } from '@/types/report.types';

// ✅ Fix 1: Không import formatters, tự viết hàm elapsed
const formatElapsed = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

interface StressChartProps {
  timeline: ReportTimelinePoint[];
  warningThreshold?: number;
  criticalThreshold?: number;
  className?: string;
}

export default function StressChart({
  timeline,
  warningThreshold = 60,
  criticalThreshold = 85,
  className,
}: StressChartProps) {
  const data = timeline.map((p) => ({
    time:   formatElapsed(p.elapsedSec),   // ✅ Fix 1
    stress: p.stressScore,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            unit="%"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            // ✅ Fix 2: cast sang Number để tránh lỗi ValueType
            formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Stress']}
          />
          <ReferenceLine
            y={warningThreshold}
            stroke="#f59e0b"
            strokeDasharray="4 2"
            label={{ value: 'Cảnh báo', fill: '#f59e0b', fontSize: 10 }}
          />
          <ReferenceLine
            y={criticalThreshold}
            stroke="#ef4444"
            strokeDasharray="4 2"
            label={{ value: 'Nguy hiểm', fill: '#ef4444', fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="stress"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#stressGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
