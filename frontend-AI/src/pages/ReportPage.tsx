import { useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { useFeatureStore } from '@/store/useFeatureStore';
import { useEmotionStore } from '@/store/useEmotionStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import { formatDuration, formatDateTime, formatBlinkRate, formatDecimal } from '@/utils/formatters';
import { getEmotionLabelVI, getEmotionColor, getEmotionIcon } from '@/utils/emotionHelpers';
import { classifyStress, calcEmotionDistribution } from '@/utils/statisticsUtils';
import { exportSessionReportPDF, exportFaceFeaturesCSV } from '@/utils/exportUtils';
import { FileDown, BarChart2, Clock, Eye, Activity } from 'lucide-react';
import type { EmotionLabel } from '@/types/emotion.types';
import type { SessionReport } from '@/types/report.types';

export default function ReportPage() {
  // ✅ Fix: dùng đúng API của useSessionStore mới (current, elapsedMs)
  const { current: session, elapsedMs } = useSessionStore();
  // ✅ Fix: useFeatureStore mới không có blinkCount/blinkRate trực tiếp
  const { history: featureHistory } = useFeatureStore();
  // ✅ Fix: useEmotionStore mới dùng history: EmotionSnapshot[]
  const { history: emotionHistory } = useEmotionStore();
  const [exporting, setExporting] = useState(false);

  // ✅ Fix: dùng f.tension.overallScore thay vì f.stress_level
  const avgStress = featureHistory.length > 0
    ? featureHistory.reduce((s, f) => s + (f.tension.overallScore ?? 0), 0) / featureHistory.length
    : 0;

  const maxStress = featureHistory.length > 0
    ? Math.max(...featureHistory.map((f) => f.tension.overallScore ?? 0))
    : 0;

  // ✅ Fix: dùng f.blink.ear.average thay vì f.ear
  const avgEAR = featureHistory.length > 0
    ? featureHistory.reduce((s, f) => s + f.blink.ear.average, 0) / featureHistory.length
    : 0;

  // ✅ Fix: blinkCount từ featureHistory
  const blinkCount = featureHistory.filter((f) => f.blink.isBlinking).length;

  // ✅ Fix: blinkRate từ feature cuối cùng
  const blinkRate = featureHistory.length > 0
    ? (featureHistory[featureHistory.length - 1]?.blink.ratePerMinute ?? 0)
    : 0;

  // ✅ Fix: emotionHistory là EmotionSnapshot[], dùng snap.result.dominant
  const emotionDist = calcEmotionDistribution(
    emotionHistory.map((snap) => snap.result.dominant)
  );
  const sortedEmotions = Object.entries(emotionDist)
    .sort((a, b) => b[1] - a[1]) as [EmotionLabel, number][];

  // avgStress từ tension.overallScore (0-100), classifyStress nhận 0-1
  const stressClass = classifyStress(avgStress / 100);

  const startTime = session?.startedAt ?? null;
  const endTime = session?.endedAt ?? null;
  const durationMs = elapsedMs;

  const handleExportPDF = async () => {
    if (!startTime) return;
    setExporting(true);
    try {
      // ✅ Fix: build đúng SessionReport mới (nested structure)
      const report: SessionReport = {
        reportId:    `report_${startTime}`,
        sessionId:   session?.sessionId ?? `session_${startTime}`,
        generatedAt: Date.now(),

        overview: {
          startedAt:          startTime,
          endedAt:            endTime ?? Date.now(),
          durationMs:         durationMs,
          totalFrames:        featureHistory.length,
          averageFps:         session?.averageFps ?? 0,
          faceDetectedFrames: featureHistory.filter((f) => f.boundingBox !== null).length,
          faceDetectionRate:  featureHistory.length > 0
            ? featureHistory.filter((f) => f.boundingBox !== null).length / featureHistory.length
            : 0,
        },

        emotion: {
          dominant:        (sortedEmotions[0]?.[0] as EmotionLabel) ?? 'neutral',
          distribution:    Object.fromEntries(
            Object.entries(emotionDist).map(([k, v]) => [k, v * 100])
          ) as Record<EmotionLabel, number>,
          avgConfidence:   0,
          transitionCount: 0,
        },

        blink: {
          totalBlinks:   blinkCount,
          avgRatePerMin: blinkRate,
          minRatePerMin: 0,
          maxRatePerMin: 0,
          avgEar:        avgEAR,
          longNoBlinkMs: 0,
        },

        stress: {
          avgScore:           avgStress,
          peakScore:          maxStress,
          minScore:           featureHistory.length > 0
            ? Math.min(...featureHistory.map((f) => f.tension.overallScore))
            : 0,
          highStressMs:       0,
          criticalStressMs:   0,
          avgForeheadScore:   featureHistory.length > 0
            ? featureHistory.reduce((s, f) => s + f.tension.foreheadScore, 0) / featureHistory.length
            : 0,
          avgJawScore:        featureHistory.length > 0
            ? featureHistory.reduce((s, f) => s + f.tension.jawScore, 0) / featureHistory.length
            : 0,
          avgPeriocularScore: featureHistory.length > 0
            ? featureHistory.reduce((s, f) => s + f.tension.periocularScore, 0) / featureHistory.length
            : 0,
        },

        focus: {
          distribution: { high: 0, medium: 0, low: 0 } as any,
          highFocusMs:  0,
          lowFocusMs:   0,
        },

        alerts: {
          totalCount:  0,
          byType:      {},
          bySeverity:  { info: 0, warning: 0, critical: 0 },
        },

        timeline: [],
      };

      exportSessionReportPDF(report);
    } finally {
      setExporting(false);
    }
  };

  // ✅ Fix: exportFaceFeaturesCSV thay vì exportFeatureSnapshotsCSV
  const handleExportCSV = () => {
    exportFaceFeaturesCSV(featureHistory);
  };

  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">📊 Báo Cáo Phiên Học</h1>
          {startTime && (
            <p className="text-sm text-gray-400 mt-0.5">
              Bắt đầu: {formatDateTime(startTime)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileDown size={14} />}
            onClick={handleExportCSV}
            disabled={featureHistory.length === 0}
          >
            Xuất CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileDown size={14} />}
            onClick={handleExportPDF}
            loading={exporting}
            disabled={!startTime}
          >
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Thời Gian">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-indigo-400" />
            <span className="text-lg font-bold text-gray-100">
              {formatDuration(durationMs)}
            </span>
          </div>
        </Card>

        <Card title="Nháy Mắt">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-blue-400" />
            <div>
              <p className="text-lg font-bold text-gray-100">{blinkCount} lần</p>
              <p className="text-xs text-gray-400">{formatBlinkRate(blinkRate)}</p>
            </div>
          </div>
        </Card>

        <Card title="EAR Trung Bình">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-green-400" />
            <span className="text-lg font-bold text-gray-100">
              {formatDecimal(avgEAR, 3)}
            </span>
          </div>
        </Card>

        <Card title="Stress Trung Bình">
          <div className="flex items-center gap-2">
            <Activity size={20} className={
              stressClass === 'low' ? 'text-green-400' :
              stressClass === 'medium' ? 'text-yellow-400' : 'text-red-400'
            } />
            <span className={`text-lg font-bold ${
              stressClass === 'low' ? 'text-green-400' :
              stressClass === 'medium' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {avgStress.toFixed(0)}%
            </span>
          </div>
        </Card>
      </div>

      {/* Emotion Distribution */}
      <Card title="Phân Bố Cảm Xúc" subtitle="Tỉ lệ các cảm xúc trong phiên học">
        {sortedEmotions.length > 0 ? (
          <div className="space-y-3">
            {sortedEmotions.map(([label, ratio]) => (
              <div key={label} className="flex items-center gap-3">
                {/* ✅ Fix: getEmotionIcon thay vì getEmotionEmoji */}
                <span className="text-lg">{getEmotionIcon(label)}</span>
                <span className="text-sm text-gray-300 w-24 shrink-0">
                  {getEmotionLabelVI(label)}
                </span>
                <ProgressBar
                  value={ratio * 100}
                  size="sm"
                  className="flex-1"
                />
                <span className="text-sm text-gray-400 w-12 text-right">
                  {(ratio * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <BarChart2 size={32} className="mr-2" />
            <p>Chưa có dữ liệu cảm xúc</p>
          </div>
        )}
      </Card>

      {/* Stress Timeline placeholder */}
      <Card title="Biểu Đồ Stress" subtitle="Mức độ căng thẳng theo thời gian">
        <div className="flex items-center justify-center py-12 text-gray-500">
          <p className="text-sm">Biểu đồ sẽ hiển thị khi có dữ liệu phiên học</p>
        </div>
      </Card>
    </div>
  );
}
