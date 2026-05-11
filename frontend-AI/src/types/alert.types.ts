import type { EmotionLabel } from "./emotion.types";

export type AlertType =
  | "stress_high"        // Căng thẳng cơ mặt vượt ngưỡng
  | "stress_critical"    // Căng thẳng ở mức nguy hiểm
  | "blink_low"          // Nháy mắt quá ít (mệt mỏi / tập trung quá mức)
  | "blink_high"         // Nháy mắt quá nhiều (lo lắng)
  | "face_lost"          // Mất nhận diện khuôn mặt
  | "head_pose_extreme"  // Góc đầu lệch quá nhiều
  | "emotion_negative"   // Cảm xúc tiêu cực kéo dài (angry / fear / sad)
  | "no_blink_long"      // Không nháy mắt trong thời gian dài
  | "jaw_tension_high";  // Căng thẳng hàm cao (jaw clenching)
 
export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  /** ID duy nhất (UUID v4) */
  alertId:    string;
 
  alertType:  AlertType;
  severity:   AlertSeverity;
 
  /** Nội dung hiển thị cho người dùng (tiếng Việt) */
  message:    string;
 
  /** Unix ms — thời điểm alert được tạo */
  triggeredAt: number;
 
  /** true nếu người dùng đã đọc / dismiss */
  isRead:     boolean;
 
  /** Dữ liệu kèm theo để hiển thị chi tiết */
  data:       AlertData;
}

/** Dữ liệu payload đính kèm theo từng loại alert */
export interface AlertData {
  /** Giá trị đo được tại thời điểm trigger */
  currentValue?:   number;
 
  /** Ngưỡng đã bị vượt */
  threshold?:      number;
 
  /** Cảm xúc liên quan (nếu alert loại emotion) */
  emotion?:        EmotionLabel;
 
  /** Thời gian kéo dài trước khi trigger (ms) */
  durationMs?:     number;
 
  /** Thông tin thêm dạng tự do */
  extra?:          Record<string, unknown>;
}

export interface AlertRule {
  alertType:   AlertType;
  severity:    AlertSeverity;
  enabled:     boolean;
  threshold:   number;
  debounceMss: number;
  cooldownMs:  number;
}

export interface AlertState {
  /** Tất cả alerts trong phiên hiện tại */
  alerts:        Alert[];
 
  /** Số alerts chưa đọc */
  unreadCount:   number;
 
  /** Quy tắc cảnh báo đang áp dụng */
  rules:         AlertRule[];
 
  /** true nếu đang có alert critical chưa dismiss */
  hasCritical:   boolean;
}

export const ALERT_LABELS_VI: Record<AlertType, string> = {
  stress_high:       "Căng thẳng cao",
  stress_critical:   "Căng thẳng nguy hiểm",
  blink_low:         "Nháy mắt quá ít",
  blink_high:        "Nháy mắt quá nhiều",
  face_lost:         "Mất khuôn mặt",
  head_pose_extreme: "Góc đầu lệch nhiều",
  emotion_negative:  "Cảm xúc tiêu cực",
  no_blink_long:     "Không nháy mắt lâu",
  jaw_tension_high:  "Căng thẳng hàm cao",
};
 
export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  info:     "#38bdf8",
  warning:  "#fb923c",
  critical: "#f87171",
};