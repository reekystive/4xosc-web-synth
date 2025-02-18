import { FC, useCallback, useEffect, useRef } from 'react';
import { Ubuntu_Mono } from 'next/font/google';

const ubuntuMono = Ubuntu_Mono({ weight: '400', subsets: ['latin'] });

interface KnobProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
  size?: 'small' | 'medium' | 'large';
  formatValue?: (value: number) => string;
}

export const Knob: FC<KnobProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  size = 'medium',
  formatValue = (v) => Math.round(v * 100) / 100 + '',
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastY = useRef(0);

  // 将外部值映射到 0-1
  const normalizedValue = (value - min) / (max - min);
  const rotation = normalizedValue * 270 - 135; // -135 到 135 度的旋转范围

  const sizeClasses = {
    small: {
      container: 'w-16',
      indicator: 'pt-[4px] pb-[16px]',
      text: 'text-[12px]',
      label: 'text-[10px]',
    },
    medium: {
      container: 'w-20',
      indicator: 'pt-[6px] pb-[20px]',
      text: 'text-[13px]',
      label: 'text-xs',
    },
    large: {
      container: 'w-24',
      indicator: 'pt-[8px] pb-[24px]',
      text: 'text-[16px]',
      label: 'text-sm',
    },
  };

  const currentSize = sizeClasses[size];

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!knobRef.current?.contains(e.target as Node)) return;
      e.preventDefault();

      const isTouchpad = e.deltaMode === 0;
      const deltaPercent = isTouchpad
        ? (e.deltaY / 100) * 0.3 // 触控板：100 像素对应 30% 变化
        : e.deltaY > 0
          ? -0.01 // 鼠标滚轮：固定 1% 变化
          : 0.01;

      const newNormalizedValue = Math.min(1, Math.max(0, normalizedValue + deltaPercent));
      // 映射回实际值域
      onChange(min + (max - min) * newNormalizedValue);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!knobRef.current?.contains(e.target as Node)) return;
      isDragging.current = true;
      lastY.current = e.clientY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!knobRef.current?.contains(e.target as Node)) return;
      isDragging.current = true;
      lastY.current = e.touches[0].clientY;
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;

      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const deltaY = lastY.current - clientY;
      lastY.current = clientY;

      // 将移动距离转换为 0-1 范围的变化，100像素对应30%的变化
      const deltaPercent = (deltaY / 100) * 0.3;
      const newNormalizedValue = Math.min(1, Math.max(0, normalizedValue + deltaPercent));
      // 映射回实际值域
      onChange(min + (max - min) * newNormalizedValue);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const currentKnob = knobRef.current;
    if (currentKnob) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [min, max, value, onChange, normalizedValue]);

  return (
    <div className={`flex flex-col items-center select-none ${currentSize.container}`}>
      <div ref={knobRef} className="relative w-full aspect-square rounded-full bg-gray-800 cursor-pointer">
        {/* 旋钮背景 */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />

        {/* 旋钮指示器 */}
        <div
          className={`absolute bottom-1/2 left-1/2 w-1 h-[45%] origin-bottom ${currentSize.indicator}`}
          style={{
            transform: `translate(-50%, 0) rotate(${rotation}deg)`,
          }}
        >
          <div className="w-full h-full bg-white rounded-full" />
        </div>

        {/* 数值显示 */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-white ${ubuntuMono.className} ${currentSize.text}`}
        >
          {formatValue(value)}
        </div>
      </div>

      <label className={`mt-1.5 text-gray-300 ${currentSize.label}`}>{label}</label>
    </div>
  );
};
