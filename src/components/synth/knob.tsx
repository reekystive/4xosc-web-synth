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
  const activeTouchId = useRef<number | null>(null);

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
      e.preventDefault();

      // 如果已经在追踪一个触摸点，就忽略新的触摸
      if (isDragging.current) return;

      // 使用 changedTouches 来获取新增的触摸点
      const touch = e.changedTouches[0];
      isDragging.current = true;
      activeTouchId.current = touch.identifier;
      lastY.current = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();

      // 找到属于这个旋钮的触摸点
      const touch = Array.from(e.touches).find((t) => t.identifier === activeTouchId.current);
      if (!touch) return;

      const deltaY = lastY.current - touch.clientY;
      lastY.current = touch.clientY;

      const deltaPercent = (deltaY / 100) * 0.3;
      const newNormalizedValue = Math.min(1, Math.max(0, normalizedValue + deltaPercent));
      onChange(min + (max - min) * newNormalizedValue);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const clientY = e.clientY;
      const deltaY = lastY.current - clientY;
      lastY.current = clientY;

      const deltaPercent = (deltaY / 100) * 0.3;
      const newNormalizedValue = Math.min(1, Math.max(0, normalizedValue + deltaPercent));
      onChange(min + (max - min) * newNormalizedValue);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // 只有当结束的触摸点是我们正在追踪的触摸点时，才重置状态
      const touch = Array.from(e.changedTouches).find((t) => t.identifier === activeTouchId.current);
      if (touch) {
        isDragging.current = false;
        activeTouchId.current = null;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const currentKnob = knobRef.current;
    if (currentKnob) {
      currentKnob.addEventListener('wheel', handleWheel, { passive: false });
      currentKnob.addEventListener('mousedown', handleMouseDown);
      currentKnob.addEventListener('touchstart', handleTouchStart, { passive: false });
      currentKnob.addEventListener('touchmove', handleTouchMove, { passive: false });
      currentKnob.addEventListener('touchend', handleTouchEnd);

      // 这些事件仍然需要在 window 上监听，因为鼠标可能会移出元素
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (currentKnob) {
        currentKnob.removeEventListener('wheel', handleWheel);
        currentKnob.removeEventListener('mousedown', handleMouseDown);
        currentKnob.removeEventListener('touchstart', handleTouchStart);
        currentKnob.removeEventListener('touchmove', handleTouchMove);
        currentKnob.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [min, max, value, onChange, normalizedValue]);

  return (
    <div className={`flex flex-col items-center select-none ${currentSize.container}`}>
      <div ref={knobRef} className="relative w-full aspect-square rounded-full bg-gray-800 cursor-pointer touch-none">
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
