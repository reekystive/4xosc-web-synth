import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '@/audio/context/audio-engine';

export const useAudioEngine = () => {
  const engineRef = useRef<AudioEngine | null>(null);
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    engineRef.current = new AudioEngine();
    if (engineRef.current.audioContext.state !== 'running') {
      setIsReady(false);
    }
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
