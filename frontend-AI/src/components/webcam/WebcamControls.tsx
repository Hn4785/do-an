import { clsx } from 'clsx';
import { Play, Square, Pause, RotateCcw, Camera } from 'lucide-react';
import Button from '@/components/common/Button';

interface WebcamControlsProps {
  isActive:     boolean;
  isLoading:    boolean;
  isPaused?:    boolean;
  sessionActive?: boolean;
  onStart:      () => void;
  onStop:       () => void;
  onPause?:     () => void;
  onResume?:    () => void;
  onReset?:     () => void;
  className?:   string;
}

export default function WebcamControls({
  isActive,
  isLoading,
  isPaused = false,
  sessionActive = false,
  onStart,
  onStop,
  onPause,
  onResume,
  onReset,
  className,
}: WebcamControlsProps) {
  return (
    <div className={clsx('flex items-center gap-2 flex-wrap', className)}>
      {/* Start / Stop */}
      {!isActive ? (
        <Button
          variant="primary"
          size="md"
          loading={isLoading}
          leftIcon={<Camera size={16} />}
          onClick={onStart}
        >
          Bật Camera
        </Button>
      ) : (
        <Button
          variant="danger"
          size="md"
          leftIcon={<Square size={16} />}
          onClick={onStop}
        >
          Tắt Camera
        </Button>
      )}

      {/* Pause / Resume (chỉ hiện khi session đang chạy) */}
      {isActive && sessionActive && onPause && onResume && (
        <>
          {!isPaused ? (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Pause size={16} />}
              onClick={onPause}
            >
              Tạm dừng
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Play size={16} />}
              onClick={onResume}
            >
              Tiếp tục
            </Button>
          )}
        </>
      )}

      {/* Reset */}
      {onReset && (
        <Button
          variant="ghost"
          size="md"
          leftIcon={<RotateCcw size={16} />}
          onClick={onReset}
          disabled={isLoading}
        >
          Đặt lại
        </Button>
      )}

      {/* Status indicator */}
      {isActive && (
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400 font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
}
