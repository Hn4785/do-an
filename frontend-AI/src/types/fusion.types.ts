import type { EmotionResult }     from "./emotion.types";
import type { FaceFeatures }      from "./feature.types";

export interface FusionResult {
  features:     FaceFeatures;
  emotion:      EmotionResult;
 
  /** Chỉ số căng thẳng tổng hợp 0–100 (tính từ tension + emotion + blink) */
  stressScore:  number;
 
  /** Phân loại mức độ tập trung */
  focusLevel:   FocusLevel;
 
  /** Unix ms — thời điểm fusion hoàn tất */
  fusedAt:      number;
 
  /** Số thứ tự frame trong phiên */
  frameIndex:   number;
 
  /** FPS thực tế của backend */
  currentFps:   number;
}

export type FocusLevel =
  | "high"      // Tập trung tốt
  | "medium"    // Tập trung trung bình
  | "low"       // Mất tập trung
  | "unknown";  // Không đủ dữ liệu
 
export const FOCUS_LEVEL_LABELS_VI: Record<FocusLevel, string> = {
  high:    "Tập trung tốt",
  medium:  "Trung bình",
  low:     "Mất tập trung",
  unknown: "Chưa xác định",
};
 
export const FOCUS_LEVEL_COLORS: Record<FocusLevel, string> = {
  high:    "#4ade80",
  medium:  "#fb923c",
  low:     "#f87171",
  unknown: "#9ca3af",
};

export interface FusionSnapshot {
  /** Unix ms */
  timestamp:   number;
  frameIndex:  number;
  stressScore: number;
  focusLevel:  FocusLevel;
 
  /** EAR trung bình tại frame này — dùng cho chart nháy mắt */
  earAverage:  number;
 
  /** Cảm xúc dominant tại frame này */
  emotion:     string;
}

export interface FusionState {
  /** Kết quả fusion frame mới nhất */
  current:       FusionResult | null;
 
  /**
   * Buffer các snapshot gần đây — dùng cho chart realtime.
   * Giới hạn MAX_FUSION_HISTORY entries để tránh memory leak.
   */
  snapshots:     FusionSnapshot[];
 
  /** Stress score trung bình trong cửa sổ cuốn (60s gần nhất) */
  avgStress60s:  number;
 
  /** Focus level xuất hiện nhiều nhất trong 60s gần nhất */
  dominantFocus: FocusLevel;
 
  lastUpdated:   number | null;
}

/** Số snapshot tối đa giữ trong memory (~30 phút @ 1 snapshot/s) */
export const MAX_FUSION_HISTORY = 1800;