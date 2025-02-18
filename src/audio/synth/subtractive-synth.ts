import { AudioEngine } from '../context/audio-engine';
import { Voice, FilterMode } from './voice';
import { OscillatorType } from '@/types/synth';

interface OscillatorParams {
  waveform: OscillatorType;
  detune: number;
  volume: number;
}

interface SynthParams {
  osc1: OscillatorParams;
  osc2: OscillatorParams;
  osc3: OscillatorParams;
  osc4: OscillatorParams;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

interface SynthInitialState {
  oscillators: {
    osc1: OscillatorParams;
    osc2: OscillatorParams;
    osc3: OscillatorParams;
    osc4: OscillatorParams;
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

export class SubtractiveSynth {
  private engine: AudioEngine;
  private voices: Map<string, Voice>;
  private params: SynthParams;
  private filterMode: FilterMode;
  private cutoffFreq: number;
  private ampEnvelope: { attack: number; decay: number; sustain: number; release: number };
  private filterEnvelope: { attack: number; decay: number; sustain: number; release: number };

  constructor(engine: AudioEngine, initialState?: SynthInitialState) {
    this.engine = engine;
    this.voices = new Map();

    // 使用初始状态或默认值
    this.ampEnvelope = initialState?.ampEnvelope ?? {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.7,
      release: 0.5,
    };

    this.filterEnvelope = initialState?.filterEnvelope ?? {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.7,
      release: 0.5,
    };

    this.filterMode = initialState?.filterMode ?? 'none';
    this.cutoffFreq = initialState?.cutoffFreq ?? 20000;

    this.params = {
      osc1: initialState?.oscillators.osc1 ?? {
        waveform: 'sine',
        detune: 0,
        volume: 0.5,
      },
      osc2: initialState?.oscillators.osc2 ?? {
        waveform: 'square',
        detune: 0,
        volume: 0.5,
      },
      osc3: initialState?.oscillators.osc3 ?? {
        waveform: 'sawtooth',
        detune: 0,
        volume: 0.5,
      },
      osc4: initialState?.oscillators.osc4 ?? {
        waveform: 'triangle',
        detune: 0,
        volume: 0.5,
      },
      envelope: this.ampEnvelope,
    };
  }

  public noteOn(note: number, velocity = 1): string {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const time = this.engine.audioContext.currentTime;
    const voiceId = `${note}-${time}`;

    const voice = new Voice({
      context: this.engine.audioContext,
      params: this.params,
      frequency: freq,
      velocity,
      destination: this.engine.audioContext.destination,
      ampEnvelope: this.ampEnvelope,
      filterEnvelope: this.filterEnvelope,
      filterMode: this.filterMode,
      cutoffFreq: this.cutoffFreq,
    });

    voice.start(time);
    this.voices.set(voiceId, voice);
    return voiceId;
  }

  public noteOff(note: number, voiceId?: string): void {
    if (voiceId && this.voices.has(voiceId)) {
      const voice = this.voices.get(voiceId);
      voice?.stop(this.engine.audioContext.currentTime);
      this.voices.delete(voiceId);
      return;
    }

    for (const [id, voice] of this.voices.entries()) {
      if (id.startsWith(`${note}-`)) {
        voice.stop(this.engine.audioContext.currentTime);
        this.voices.delete(id);
      }
    }
  }

  public setOscParams(oscNumber: 1 | 2 | 3 | 4, params: Partial<OscillatorParams>): void {
    const osc = `osc${oscNumber}` as 'osc1' | 'osc2' | 'osc3' | 'osc4';
    this.params[osc] = { ...this.params[osc], ...params };

    this.voices.forEach((voice) => {
      voice.updateOscParams(oscNumber, params);
    });
  }

  public setAmpEnvelope(params: Partial<{ attack: number; decay: number; sustain: number; release: number }>): void {
    this.ampEnvelope = { ...this.ampEnvelope, ...params };
    this.voices.forEach((voice) => {
      voice.updateAmpEnvelope(params);
    });
  }

  public setFilterEnvelope(params: Partial<{ attack: number; decay: number; sustain: number; release: number }>): void {
    this.filterEnvelope = { ...this.filterEnvelope, ...params };
    this.voices.forEach((voice) => {
      voice.updateFilterEnvelope(params);
    });
  }

  public setFilterMode(mode: FilterMode, cutoffFreq: number): void {
    this.filterMode = mode;
    this.cutoffFreq = cutoffFreq;
    this.voices.forEach((voice) => {
      voice.setFilterMode(mode, cutoffFreq);
    });
  }
}
