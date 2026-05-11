import {
  LANDMARK_COLOR,
  LANDMARK_RADIUS,
  CONNECTION_COLOR,
  CONNECTION_WIDTH,
  BOUNDING_BOX_COLOR,
  BOUNDING_BOX_WIDTH,
} from './constants';
import { EmotionLabel } from '@/types/emotion.types';
import { getEmotionColor, getEmotionLabelVI, getEmotionEmoji } from './emotionHelpers';

export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ===== Vẽ một điểm landmark =====
export const drawLandmark = (
  ctx: CanvasRenderingContext2D,
  point: Point2D,
  color = LANDMARK_COLOR,
  radius = LANDMARK_RADIUS
): void => {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};

// ===== Vẽ toàn bộ landmarks =====
export const drawAllLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: Point2D[],
  color = LANDMARK_COLOR,
  radius = LANDMARK_RADIUS
): void => {
  landmarks.forEach((pt) => drawLandmark(ctx, pt, color, radius));
};

// ===== Vẽ đường nối giữa các điểm =====
export const drawConnections = (
  ctx: CanvasRenderingContext2D,
  landmarks: Point2D[],
  connections: [number, number][],
  color = CONNECTION_COLOR,
  lineWidth = CONNECTION_WIDTH
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  connections.forEach(([i, j]) => {
    const from = landmarks[i];
    const to = landmarks[j];
    if (!from || !to) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  });
};

// ===== Vẽ bounding box khuôn mặt =====
export const drawBoundingBox = (
  ctx: CanvasRenderingContext2D,
  box: BoundingBox,
  color = BOUNDING_BOX_COLOR,
  lineWidth = BOUNDING_BOX_WIDTH
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
};

// ===== Vẽ label cảm xúc lên bounding box =====
export const drawEmotionLabel = (
  ctx: CanvasRenderingContext2D,
  emotion: EmotionLabel,
  confidence: number,
  box: BoundingBox
): void => {
  const emoji = getEmotionEmoji(emotion);
  const label = getEmotionLabelVI(emotion);
  const text = `${emoji} ${label} ${(confidence * 100).toFixed(0)}%`;
  const color = getEmotionColor(emotion);

  const padding = 4;
  const fontSize = 13;
  ctx.font = `bold ${fontSize}px sans-serif`;
  const textWidth = ctx.measureText(text).width;

  // Background
  ctx.fillStyle = color + 'CC'; // 80% opacity
  ctx.fillRect(box.x, box.y - fontSize - padding * 2, textWidth + padding * 2, fontSize + padding * 2);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, box.x + padding, box.y - padding);
};

// ===== Vẽ chỉ số EAR/MAR lên canvas =====
export const drawMetricText = (
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  color = '#00FF88'
): void => {
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - 2, y - 14, label.length * 7 + value.length * 7 + 20, 18);
  ctx.fillStyle = color;
  ctx.fillText(`${label}: ${value}`, x, y);
};

// ===== Xóa canvas =====
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.clearRect(0, 0, width, height);
};
