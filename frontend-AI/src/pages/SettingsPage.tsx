import { useState } from 'react';
import {
  EAR_THRESHOLD_BLINK,
  EAR_THRESHOLD_FATIGUE,
  MAR_THRESHOLD_YAWN,
  BROW_THRESHOLD_FROWN,
  STRESS_LOW,
  STRESS_MEDIUM,
  LOW_BLINK_RATE_THRESHOLD,
  BUFFER_SIZE,
  CHART_HISTORY_POINTS,
} from '@/utils/constants';

interface SettingsState {
  // Ngưỡng EAR
  earThresholdBlink: number;
  earThresholdFatigue: number;
  // Ngưỡng MAR
  marThresholdYawn: number;
  // Ngưỡng Brow
  browThresholdFrown: number;
  // Stress
  stressLow: number;
  stressMedium: number;
  // Blink
  lowBlinkRateThreshold: number;
  // Buffer
  bufferSize: number;
  chartHistoryPoints: number;
  // Alert
  enableFatigueAlert: boolean;
  enableStressAlert: boolean;
  enableBlinkAlert: boolean;
  enableEmotionAlert: boolean;
  // Display
  showLandmarks: boolean;
  showBoundingBox: boolean;
  showEmotionLabel: boolean;
  showMetrics: boolean;
  // Camera
  cameraDeviceId: string;
  frameRate: number;
}

const defaultSettings: SettingsState = {
  earThresholdBlink: EAR_THRESHOLD_BLINK,
  earThresholdFatigue: EAR_THRESHOLD_FATIGUE,
  marThresholdYawn: MAR_THRESHOLD_YAWN,
  browThresholdFrown: BROW_THRESHOLD_FROWN,
  stressLow: STRESS_LOW,
  stressMedium: STRESS_MEDIUM,
  lowBlinkRateThreshold: LOW_BLINK_RATE_THRESHOLD,
  bufferSize: BUFFER_SIZE,
  chartHistoryPoints: CHART_HISTORY_POINTS,
  enableFatigueAlert: true,
  enableStressAlert: true,
  enableBlinkAlert: true,
  enableEmotionAlert: false,
  showLandmarks: true,
  showBoundingBox: true,
  showEmotionLabel: true,
  showMetrics: true,
  cameraDeviceId: '',
  frameRate: 15,
};

