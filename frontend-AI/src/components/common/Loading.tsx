import { clsx } from 'clsx';

type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
type LoadingVariant = 'spinner' | 'dots' | 'pulse';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap: Record<LoadingSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

function Spinner({ size }: { size: LoadingSize }) {
  return (
    <svg
      className={clsx('animate-spin text-indigo-500', sizeMap[size])}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

function Dots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function Pulse({ size }: { size: LoadingSize }) {
  return (
    <div
      className={clsx(
        'rounded-full bg-indigo-500/30 animate-pulse',
        sizeMap[size]
      )}
    />
  );
}

export default function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className,
}: LoadingProps) {
  const content = (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      {variant === 'spinner' && <Spinner size={size} />}
      {variant === 'dots' && <Dots />}
      {variant === 'pulse' && <Pulse size={size} />}
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
