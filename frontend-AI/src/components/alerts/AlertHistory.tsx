import { Bell, AlertTriangle, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAlertStore } from '@/store/useAlertStore';

// ✅ Fix: import named function thay vì object formatters
import { formatDateTime } from '@/utils/formatters';

import type { Alert } from '@/types/alert.types';

const severityConfig = {
  info:     { icon: <Info size={14} />,          color: 'text-blue-400',   bg: 'bg-blue-950/40' },
  warning:  { icon: <AlertTriangle size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-950/40' },
  critical: { icon: <XCircle size={14} />,       color: 'text-red-400',    bg: 'bg-red-950/40' },
};

interface AlertHistoryProps {
  maxItems?: number;
  className?: string;
}

export default function AlertHistory({ maxItems = 30, className }: AlertHistoryProps) {
  const alerts       = useAlertStore((s) => s.alerts);
  const markAsRead   = useAlertStore((s) => s.markAsRead);
  const dismissAlert = useAlertStore((s) => s.dismissAlert);

  const items = alerts.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className={clsx('flex flex-col items-center justify-center py-10 text-gray-500', className)}>
        <Bell size={32} className="mb-2 opacity-30" />
        <p className="text-sm">Chưa có cảnh báo nào</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {items.map((alert: Alert) => {
        const cfg = severityConfig[alert.severity];
        return (
          <div
            key={alert.alertId}
            className={clsx(
              'flex items-start gap-3 px-3 py-2.5 rounded-lg border border-gray-800',
              cfg.bg,
              !alert.isRead && 'ring-1 ring-inset ring-gray-700'
            )}
            onClick={() => markAsRead(alert.alertId)}
          >
            <span className={clsx('shrink-0 mt-0.5', cfg.color)}>{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={clsx('text-xs font-medium', cfg.color)}>
                {alert.message}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {/* ✅ Fix: dùng formatDateTime thay vì formatters.datetime */}
                {formatDateTime(alert.triggeredAt)}
              </p>
            </div>
            {!alert.isRead && (
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); dismissAlert(alert.alertId); }}
              className="text-gray-600 hover:text-gray-400 shrink-0 text-xs"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
