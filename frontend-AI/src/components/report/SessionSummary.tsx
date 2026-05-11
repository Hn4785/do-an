import { Clock, Eye, Brain, Bell, Zap } from 'lucide-react';
import Card from '@/components/common/Card';

// ✅ Fix: import named function thay vì object formatters
import { formatDuration } from '@/utils/formatters';

import type { SessionSummary as SessionSummaryType } from '@/types/session.types';
import { EMOTION_ICONS, EMOTION_LABELS_VI } from '@/types/emotion.types';
import type { EmotionLabel } from '@/types/emotion.types';

interface SessionSummaryProps {
  summary: SessionSummaryType;
  className?: string;
}

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export default function SessionSummary({ summary, className }: SessionSummaryProps) {
  const stats: StatItem[] = [
    {
      icon: <Clock size={18} />,
      label: 'Thời lượng',
      // ✅ Fix: dùng formatDuration thay vì formatters.duration
      value: formatDuration(summary.durationMs),
      color: 'text-indigo-400',
    },
    {
      icon: <Eye size={18} />,
      label: 'Nháy mắt',
      value: `${summary.totalBlinks} lần`,
      sub: `TB ${summary.avgBlinkRate.toFixed(1)} lần/phút`,
      color: 'text-cyan-400',
    },
    {
      icon: <Brain size={18} />,
      label: 'Stress TB',
      value: `${summary.avgStressScore.toFixed(0)}%`,
      sub: `Cao nhất: ${summary.peakStressScore.toFixed(0)}%`,
      color: summary.avgStressScore >= 70 ? 'text-red-400' : 'text-green-400',
    },
    {
      icon: <Zap size={18} />,
      label: 'Cảm xúc chủ đạo',
      value: `${EMOTION_ICONS[summary.dominantEmotion as EmotionLabel] ?? ''} ${EMOTION_LABELS_VI[summary.dominantEmotion as EmotionLabel] ?? summary.dominantEmotion}`,
      color: 'text-yellow-400',
    },
    {
      icon: <Bell size={18} />,
      label: 'Cảnh báo',
      value: `${summary.totalAlerts} lần`,
      color: summary.totalAlerts > 5 ? 'text-red-400' : 'text-gray-400',
    },
  ];

  return (
    <Card title="Tổng kết phiên học" className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className={`flex items-center gap-1.5 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            {stat.sub && <p className="text-xs text-gray-500">{stat.sub}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}
