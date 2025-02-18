import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '@/audio/context/audio-engine';

export const useAudioEngine = () => {
  const engineRef = useRef<AudioEngine | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    engineRef.current = new AudioEngine();
    return () => {
      engineRef.current?.suspend();
    };
  }, []);

  const resumeAudio = async () => {
    await engineRef.current?.resume();
    setIsReady(true);
  };

  return {
    engine: engineRef.current,
    isReady,
    resumeAudio,
  };
};
