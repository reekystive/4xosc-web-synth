import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '4xOsc Web Synth',
  description: 'A web-based subtractive synthesizer with 4 oscillators',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`bg-slate-950 bg-opacity-40 text-gray-100 ${inter.className}`}>{children}</body>
    </html>
  );
}
