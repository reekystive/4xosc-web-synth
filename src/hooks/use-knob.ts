'use client';

import { useCallback, useRef, useEffect } from 'react';

interface UseKnobProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}

type KnobEvent = MouseEvent | TouchEvent;
type KnobReactEvent = React.MouseEvent | React.TouchEvent;

export function useKnob({ min, max, value, step = 1, onChange }: UseKnobProps) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(0);
  const knobRef = useRef<HTMLDivElement | null>(null);

  const handlersRef = useRef({
    onMouseMove: null as ((e: KnobEvent) => void) | null,
    onMouseOut: null as ((e: MouseEvent) => void) | null,
    cleanup: null as (() => void) | null,
  });

  const getClientY = (e: KnobEvent): number => {
    return 'touches' in e ? e.touches[0].clientY : e.clientY;
  };

  const setValueWithinRange = useCallback(
    (newValue: number) => {
      onChange(Math.min(max, Math.max(min, newValue)));
    },
    [min, max, onChange]
  );

  useEffect(() => {
    handlersRef.current.onMouseMove = (e: KnobEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const clientY = getClientY(e);
      const diff = startY.current - clientY;
      const newValue = startValue.current + diff * step;
      setValueWithinRange(newValue);
    };

    handlersRef.current.cleanup = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handlersRef.current.onMouseMove!);
      document.removeEventListener('mouseup', handlersRef.current.cleanup!);
      document.removeEventListener('touchmove', handlersRef.current.onMouseMove!);
      document.removeEventListener('touchend', handlersRef.current.cleanup!);
      document.removeEventListener('mouseout', handlersRef.current.onMouseOut!);
    };

    handlersRef.current.onMouseOut = (e: MouseEvent) => {
      if (isDragging.current && !e.relatedTarget) {
        handlersRef.current.cleanup?.();
      }
    };
  }, [step, setValueWithinRange]);

  const handleMouseDown = useCallback(
    (e: KnobReactEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startValue.current = value;
      document.addEventListener('mousemove', handlersRef.current.onMouseMove!);
      document.addEventListener('mouseup', handlersRef.current.cleanup!);
      document.addEventListener('touchmove', handlersRef.current.onMouseMove!);
      document.addEventListener('touchend', handlersRef.current.cleanup!);
      document.addEventListener('mouseout', handlersRef.current.onMouseOut!);
    },
    [value]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const isTouchpad = e.deltaMode === 0;
      const delta = isTouchpad ? e.deltaY * 0.1 : e.deltaY > 0 ? -step : step;
      setValueWithinRange(value + delta);
    },
    [value, step, setValueWithinRange]
  );

  useEffect(() => {
    const currentKnobRef = knobRef.current;
    const cleanup = handlersRef.current.cleanup;

    if (currentKnobRef) {
      currentKnobRef.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (currentKnobRef) {
        currentKnobRef.removeEventListener('wheel', handleWheel);
      }
      cleanup?.();
    };
  }, [handleWheel]);

  return { handleMouseDown, knobRef };
}
