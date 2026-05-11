import type { Alert, AlertRule, AlertType } from '@/types/alert.types';
import { useAlertStore } from '@/store/useAlertStore';
import { DEFAULT_ALERT_RULES } from '@/utils/alertRules';

// ============================================================
// 🔔 Notification Service
// ============================================================

class NotificationService {
  private lastAlertTimes: Map<string, number> = new Map();
  private browserNotifEnabled = false;

  // ============================================================
  // 🚀 Khởi tạo
  // ============================================================

  async init(): Promise<void> {
    // Yêu cầu quyền browser notification
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.browserNotifEnabled = permission === 'granted';
    }
  }

  // ============================================================
  // 📢 Trigger alert từ WebSocket message
  // ============================================================

  /**
   * Gọi khi nhận được `alert` message từ backend qua WebSocket.
   */
  handleWsAlert(payload: {
    alertId:   string;
    alertType: string;
    severity:  'info' | 'warning' | 'critical';
    message:   string;
    data:      Record<string, unknown>;
  }): void {
    const alert: Alert = {
      alertId:   payload.alertId,
      alertType: payload.alertType as AlertType,
      severity:  payload.severity,
      message:   payload.message,
      data:      payload.data,
      triggeredAt: Date.now(),
      isRead:    false,
    };

    this.dispatchAlert(alert);
  }

  // ============================================================
  // 📢 Trigger alert thủ công (từ client-side logic)
  // ============================================================

  triggerAlert(
    alertType: AlertType,
    severity: 'info' | 'warning' | 'critical',
    message: string,
    data?: Record<string, unknown>
  ): void {
    // Kiểm tra cooldown
    const cooldownKey = `${alertType}_${severity}`;
    const rule = this.findRule(alertType, severity);
    const cooldownMs = rule?.cooldownMs ?? 30000;

    if (!this.canTrigger(cooldownKey, cooldownMs)) return;

    const alert: Alert = {
      alertId:     crypto.randomUUID(),
      alertType,
      severity,
      message,
      data:        data ?? {},
      triggeredAt: Date.now(),
      isRead:      false,
    };

    this.dispatchAlert(alert);
    this.lastAlertTimes.set(cooldownKey, Date.now());
  }

  // ============================================================
  // 🔕 Quản lý alerts trong store
  // ============================================================

  markAsRead(alertId: string): void {
    useAlertStore.getState().markAsRead(alertId);
  }

  markAllAsRead(): void {
    useAlertStore.getState().markAllAsRead();
  }

  dismissAlert(alertId: string): void {
    useAlertStore.getState().dismissAlert(alertId);
  }

  clearAll(): void {
    useAlertStore.getState().clearAlerts();
  }

  // ============================================================
  // ⚙️ Quản lý rules
  // ============================================================

  updateRule(alertType: AlertType, patch: Partial<AlertRule>): void {
    useAlertStore.getState().updateRule(alertType, patch);
  }

  enableRule(alertType: AlertType): void {
    this.updateRule(alertType, { enabled: true });
  }

  disableRule(alertType: AlertType): void {
    this.updateRule(alertType, { enabled: false });
  }

  // ============================================================
  // 🔧 Private helpers
  // ============================================================

  private dispatchAlert(alert: Alert): void {
    // Lưu vào store
    useAlertStore.getState().addAlert(alert);

    // Browser notification nếu được phép
    if (this.browserNotifEnabled && alert.severity !== 'info') {
      this.sendBrowserNotification(alert);
    }

    // Log ra console
    const icon = alert.severity === 'critical' ? '🔴' :
                 alert.severity === 'warning'  ? '🟡' : '🔵';
    console.log(`${icon} [Alert] ${alert.alertType}: ${alert.message}`);
  }

  private sendBrowserNotification(alert: Alert): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const title = alert.severity === 'critical'
      ? '⚠️ Cảnh báo nghiêm trọng'
      : '⚡ Cảnh báo';

    new Notification(title, {
      body: alert.message,
      icon: '/favicon.ico',
      tag:  alert.alertId,
    });
  }

  private canTrigger(key: string, cooldownMs: number): boolean {
    const last = this.lastAlertTimes.get(key) ?? 0;
    return Date.now() - last >= cooldownMs;
  }

  private findRule(
    alertType: AlertType,
    severity: 'info' | 'warning' | 'critical'
  ): AlertRule | undefined {
    const rules = useAlertStore.getState().rules;
    return rules.find(
      (r) => r.alertType === alertType && r.severity === severity
    );
  }

  // ============================================================
  // 🔄 Reset
  // ============================================================

  reset(): void {
    this.lastAlertTimes.clear();
    useAlertStore.getState().reset();
  }
}

// ============================================================
// 🏭 Singleton export
// ============================================================

export const notificationService = new NotificationService();
export default notificationService;