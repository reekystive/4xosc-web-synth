import { useEffect } from 'react';

// 使用闭包来维护一个计数器
let preventScrollCount = 0;

const setBodyScroll = (shouldPrevent: boolean) => {
  if (shouldPrevent) {
    preventScrollCount++;
    if (preventScrollCount === 1) {
      document.body.style.overflow = 'hidden';
    }
  } else {
    preventScrollCount = Math.max(0, preventScrollCount - 1);
    if (preventScrollCount === 0) {
      document.body.style.overflow = 'auto';
    }
  }
};

export const usePreventScroll = (shouldPrevent: boolean) => {
  useEffect(() => {
    setBodyScroll(shouldPrevent);

    return () => {
      setBodyScroll(false);
    };
  }, [shouldPrevent]);
};
