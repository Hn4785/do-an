import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { EAR_THRESHOLD_FATIGUE } from '@/utils/constants';

interface FatigueAlertProps {
  ear: number | null;
  isActive?: boolean;
  className?: string;
}

export default function FatigueAlert({ ear, isActive = true, className }: FatigueAlertProps) {
  const [visible, setVisible] = useState(false);

  const isFatigued = isActive && ear !== null && ear < EAR_THRESHOLD_FATIGUE;

  useEffect(() => {
    if (isFatigued) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isFatigued]);

  if (!visible) return null;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border animate-pulse',
        'bg-orange-950/60 border-orange-700/50',
        className
      )}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">
        {isFatigued ? (
          <EyeOff size={18} className="text-orange-400" />
        ) : (
          <Eye size={18} className="text-orange-400" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-orange-300">Phát hiện mệt mỏi!</p>
        <p className="text-xs text-orange-200 mt-0.5">
          Chỉ số EAR thấp ({ear?.toFixed(3)}). Hãy nghỉ ngơi và chớp mắt thường xuyên hơn.
        </p>
      </div>
    </div>
  );
}
