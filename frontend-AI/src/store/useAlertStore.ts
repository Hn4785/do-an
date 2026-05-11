import { create } from 'zustand';
import {
  Alert,
  AlertRule,
  AlertState,
  AlertType,
} from '@/types/alert.types';
import { DEFAULT_ALERT_RULES } from '@/utils/alertRules';

interface AlertStore extends AlertState {
  addAlert: (alert: Alert) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  dismissAlert: (alertId: string) => void;
  clearAlerts: () => void;
  updateRule: (alertType: AlertType, patch: Partial<AlertRule>) => void;
  reset: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  // ===== State =====
  alerts: [],
  unreadCount: 0,
  rules: DEFAULT_ALERT_RULES,
  hasCritical: false,

  // ===== Actions =====
  addAlert: (alert: Alert) =>
    set((state) => {
      const newAlerts = [alert, ...state.alerts].slice(0, 100);
      return {
        alerts: newAlerts,
        unreadCount: newAlerts.filter((a) => !a.isRead).length,
        hasCritical: newAlerts.some((a) => a.severity === 'critical' && !a.isRead),
      };
    }),

  markAsRead: (alertId: string) =>
    set((state) => {
      const newAlerts = state.alerts.map((a) =>
        a.alertId === alertId ? { ...a, isRead: true } : a
      );
      return {
        alerts: newAlerts,
        unreadCount: newAlerts.filter((a) => !a.isRead).length,
        hasCritical: newAlerts.some((a) => a.severity === 'critical' && !a.isRead),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
      unreadCount: 0,
      hasCritical: false,
    })),

  dismissAlert: (alertId: string) =>
    set((state) => {
      const newAlerts = state.alerts.filter((a) => a.alertId !== alertId);
      return {
        alerts: newAlerts,
        unreadCount: newAlerts.filter((a) => !a.isRead).length,
        hasCritical: newAlerts.some((a) => a.severity === 'critical' && !a.isRead),
      };
    }),

  clearAlerts: () =>
    set({ alerts: [], unreadCount: 0, hasCritical: false }),

  updateRule: (alertType: AlertType, patch: Partial<AlertRule>) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.alertType === alertType ? { ...r, ...patch } : r
      ),
    })),

  reset: () =>
    set({
      alerts: [],
      unreadCount: 0,
      rules: DEFAULT_ALERT_RULES,
      hasCritical: false,
    }),
}));
