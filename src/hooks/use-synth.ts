import { useCallback, useEffect, useRef } from 'react';
import { FMSynth } from '@/audio/synth/fm-synth';
import { AudioEngine } from '@/audio/context/audio-engine';

export function useSynth(engine: AudioEngine | undefined) {
  const synthRef = useRef<FMSynth | null>(null);

  useEffect(() => {
    if (engine) {
      synthRef.current = new FMSynth(engine);
    }
  }, [engine]);

  const handleNoteOn = useCallback((note: number, velocity = 1) => {
    synthRef.current?.noteOn(note, velocity);
  }, []);

  const handleNoteOff = useCallback((note: number) => {
    synthRef.current?.noteOff(note);
  }, []);

  const setModulatorRatio = useCallback((ratio: number) => {
    synthRef.current?.setModulatorRatio(ratio);
  }, []);

  const setModulationIndex = useCallback((index: number) => {
    synthRef.current?.setModulationIndex(index);
  }, []);

  return {
    noteOn: handleNoteOn,
    noteOff: handleNoteOff,
    setModulatorRatio,
    setModulationIndex,
  };
}
