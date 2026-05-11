import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { EMOTION_COLORS, EMOTION_LABELS, EMOTION_LABELS_VI } from '@/types/emotion.types';
import type { EmotionSnapshot } from '@/types/emotion.types';

// ✅ Fix: import named function thay vì object formatters
import { formatTime } from '@/utils/formatters';

interface EmotionChartProps {
  history: EmotionSnapshot[];
  maxPoints?: number;
  className?: string;
}

export default function EmotionChart({
  history,
  maxPoints = 60,
  className,
}: EmotionChartProps) {
  const data = history.slice(-maxPoints).map((snap) => {
    const point: Record<string, number | string> = {
      // ✅ Fix: dùng formatTime thay vì formatters.time
      time: formatTime(snap.timestamp),
    };
    snap.result.scores.forEach((s) => {
      point[s.label] = +(s.percentage.toFixed(1));
    });
    return point;
  });

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 text-gray-500 text-sm ${className}`}>
        Chưa có dữ liệu cảm xúc
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ fontSize: 11 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value: string) => EMOTION_LABELS_VI[value as keyof typeof EMOTION_LABELS_VI] ?? value}
          />
          {EMOTION_LABELS.map((label) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={EMOTION_COLORS[label]}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
