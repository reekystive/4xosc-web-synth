'use client';

import { FC, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { isClient } from '@/utils/env';

interface ClientPortalProps extends PropsWithChildren {
  selector?: string;
}

export const ClientPortal: FC<ClientPortalProps> = ({ children, selector = 'body' }) => {
  if (!isClient()) return null;

  const targetElement = document.querySelector(selector);
  if (!targetElement) return null;

  return createPortal(children, targetElement);
};
