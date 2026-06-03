import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  ChevronRight,
  FileDown,
  History,
  Loader2,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { deleteAllSessions, deleteSession, getSessions } from '@/api/sessionApi';
import { formatBlinkRate, formatDateTime, formatDuration } from '@/utils/formatters';
import { getEmotionEmoji, getEmotionLabelVI } from '@/utils/emotionHelpers';
import { classifyStress } from '@/utils/statisticsUtils';
import type { EmotionLabel } from '@/types/emotion.types';

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
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getSessions();
      if (res.success) {
        setSessions(res.data.items as SessionSummary[]);
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

  useEffect(() => {
    const handleFocus = () => fetchSessions();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleDeleteAll = async () => {
    if (!window.confirm('Xoa tat ca lich su phien hoc?')) return;

    try {
      await deleteAllSessions();
      setSessions([]);
      setSelected(null);
    } catch {
      alert('Khong the xoa lich su');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Xoa phien hoc nay?')) return;

    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.sessionId !== id));
      if (selected === id) setSelected(null);
    } catch {
      alert('Khong the xoa phien hoc');
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Lich Su Phien Hoc</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Dang tai...' : `${sessions.length} phien da ghi nhan`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCcw size={14} />}
            onClick={fetchSessions}
            disabled={loading}
          >
            Tai lai
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={handleDeleteAll}
            disabled={loading || sessions.length === 0}
          >
            Xoa tat ca
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
          <Loader2 size={40} className="animate-spin mb-3" />
          <p>Dang tai du lieu...</p>
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
                  <div className="text-3xl shrink-0">
                    {getEmotionEmoji(session.dominantEmotion)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-100">
                        {formatDateTime(session.startedAt)}
                      </p>
                      <span
                        className={clsx(
                          'text-xs px-2 py-0.5 rounded-full',
                          stressClass === 'low'
                            ? 'bg-green-950 text-green-400'
                            : stressClass === 'medium'
                              ? 'bg-yellow-950 text-yellow-400'
                              : 'bg-red-950 text-red-400'
                        )}
                      >
                        Stress: {session.avgStressScore.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>{formatDuration(session.durationMs)}</span>
                      <span>{session.totalBlinks} lan nhay</span>
                      <span>{formatBlinkRate(session.avgBlinkRate)}</span>
                      <span>{getEmotionLabelVI(session.dominantEmotion)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<FileDown size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/report/${session.sessionId}`);
                      }}
                    >
                      Bao cao
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 size={14} />}
                      onClick={(e) => handleDelete(session.sessionId, e)}
                    >
                      Xoa
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

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Thoi luong</p>
                      <p className="text-sm font-semibold text-gray-100 mt-1">
                        {formatDuration(session.durationMs)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Nhay mat</p>
                      <p className="text-sm font-semibold text-gray-100 mt-1">
                        {session.totalBlinks} lan
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Cam xuc chu dao</p>
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
            <p className="text-base font-medium">Chua co phien hoc nao</p>
            <p className="text-sm mt-1">Bat dau mot phien hoc tu Dashboard</p>
          </div>
        </Card>
      )}
    </div>
  );
}
