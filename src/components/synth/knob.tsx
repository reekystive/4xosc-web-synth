import { useKnob } from '@/hooks/use-knob';

interface KnobProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Knob({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  size = 'md',
  color = '#10B981',
}: KnobProps) {
  const { handleMouseDown, knobRef } = useKnob({
    min,
    max,
    value,
    step,
    onChange,
  });

  const normalizedValue = (value - min) / (max - min);
  const rotation = normalizedValue * 270 - 135;
  const displayValue = Math.round(value * 10) / 10;

  // 计算进度圆的参数
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (270 / 360) * circumference;
  const progressOffset = arcLength * (1 - normalizedValue);

  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-24 h-24 text-sm',
    lg: 'w-32 h-32 text-base',
  };

  return (
    <div
      className={`flex flex-col items-center ${sizeClasses[size]} select-none`}
    >
      <div
        ref={knobRef}
        className="relative rounded-full bg-gray-800 shadow-lg cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* 背景圆 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#4B5563"
            strokeWidth="8"
          />
          {/* 进度弧 */}
          <path
            d="M 21.716 78.284 A 40 40 0 1 1 78.284 78.284"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            transform="rotate(0 50 50)"
          />
          {/* 指示线 */}
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="20"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${rotation} 50 50)`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
          {displayValue}
        </div>
      </div>
      <label className="mt-2 text-gray-300">{label}</label>
    </div>
  );
}
