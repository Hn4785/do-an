import { useRef, useState, useEffect } from 'react';
import { useFeatureStore } from '@/store/useFeatureStore';
import { useEmotionStore } from '@/store/useEmotionStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useSession } from '@/hooks/useSession';
import { websocketService } from '@/services/websocketService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import AlertBanner from '@/components/common/AlertBanner';
import { formatDurationShort, formatEAR } from '@/utils/formatters';
import {
  getEmotionEmoji,
  getEmotionLabelVI,
  getEmotionColor,
} from '@/utils/emotionHelpers';
import { classifyStress } from '@/utils/statisticsUtils';
import {
  Camera, CameraOff, Play, Square,
  Eye, Activity, Brain, AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { EmotionLabel } from '@/types/emotion.types';

export default function DashboardPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);

  // ✅ Fix: dùng đúng fields từ SessionStore mới
  const { isActive, elapsedMs, startSession, stopSession } = useSession();

  // ✅ Fix: useFeatureStore không có blinkRate trực tiếp
  const feature = useFeatureStore((s) => s.current);

  // ✅ Fix: useEmotionStore mới dùng current: EmotionResult | null
  const emotionResult = useEmotionStore((s) => s.current);
  const currentEmotion = emotionResult?.dominant ?? null;

  // ✅ Fix: useAlertStore không có activeAlerts/acknowledgeAlert
  const alerts      = useAlertStore((s) => s.alerts);
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const markAsRead  = useAlertStore((s) => s.markAsRead);
  const dismissAlert = useAlertStore((s) => s.dismissAlert);

  // Lấy alerts chưa đọc để hiển thị banner
  const activeAlerts = alerts.filter((a) => !a.isRead).slice(0, 2);

  // ===== Camera =====
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch {
      console.error('Không thể truy cập camera');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  // ===== Session toggle =====
  const handleToggleSession = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };
  useEffect(() => {
    if (!isActive || !cameraOn || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);
      websocketService.sendVideoFrame(canvas.toDataURL('image/jpeg', 0.7), width, height);
    }, 200);

    return () => window.clearInterval(timer);
  }, [cameraOn, isActive]);

  // ✅ Fix: stress từ tension.overallScore (FaceFeatures mới)
  const stressLevel = (feature?.tension?.overallScore ?? 0) / 100;
  const stressClass = classifyStress(stressLevel);

  // ✅ Fix: EAR từ blink.ear.average
  const earValue = feature?.blink?.ear?.average ?? 0;

  // ✅ Fix: blinkRate từ blink.ratePerMinute
  const blinkRate = feature?.blink?.ratePerMinute ?? 0;

  return (
    <div className="flex flex-col gap-5 p-5 h-full overflow-y-auto">

      {/* ===== Alert Banner ===== */}
      {activeAlerts.map((alert) => (
        <AlertBanner
          key={alert.alertId}
          variant={
            alert.severity === 'critical' ? 'error' :
            alert.severity === 'warning'  ? 'warning' : 'info'
          }
          title={alert.alertType}
          message={alert.message}
          onClose={() => {
            markAsRead(alert.alertId);
            dismissAlert(alert.alertId);
          }}
        />
      ))}

      {/* ===== Top Row: Camera + Emotion ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <Card
            title="Camera"
            headerRight={
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={cameraOn ? 'danger' : 'secondary'}
                  leftIcon={cameraOn ? <CameraOff size={14} /> : <Camera size={14} />}
                  onClick={cameraOn ? stopCamera : startCamera}
                >
                  {cameraOn ? 'Tắt' : 'Bật Camera'}
                </Button>
                <Button
                  size="sm"
                  variant={isActive ? 'danger' : 'primary'}
                  leftIcon={isActive ? <Square size={14} /> : <Play size={14} />}
                  onClick={handleToggleSession}
                >
                  {isActive ? 'Dừng' : 'Bắt đầu'}
                </Button>
              </div>
            }
            noPadding
          >
            <div className="relative aspect-video bg-gray-950 rounded-b-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
                  <CameraOff size={48} />
                  <p className="text-sm">Camera chưa được bật</p>
                </div>
              )}
              {/* Session timer overlay */}
              {isActive && (
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 text-green-400 text-sm font-mono">
                  ⏱ {formatDurationShort(elapsedMs)}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Emotion Panel */}
        <div className="flex flex-col gap-4">
          <Card title="Cảm Xúc Hiện Tại">
            {currentEmotion ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-5xl">{getEmotionEmoji(currentEmotion)}</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: getEmotionColor(currentEmotion) }}
                >
                  {getEmotionLabelVI(currentEmotion)}
                </span>

                {/* Emotion scores */}
                <div className="w-full space-y-1.5 mt-2">
                  {emotionResult?.scores
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 4)
                    .map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20 shrink-0">
                          {getEmotionLabelVI(item.label as EmotionLabel)}
                        </span>
                        <ProgressBar
                          value={item.percentage}
                          max={100}
                          size="xs"
                          variant="default"
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-400 w-10 text-right">
                          {item.percentage.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-gray-500">
                <Brain size={32} />
                <p className="text-sm">Chưa phát hiện cảm xúc</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ===== Bottom Row: Metrics ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Stress Level */}
        <Card title="Mức Căng Thẳng">
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between">
              <span className={clsx(
                'text-2xl font-bold',
                stressClass === 'low'    ? 'text-green-400' :
                stressClass === 'medium' ? 'text-yellow-400' : 'text-red-400'
              )}>
                {(stressLevel * 100).toFixed(0)}%
              </span>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full',
                stressClass === 'low'    ? 'bg-green-950 text-green-400' :
                stressClass === 'medium' ? 'bg-yellow-950 text-yellow-400' : 'bg-red-950 text-red-400'
              )}>
                {stressClass === 'low' ? 'Thấp' : stressClass === 'medium' ? 'Vừa' : 'Cao'}
              </span>
            </div>
            <ProgressBar
              value={stressLevel * 100}
              variant="stress"
              size="md"
              showValue={false}
            />
          </div>
        </Card>

        {/* EAR */}
        <Card title="Chỉ Số Mắt (EAR)">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Eye size={20} className="text-indigo-400" />
              <span className="text-2xl font-bold text-gray-100">
                {formatEAR(earValue)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {earValue < 0.21 ? '⚠️ Đang nháy mắt' :
               earValue < 0.23 ? '⚠️ Mắt mệt' : '✅ Bình thường'}
            </p>
          </div>
        </Card>

        {/* Blink Rate */}
        <Card title="Tần Suất Nháy Mắt">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-blue-400" />
              <span className="text-2xl font-bold text-gray-100">
                {Math.round(blinkRate)}
              </span>
              <span className="text-sm text-gray-400">lần/phút</span>
            </div>
            <p className="text-xs text-gray-500">
              {blinkRate < 10 ? '⚠️ Quá ít' :
               blinkRate > 30 ? '⚠️ Quá nhiều' : '✅ Bình thường (15-20)'}
            </p>
          </div>
        </Card>

        {/* Alerts */}
        <Card title="Cảnh Báo">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={20}
                className={unreadCount > 0 ? 'text-red-400' : 'text-gray-500'}
              />
              <span className={clsx(
                'text-2xl font-bold',
                unreadCount > 0 ? 'text-red-400' : 'text-gray-400'
              )}>
                {unreadCount}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {unreadCount > 0 ? 'Cảnh báo chưa đọc' : 'Không có cảnh báo'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

