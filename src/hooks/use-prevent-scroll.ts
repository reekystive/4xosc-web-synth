import { useEffect } from 'react';
import { isClient } from '@/utils/env';

// 使用闭包来维护一个计数器
let preventScrollCount = 0;

const setBodyScroll = (shouldPrevent: boolean) => {
  // 确保只在客户端执行
  if (!isClient()) return;

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
