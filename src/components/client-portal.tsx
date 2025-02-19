'use client';

import { FC, PropsWithChildren, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ClientPortalProps extends PropsWithChildren {
  selector?: string;
}

export const ClientPortal: FC<ClientPortalProps> = ({ children, selector = 'body' }) => {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const targetElement = document.querySelector(selector);
  if (!targetElement) return null;

  return createPortal(children, targetElement);
};
