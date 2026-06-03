import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, BarChart2, Clock, Eye, FileDown, Loader2 } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import { exportSessionReport as exportBackendReport, getSessionReport } from '@/api/reportApi';
import { useEmotionStore } from '@/store/useEmotionStore';
import { useFeatureStore } from '@/store/useFeatureStore';
import { useSessionStore } from '@/store/useSessionStore';
import { exportFaceFeaturesCSV, exportSessionReportPDF } from '@/utils/exportUtils';
import { formatBlinkRate, formatDateTime, formatDecimal, formatDuration } from '@/utils/formatters';
import { getEmotionIcon, getEmotionLabelVI } from '@/utils/emotionHelpers';
import { calcEmotionDistribution, classifyStress } from '@/utils/statisticsUtils';
import type { EmotionLabel } from '@/types/emotion.types';
import type { FaceFeatures } from '@/types/feature.types';
import type { SessionReport } from '@/types/report.types';

function countBlinkEvents(features: FaceFeatures[]): number {
  let total = 0;
  let wasBlinking = false;

  for (const feature of features) {
    const isBlinking = feature.blink.isBlinking;
    if (isBlinking && !wasBlinking) total += 1;
    wasBlinking = isBlinking;
  }

  return total;
}

function buildLiveReport(
  session: ReturnType<typeof useSessionStore.getState>['current'],
  elapsedMs: number,
  featureHistory: FaceFeatures[],
  emotionHistory: ReturnType<typeof useEmotionStore.getState>['history']
): SessionReport | null {
  if (!session) return null;
  const startTime = session.startedAt;

  const emotionDist = calcEmotionDistribution(
    emotionHistory.map((snap) => snap.result.dominant)
  );
  const sortedEmotions = Object.entries(emotionDist)
    .sort((a, b) => b[1] - a[1]) as [EmotionLabel, number][];

  const stressValues = featureHistory.map((f) => f.tension.overallScore ?? 0);
  const avgStress = stressValues.length
    ? stressValues.reduce((sum, value) => sum + value, 0) / stressValues.length
    : 0;
  const avgEAR = featureHistory.length
    ? featureHistory.reduce((sum, f) => sum + f.blink.ear.average, 0) / featureHistory.length
    : 0;
  const blinkCount = countBlinkEvents(featureHistory);
  const blinkRate = elapsedMs > 0 ? blinkCount / (elapsedMs / 60000) : 0;

  return {
    reportId: `live_report_${startTime}`,
    sessionId: session.sessionId,
    generatedAt: Date.now(),
    overview: {
      startedAt: startTime,
      endedAt: session.endedAt ?? Date.now(),
      durationMs: session.endedAt ? session.endedAt - startTime : elapsedMs,
      totalFrames: featureHistory.length,
      averageFps: session.averageFps ?? 0,
      faceDetectedFrames: featureHistory.filter((f) => f.boundingBox !== null).length,
      faceDetectionRate: featureHistory.length
        ? featureHistory.filter((f) => f.boundingBox !== null).length / featureHistory.length
        : 0,
    },
    emotion: {
      dominant: sortedEmotions[0]?.[0] ?? 'neutral',
      distribution: Object.fromEntries(
        Object.entries(emotionDist).map(([label, ratio]) => [label, ratio * 100])
      ) as Record<EmotionLabel, number>,
      avgConfidence: 0,
      transitionCount: 0,
    },
    blink: {
      totalBlinks: blinkCount,
      avgRatePerMin: blinkRate,
      minRatePerMin: 0,
      maxRatePerMin: 0,
      avgEar: avgEAR,
      longNoBlinkMs: 0,
    },
    stress: {
      avgScore: avgStress,
      peakScore: stressValues.length ? Math.max(...stressValues) : 0,
      minScore: stressValues.length ? Math.min(...stressValues) : 0,
      highStressMs: 0,
      criticalStressMs: 0,
      avgForeheadScore: featureHistory.length
        ? featureHistory.reduce((sum, f) => sum + f.tension.foreheadScore, 0) / featureHistory.length
        : 0,
      avgJawScore: featureHistory.length
        ? featureHistory.reduce((sum, f) => sum + f.tension.jawScore, 0) / featureHistory.length
        : 0,
      avgPeriocularScore: featureHistory.length
        ? featureHistory.reduce((sum, f) => sum + f.tension.periocularScore, 0) / featureHistory.length
        : 0,
    },
    focus: {
      distribution: { high: 0, medium: 0, low: 0 },
      highFocusMs: 0,
      lowFocusMs: 0,
    },
    alerts: {
      totalCount: 0,
      byType: {},
      bySeverity: { info: 0, warning: 0, critical: 0 },
    },
    timeline: [],
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportPage() {
  const { sessionId } = useParams();
  const { current: session, elapsedMs } = useSessionStore();
  const { history: featureHistory } = useFeatureStore();
  const { history: emotionHistory } = useEmotionStore();
  const [savedReport, setSavedReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setSavedReport(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getSessionReport(sessionId)
      .then((res) => {
        if (!cancelled) setSavedReport(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch report:', err);
        if (!cancelled) setError('Khong tai duoc bao cao tu backend');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const liveReport = useMemo(
    () => buildLiveReport(session, elapsedMs, featureHistory, emotionHistory),
    [session, elapsedMs, featureHistory, emotionHistory]
  );
  const report = sessionId ? savedReport : liveReport;

  const stressClass = classifyStress((report?.stress.avgScore ?? 0) / 100);
  const emotionEntries = report
    ? (Object.entries(report.emotion.distribution)
        .sort((a, b) => b[1] - a[1]) as [EmotionLabel, number][])
    : [];

  const handleExportPDF = async () => {
    if (!report) return;
    setExporting(true);
    try {
      exportSessionReportPDF(report);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (sessionId) {
      const blob = await exportBackendReport(sessionId, 'csv');
      downloadBlob(blob, `report_${sessionId}.csv`);
      return;
    }

    exportFaceFeaturesCSV(featureHistory);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <Loader2 size={40} className="animate-spin mb-3" />
        <p>Dang tai bao cao...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <Card>
          <div className="py-12 text-center text-gray-400">{error}</div>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <Card>
          <div className="py-12 text-center text-gray-400">
            Chua co du lieu bao cao. Hay bat dau mot phien hoc hoac mo bao cao tu History.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">
            {sessionId ? 'Bao Cao Da Luu' : 'Bao Cao Phien Hien Tai'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Bat dau: {formatDateTime(report.overview.startedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileDown size={14} />}
            onClick={handleExportCSV}
            disabled={report.overview.totalFrames === 0}
          >
            Xuat CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileDown size={14} />}
            onClick={handleExportPDF}
            loading={exporting}
          >
            Xuat PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Thoi Gian">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-indigo-400" />
            <span className="text-lg font-bold text-gray-100">
              {formatDuration(report.overview.durationMs)}
            </span>
          </div>
        </Card>

        <Card title="Nhay Mat">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-blue-400" />
            <div>
              <p className="text-lg font-bold text-gray-100">{report.blink.totalBlinks} lan</p>
              <p className="text-xs text-gray-400">{formatBlinkRate(report.blink.avgRatePerMin)}</p>
            </div>
          </div>
        </Card>

        <Card title="EAR Trung Binh">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-green-400" />
            <span className="text-lg font-bold text-gray-100">
              {formatDecimal(report.blink.avgEar, 3)}
            </span>
          </div>
        </Card>

        <Card title="Stress Trung Binh">
          <div className="flex items-center gap-2">
            <Activity
              size={20}
              className={
                stressClass === 'low'
                  ? 'text-green-400'
                  : stressClass === 'medium'
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }
            />
            <span
              className={`text-lg font-bold ${
                stressClass === 'low'
                  ? 'text-green-400'
                  : stressClass === 'medium'
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {report.stress.avgScore.toFixed(0)}%
            </span>
          </div>
        </Card>
      </div>

      <Card title="Phan Bo Cam Xuc" subtitle="Ti le cac cam xuc trong phien hoc">
        {emotionEntries.length > 0 ? (
          <div className="space-y-3">
            {emotionEntries.map(([label, percentage]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-lg">{getEmotionIcon(label)}</span>
                <span className="text-sm text-gray-300 w-24 shrink-0">
                  {getEmotionLabelVI(label)}
                </span>
                <ProgressBar value={percentage} size="sm" className="flex-1" />
                <span className="text-sm text-gray-400 w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <BarChart2 size={32} className="mr-2" />
            <p>Chua co du lieu cam xuc</p>
          </div>
        )}
      </Card>

      <Card title="Timeline" subtitle="Du lieu report tu backend">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tong frame</p>
            <p className="text-gray-100 font-semibold">{report.overview.totalFrames}</p>
          </div>
          <div>
            <p className="text-gray-500">Nhan dien mat</p>
            <p className="text-gray-100 font-semibold">
              {(report.overview.faceDetectionRate * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Stress cao</p>
            <p className="text-gray-100 font-semibold">{formatDuration(report.stress.highStressMs)}</p>
          </div>
          <div>
            <p className="text-gray-500">Khong nhay mat lau</p>
            <p className="text-gray-100 font-semibold">{formatDuration(report.blink.longNoBlinkMs)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
