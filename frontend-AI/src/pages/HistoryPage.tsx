import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { formatDateTime, formatDuration, formatBlinkRate } from '@/utils/formatters';
import { getEmotionEmoji, getEmotionLabelVI } from '@/utils/emotionHelpers';
import { classifyStress } from '@/utils/statisticsUtils';
import { History, Trash2, FileDown, ChevronRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { EmotionLabel } from '@/types/emotion.types';
import { getSessions, deleteSession } from '@/api/sessionApi';

interface SessionSummary {
  sessionId: string;
  startedAt: number;
  durationMs: number;
  dominantEmotion: EmotionLabel;
  avgStressScore: number;
  totalBlinks: number;
  avgBlinkRate: number;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getSessions();
      if (res.success) {
        setSessions(res.data.items as any);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDeleteAll = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử?')) {
      // Thực tế API có thể cần endpoint delete all, ở đây ta xóa từng cái hoặc báo lỗi
      alert('Tính năng xóa tất cả đang được cập nhật.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Xóa phiên học này?')) {
      try {
        await deleteSession(id);
        setSessions(prev => prev.filter(s => s.sessionId !== id));
      } catch (err) {
        alert('Không thể xóa phiên học');
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">📋 Lịch Sử Phiên Học</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Đang tải...' : `${sessions.length} phiên đã ghi nhận`}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          leftIcon={<Trash2 size={14} />}
          onClick={handleDeleteAll}
          disabled={loading || sessions.length === 0}
        >
          Xóa tất cả
        </Button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
          <Loader2 size={40} className="animate-spin mb-3" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => {
            const stressClass = classifyStress(session.avgStressScore / 100);
            const isSelected = selected === session.sessionId;

            return (
              <Card
                key={session.sessionId}
                className={clsx(
                  'cursor-pointer transition-all',
                  isSelected ? 'border-indigo-600/50 bg-indigo-950/20' : 'hover:border-gray-700'
                )}
              >
                <div
                  className="flex items-center gap-4"
                  onClick={() => setSelected(isSelected ? null : session.sessionId)}
                >
                  {/* Emotion icon */}
                  <div className="text-3xl shrink-0">
                    {getEmotionEmoji(session.dominantEmotion)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-100">
                        {formatDateTime(session.startedAt)}
                      </p>
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded-full',
                        stressClass === 'low' ? 'bg-green-950 text-green-400' :
                        stressClass === 'medium' ? 'bg-yellow-950 text-yellow-400' :
                        'bg-red-950 text-red-400'
                      )}>
                        Stress: {session.avgStressScore.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>⏱ {formatDuration(session.durationMs)}</span>
                      <span>👁 {session.totalBlinks} lần nháy</span>
                      <span>📊 {formatBlinkRate(session.avgBlinkRate)}</span>
                      <span>😊 {getEmotionLabelVI(session.dominantEmotion)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 size={14} />}
                      onClick={(e) => handleDelete(session.sessionId, e)}
                    >
                      Xóa
                    </Button>
                    <ChevronRight
                      size={16}
                      className={clsx(
                        'text-gray-500 transition-transform',
                        isSelected && 'rotate-90'
                      )}
                    />
                  </div>
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Thời lượng</p>
                      <p className="text-sm font-semibold text-gray-100 mt-1">
                        {formatDuration(session.durationMs)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Nháy mắt</p>
                      <p className="text-sm font-semibold text-gray-100 mt-1">
                        {session.totalBlinks} lần
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Cảm xúc chủ đạo</p>
                      <p className="text-sm font-semibold text-gray-100 mt-1">
                        {getEmotionEmoji(session.dominantEmotion)} {getEmotionLabelVI(session.dominantEmotion)}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <History size={48} className="mb-3" />
            <p className="text-base font-medium">Chưa có phiên học nào</p>
            <p className="text-sm mt-1">Bắt đầu một phiên học từ Dashboard</p>
          </div>
        </Card>
      )}
    </div>
  );
}
