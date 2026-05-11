import { useEffect } from 'react';
import type { FaceFeatures } from '@/types/feature.types';
import {
  LANDMARK_COLOR,
  LANDMARK_RADIUS,
  CONNECTION_COLOR,
  CONNECTION_WIDTH,
  BOUNDING_BOX_COLOR,
  BOUNDING_BOX_WIDTH,
} from '@/utils/constants';

// Một số kết nối quan trọng của MediaPipe Face Mesh (468 điểm)
const FACE_CONNECTIONS: [number, number][] = [
  // Viền mặt
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
  [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397],
  [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
  [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
  [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
  // Mắt trái
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154],
  [154, 155], [155, 133], [33, 246], [246, 161], [161, 160], [160, 159],
  [159, 158], [158, 157], [157, 173], [173, 133],
  // Mắt phải
  [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390],
  [390, 249], [249, 263], [362, 398], [398, 384], [384, 385], [385, 386],
  [386, 387], [387, 388], [388, 466], [466, 263],
  // Miệng
  [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269],
  [269, 270], [270, 409], [409, 291], [61, 146], [146, 91], [91, 181],
  [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375],
  [375, 291],
  // Lông mày trái
  [46, 53], [53, 52], [52, 65], [65, 55], [70, 63], [63, 105], [105, 66], [66, 107],
  // Lông mày phải
  [276, 283], [283, 282], [282, 295], [295, 285], [300, 293], [293, 334], [334, 296], [296, 336],
];

interface FaceLandmarkOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  features: FaceFeatures;
  showBoundingBox?: boolean;
}

export default function FaceLandmarkOverlay({
  canvasRef,
  features,
  showBoundingBox = true,
}: FaceLandmarkOverlayProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { landmarks, boundingBox } = features;
    const W = canvas.width;
    const H = canvas.height;

    // ===== Vẽ bounding box =====
    if (showBoundingBox && boundingBox) {
      ctx.strokeStyle = BOUNDING_BOX_COLOR;
      ctx.lineWidth = BOUNDING_BOX_WIDTH;
      ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);

      // Confidence label
      ctx.fillStyle = BOUNDING_BOX_COLOR;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(
        `Face ${(boundingBox.confidence * 100).toFixed(0)}%`,
        boundingBox.x,
        boundingBox.y - 6
      );
    }

    if (!landmarks || landmarks.length === 0) return;

    // Convert normalized → pixel
    const pts = landmarks.map((lm) => ({
      x: lm.x * W,
      y: lm.y * H,
    }));

    // ===== Vẽ connections =====
    ctx.strokeStyle = CONNECTION_COLOR;
    ctx.lineWidth = CONNECTION_WIDTH;
    ctx.globalAlpha = 0.6;

    FACE_CONNECTIONS.forEach(([i, j]) => {
      const from = pts[i];
      const to = pts[j];
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    // ===== Vẽ landmarks =====
    ctx.globalAlpha = 1;
    ctx.fillStyle = LANDMARK_COLOR;

    pts.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, LANDMARK_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [canvasRef, features, showBoundingBox]);

  return null; // Render trực tiếp lên canvas qua useEffect
}
