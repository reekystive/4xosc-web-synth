import { FC, useCallback, useEffect, useRef } from 'react';

interface KnobProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
}

export const Knob: FC<KnobProps> = ({ min, max, value, onChange, step = 1, label }) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastY = useRef(0);

  const normalizedValue = (value - min) / (max - min);
  const rotation = normalizedValue * 270 - 135; // -135 到 135 度的旋转范围
  const displayValue = Math.round(value * 10) / 10;

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    lastY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;

      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const deltaY = lastY.current - clientY;
      lastY.current = clientY;

      // 计算值的范围
      const range = max - min;
      // 将移动距离转换为范围的百分比变化，100像素对应30%的变化（提高三倍）
      const deltaPercent = (deltaY / 100) * (range * 0.3);
      const newValue = Math.min(max, Math.max(min, value + deltaPercent));
      onChange(newValue);
    },
    [min, max, value, onChange]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const isTouchpad = e.deltaMode === 0;
      const range = max - min;

      if (isTouchpad) {
        // 触控板：根据实际滑动距离计算变化
        // deltaY 通常是像素单位，我们将其转换为值的变化
        // 100像素对应范围的30%变化（与鼠标拖动保持一致）
        const deltaPercent = -1 * (e.deltaY / 100) * (range * 0.3);
        onChange(Math.min(max, Math.max(min, value - deltaPercent)));
      } else {
        // 鼠标滚轮：保持固定的变化量
        const percentChange = range * 0.01;
        const delta = e.deltaY > 0 ? -percentChange : percentChange;
        onChange(Math.min(max, Math.max(min, value + delta)));
      }
    };

    const currentKnob = knobRef.current;
    if (currentKnob) {
      currentKnob.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      if (currentKnob) {
        currentKnob.removeEventListener('wheel', handleWheel);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      }
    };
  }, [handleMouseMove, handleMouseUp, min, max, value, onChange]);

  return (
    <div className="flex flex-col items-center w-20 select-none">
      <div
        ref={knobRef}
        className="relative w-full aspect-square rounded-full bg-gray-800 cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* 旋钮背景 */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />

        {/* 旋钮指示器 */}
        <div
          className="absolute bottom-1/2 left-1/2 w-1 pt-[6px] pb-[20px] h-[45%] origin-bottom"
          style={{
            transform: `translate(-50%, 0) rotate(${rotation}deg)`,
          }}
        >
          <div className="w-full h-full bg-white rounded-full" />
        </div>

        {/* 数值显示 */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-mono text-xs">
          {displayValue}
        </div>
      </div>

      <label className="mt-1.5 text-xs text-gray-300">{label}</label>
    </div>
  );
};
