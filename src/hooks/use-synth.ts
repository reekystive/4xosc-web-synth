import { useCallback, useEffect, useRef } from 'react';
import { SubtractiveSynth } from '@/audio/synth/subtractive-synth';
import { AudioEngine } from '@/audio/context/audio-engine';
import { OscillatorType } from '@/types/synth';
import { FilterMode } from '@/audio/synth/voice';

interface SynthInitialState {
  oscillators: {
    osc1: { waveform: OscillatorType; detune: number; volume: number };
    osc2: { waveform: OscillatorType; detune: number; volume: number };
    osc3: { waveform: OscillatorType; detune: number; volume: number };
    osc4: { waveform: OscillatorType; detune: number; volume: number };
  };
  ampEnvelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  filterEnvelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  filterMode: FilterMode;
  cutoffFreq: number;
}

export function useSynth(engine: AudioEngine | null, initialState: SynthInitialState) {
  const synthRef = useRef<SubtractiveSynth | null>(null);
  // 跟踪每个音符的 voiceId
  const voiceIdsRef = useRef<Map<number, string[]>>(new Map());

  useEffect(() => {
    if (engine && initialState) {
      synthRef.current = new SubtractiveSynth(engine, initialState);
    } else if (engine) {
      synthRef.current = new SubtractiveSynth(engine);
    }
  }, [engine, initialState]);

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

  const setAmpEnvelope = useCallback(
    (params: Partial<{ attack: number; decay: number; sustain: number; release: number }>) => {
      if (!synthRef.current) return;
      synthRef.current.setAmpEnvelope(params);
    },
    []
  );

  const setFilterEnvelope = useCallback(
    (params: Partial<{ attack: number; decay: number; sustain: number; release: number }>) => {
      if (!synthRef.current) return;
      synthRef.current.setFilterEnvelope(params);
    },
    []
  );

  const setFilterMode = useCallback((mode: FilterMode, amount: number) => {
    synthRef.current?.setFilterMode(mode, amount);
  }, []);

  return {
    noteOn: handleNoteOn,
    noteOff: handleNoteOff,
    setOscillatorParams,
    setAmpEnvelope,
    setFilterEnvelope,
    setFilterMode,
  };
}
