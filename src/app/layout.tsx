import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'WebAudio Simple Synth',
  description: 'A simple synthesizer built with Web Audio API',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`bg-slate-950 bg-opacity-40 text-gray-100 ${inter.className}`}>{children}</body>
    </html>
  );
}
