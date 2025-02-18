import { useState } from 'react';
import { OscillatorType } from '@/types/synth';
import { FilterMode } from '@/audio/synth/voice';

export interface SynthState {
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

export const INITIAL_STATE: SynthState = {
  oscillators: {
    osc1: { waveform: 'square', detune: 0, volume: 0.8 },
    osc2: { waveform: 'sine', detune: 0, volume: 0 },
    osc3: { waveform: 'sine', detune: 0, volume: 0 },
    osc4: { waveform: 'sine', detune: 0, volume: 0 },
  },
  ampEnvelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.7,
    release: 0.05,
  },
  filterEnvelope: {
    attack: 0.03,
    decay: 0.2,
    sustain: 0.7,
    release: 0.15,
  },
  filterMode: 'none' as FilterMode,
  cutoffFreq: 20000,
};

type OscNumber = 1 | 2 | 3 | 4;

export const useSynthState = (
  setOscillatorParams: (
    oscNumber: OscNumber,
    params: Partial<{ waveform: OscillatorType; detune: number; volume: number }>
  ) => void,
  setAmpEnvelope: (params: Partial<{ attack: number; decay: number; sustain: number; release: number }>) => void,
  setFilterEnvelope: (params: Partial<{ attack: number; decay: number; sustain: number; release: number }>) => void,
  setFilterMode: (mode: FilterMode, cutoffFreq: number) => void
) => {
  const [osc1, setOsc1] = useState(INITIAL_STATE.oscillators.osc1);
  const [osc2, setOsc2] = useState(INITIAL_STATE.oscillators.osc2);
  const [osc3, setOsc3] = useState(INITIAL_STATE.oscillators.osc3);
  const [osc4, setOsc4] = useState(INITIAL_STATE.oscillators.osc4);
  const [ampEnvelope, setAmpEnvelopeState] = useState(INITIAL_STATE.ampEnvelope);
  const [filterEnvelope, setFilterEnvelopeState] = useState(INITIAL_STATE.filterEnvelope);
  const [filterMode, setFilterModeState] = useState<FilterMode>(INITIAL_STATE.filterMode);
  const [cutoffFreq, setCutoffFreq] = useState(INITIAL_STATE.cutoffFreq);

  const handleOscParamsChange = (
    oscNumber: OscNumber,
    params: Partial<{ waveform: OscillatorType; detune: number; volume: number }>
  ) => {
    const setOsc = [setOsc1, setOsc2, setOsc3, setOsc4][oscNumber - 1];
    setOsc((prev) => ({ ...prev, ...params }));
    setOscillatorParams(oscNumber, params);
  };

  const handleAmpEnvelopeChange = (param: keyof typeof ampEnvelope, value: number) => {
    setAmpEnvelopeState((prev) => {
      const newEnvelope = { ...prev, [param]: value };
      setAmpEnvelope({ [param]: value });
      return newEnvelope;
    });
  };

  const handleFilterEnvelopeChange = (param: keyof typeof filterEnvelope, value: number) => {
    setFilterEnvelopeState((prev) => {
      const newEnvelope = { ...prev, [param]: value };
      setFilterEnvelope({ [param]: value });
      return newEnvelope;
    });
  };

  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterModeState(mode);
    setFilterMode(mode, cutoffFreq);
  };

  const handleCutoffFreqChange = (freq: number) => {
    setCutoffFreq(freq);
    setFilterMode(filterMode, freq);
  };

  return {
    oscillators: { osc1, osc2, osc3, osc4 },
    ampEnvelope,
    filterEnvelope,
    filterMode,
    cutoffFreq,
    handleOscParamsChange,
    handleAmpEnvelopeChange,
    handleFilterEnvelopeChange,
    handleFilterModeChange,
    handleCutoffFreqChange,
  };
};
