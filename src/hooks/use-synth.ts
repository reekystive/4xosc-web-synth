import { useCallback, useEffect, useRef } from 'react';
import { SubtractiveSynth } from '@/audio/synth/subtractive-synth';
import { AudioEngine } from '@/audio/context/audio-engine';
import { OscillatorType } from '@/types/synth';

export function useSynth(engine: AudioEngine | undefined) {
  const synthRef = useRef<SubtractiveSynth | null>(null);
  // 跟踪每个音符的 voiceId
  const voiceIdsRef = useRef<Map<number, string[]>>(new Map());

  useEffect(() => {
    if (engine) {
      synthRef.current = new SubtractiveSynth(engine);
    }
  }, [engine]);

  const handleNoteOn = useCallback((note: number, velocity = 1) => {
    if (synthRef.current) {
      const voiceId = synthRef.current.noteOn(note, velocity);
      // 保存 voiceId
      const voiceIds = voiceIdsRef.current.get(note) || [];
      voiceIds.push(voiceId);
      voiceIdsRef.current.set(note, voiceIds);
    }
  }, []);

  const handleNoteOff = useCallback((note: number) => {
    if (synthRef.current) {
      // 获取并移除最后一个 voiceId
      const voiceIds = voiceIdsRef.current.get(note) || [];
      const voiceId = voiceIds.pop();
      if (voiceIds.length === 0) {
        voiceIdsRef.current.delete(note);
      } else {
        voiceIdsRef.current.set(note, voiceIds);
      }
      synthRef.current.noteOff(note, voiceId);
    }
  }, []);

  const setOscillatorParams = useCallback(
    (
      oscNumber: 1 | 2 | 3 | 4,
      params: {
        waveform?: OscillatorType;
        detune?: number;
        volume?: number;
      }
    ) => {
      synthRef.current?.setOscParams(oscNumber, params);
    },
    []
  );

  return {
    noteOn: handleNoteOn,
    noteOff: handleNoteOff,
    setOscillatorParams,
  };
}
