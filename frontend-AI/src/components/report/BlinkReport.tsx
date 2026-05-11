import { Eye } from 'lucide-react';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import type { ReportBlink } from '@/types/report.types';

interface BlinkReportProps {
  blink: ReportBlink;
  className?: string;
}

const NORMAL_BLINK_RATE = 15; // lần/phút bình thường

export default function BlinkReport({ blink, className }: BlinkReportProps) {
  const ratePercent = Math.min((blink.avgRatePerMin / NORMAL_BLINK_RATE) * 100, 150);
  const isLow = blink.avgRatePerMin < 10;

  return (
    <Card
      title="Báo cáo nháy mắt"
      subtitle="Phân tích tần suất nháy mắt trong phiên"
      className={className}
    >
      <div className="space-y-4">
        {/* Tổng quan */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tổng số lần',   value: blink.totalBlinks,              unit: 'lần' },
            { label: 'Trung bình',    value: blink.avgRatePerMin.toFixed(1),  unit: 'lần/phút' },
            { label: 'EAR trung bình', value: blink.avgEar.toFixed(3),        unit: '' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
              {item.unit && <p className="text-xs text-gray-500">{item.unit}</p>}
            </div>
          ))}
        </div>

        {/* Tần suất so với bình thường */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Tần suất nháy mắt</span>
            <span className={isLow ? 'text-red-400' : 'text-green-400'}>
              {isLow ? '⚠ Thấp bất thường' : '✓ Bình thường'}
            </span>
          </div>
          <ProgressBar
            value={ratePercent}
            variant={isLow ? 'danger' : 'success'}
            size="md"
            showValue
          />
          <p className="text-xs text-gray-500 mt-1">
            Bình thường: 10–20 lần/phút. Thấp hơn có thể gây khô mắt.
          </p>
        </div>

        {/* Min/Max */}
        <div className="flex gap-4 text-xs text-gray-400">
          <span>Min: <strong className="text-white">{blink.minRatePerMin.toFixed(1)}</strong> lần/phút</span>
          <span>Max: <strong className="text-white">{blink.maxRatePerMin.toFixed(1)}</strong> lần/phút</span>
          <span>Không nháy &gt;5s: <strong className="text-white">{Math.round(blink.longNoBlinkMs / 1000)}s</strong></span>
        </div>
      </div>
    </Card>
  );
}
