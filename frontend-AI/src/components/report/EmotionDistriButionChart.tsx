import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useState } from 'react';
import {
  EMOTION_COLORS,
  EMOTION_LABELS_VI,
  EMOTION_LABELS,
} from '@/types/emotion.types';
import type { EmotionLabel } from '@/types/emotion.types';

interface EmotionDistributionChartProps {
  distribution: Record<EmotionLabel, number>; // 0–100 (%)
  className?: string;
}

type ChartMode = 'pie' | 'bar';

export default function EmotionDistributionChart({
  distribution,
  className,
}: EmotionDistributionChartProps) {
  const [mode, setMode] = useState<ChartMode>('pie');

  // Chuẩn bị data từ distribution
  const data = EMOTION_LABELS
    .map((label) => ({
      label,
      name:  EMOTION_LABELS_VI[label],
      value: +(distribution[label] ?? 0).toFixed(1),
      color: EMOTION_COLORS[label],
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-48 text-gray-500 text-sm ${className ?? ''}`}
      >
        Chưa có dữ liệu phân bố cảm xúc
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toggle Pie / Bar */}
      <div className="flex justify-end mb-3 gap-1">
        {(['pie', 'bar'] as ChartMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              mode === m
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {m === 'pie' ? '🥧 Pie' : '📊 Bar'}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        {mode === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
              }}
              // ✅ Fix: cast value sang number để tránh lỗi ValueType | undefined
              formatter={(value, name) => [
                `${Number(value).toFixed(1)}%`,
                name as string,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value: string) => value}
            />
          </PieChart>
        ) : (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 60, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              width={56}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
              }}
              // ✅ Fix: cast value sang number để tránh lỗi ValueType | undefined
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Tỉ lệ']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