// ===== Sub-components =====

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
      <h2 className="text-base font-semibold text-white flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  description?: string;
  onChange: (val: number) => void;
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  description,
  onChange,
}: SliderFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm font-mono text-indigo-400">
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
        </span>
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
      />
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-indigo-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ===== Main Component =====

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Lưu vào localStorage hoặc store
    localStorage.setItem('fem_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⚙️ Cài Đặt</h1>
          <p className="text-sm text-gray-400 mt-1">
            Tùy chỉnh ngưỡng phát hiện và hiển thị
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            🔄 Đặt lại mặc định
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {saved ? '✅ Đã lưu!' : '💾 Lưu cài đặt'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ===== EAR Thresholds ===== */}
        <Section title="Ngưỡng EAR (Eye Aspect Ratio)" icon="👁️">
          <SliderField
            label="Ngưỡng nháy mắt"
            value={settings.earThresholdBlink}
            min={0.1}
            max={0.35}
            step={0.01}
            description="EAR dưới ngưỡng này = đang nháy mắt"
            onChange={(v) => update('earThresholdBlink', v)}
          />
          <SliderField
            label="Ngưỡng mệt mỏi"
            value={settings.earThresholdFatigue}
            min={0.15}
            max={0.4}
            step={0.01}
            description="EAR dưới ngưỡng này liên tục = mệt mỏi"
            onChange={(v) => update('earThresholdFatigue', v)}
          />
        </Section>

        {/* ===== MAR & Brow ===== */}
        <Section title="Ngưỡng MAR & Mày" icon="😮">
          <SliderField
            label="Ngưỡng ngáp (MAR)"
            value={settings.marThresholdYawn}
            min={0.3}
            max={0.9}
            step={0.05}
            description="MAR trên ngưỡng này = đang ngáp"
            onChange={(v) => update('marThresholdYawn', v)}
          />
          <SliderField
            label="Ngưỡng nhíu mày"
            value={settings.browThresholdFrown}
            min={5}
            max={30}
            step={1}
            unit="px"
            description="Khoảng cách mày dưới ngưỡng này = nhíu mày"
            onChange={(v) => update('browThresholdFrown', v)}
          />
        </Section>

        {/* ===== Stress ===== */}
        <Section title="Ngưỡng Căng Thẳng" icon="🧠">
          <SliderField
            label="Ngưỡng stress thấp"
            value={settings.stressLow}
            min={0.1}
            max={0.5}
            step={0.05}
            unit="%"
            description="Dưới ngưỡng này = stress thấp (xanh)"
            onChange={(v) => update('stressLow', v)}
          />
          <SliderField
            label="Ngưỡng stress trung bình"
            value={settings.stressMedium}
            min={0.3}
            max={0.8}
            step={0.05}
            unit="%"
            description="Dưới ngưỡng này = stress trung bình (vàng)"
            onChange={(v) => update('stressMedium', v)}
          />
          <SliderField
            label="Ngưỡng nháy mắt thấp"
            value={settings.lowBlinkRateThreshold}
            min={5}
            max={20}
            step={1}
            unit=" lần/phút"
            description="Dưới ngưỡng này = nháy mắt ít bất thường"
            onChange={(v) => update('lowBlinkRateThreshold', v)}
          />
        </Section>

        {/* ===== Camera ===== */}
        <Section title="Camera & Hiệu Suất" icon="📷">
          <SliderField
            label="Frame rate xử lý"
            value={settings.frameRate}
            min={5}
            max={30}
            step={5}
            unit=" fps"
            description="Số frame/giây gửi lên backend để phân tích"
            onChange={(v) => update('frameRate', v)}
          />
          <SliderField
            label="Kích thước buffer"
            value={settings.bufferSize}
            min={20}
            max={300}
            step={10}
            unit=" frames"
            description="Số frame lưu trong bộ nhớ để tính thống kê"
            onChange={(v) => update('bufferSize', v)}
          />
          <SliderField
            label="Điểm hiển thị trên chart"
            value={settings.chartHistoryPoints}
            min={20}
            max={120}
            step={10}
            unit=" điểm"
            description="Số điểm dữ liệu hiển thị trên biểu đồ realtime"
            onChange={(v) => update('chartHistoryPoints', v)}
          />
        </Section>

        {/* ===== Alerts ===== */}
        <Section title="Cảnh Báo" icon="🔔">
          <ToggleField
            label="Cảnh báo mệt mỏi"
            description="Thông báo khi phát hiện mắt nhắm hoặc ngáp"
            checked={settings.enableFatigueAlert}
            onChange={(v) => update('enableFatigueAlert', v)}
          />
          <ToggleField
            label="Cảnh báo căng thẳng"
            description="Thông báo khi mức stress vượt ngưỡng"
            checked={settings.enableStressAlert}
            onChange={(v) => update('enableStressAlert', v)}
          />
          <ToggleField
            label="Cảnh báo nháy mắt ít"
            description="Thông báo khi tần suất nháy mắt quá thấp"
            checked={settings.enableBlinkAlert}
            onChange={(v) => update('enableBlinkAlert', v)}
          />
          <ToggleField
            label="Cảnh báo cảm xúc tiêu cực"
            description="Thông báo khi phát hiện cảm xúc tiêu cực kéo dài"
            checked={settings.enableEmotionAlert}
            onChange={(v) => update('enableEmotionAlert', v)}
          />
        </Section>

        {/* ===== Display ===== */}
        <Section title="Hiển Thị Trên Camera" icon="🎨">
          <ToggleField
            label="Hiển thị landmarks"
            description="Vẽ các điểm đặc trưng khuôn mặt lên video"
            checked={settings.showLandmarks}
            onChange={(v) => update('showLandmarks', v)}
          />
          <ToggleField
            label="Hiển thị bounding box"
            description="Vẽ khung bao quanh khuôn mặt"
            checked={settings.showBoundingBox}
            onChange={(v) => update('showBoundingBox', v)}
          />
          <ToggleField
            label="Hiển thị nhãn cảm xúc"
            description="Hiển thị cảm xúc và độ tin cậy trên video"
            checked={settings.showEmotionLabel}
            onChange={(v) => update('showEmotionLabel', v)}
          />
          <ToggleField
            label="Hiển thị chỉ số EAR/MAR"
            description="Hiển thị các chỉ số đặc trưng góc trên video"
            checked={settings.showMetrics}
            onChange={(v) => update('showMetrics', v)}
          />
        </Section>

      </div>

      {/* Info box */}
      <div className="mt-5 p-4 bg-indigo-950 border border-indigo-800 rounded-xl text-sm text-indigo-300">
        💡 <strong>Lưu ý:</strong> Cài đặt được lưu vào <code className="bg-indigo-900 px-1 rounded">localStorage</code>.
        Sau khi lưu, các thay đổi sẽ có hiệu lực ở lần khởi động phiên tiếp theo.
      </div>
    </div>
  );
}
