import { AudioEngine } from '../context/audio-engine';
import { Voice } from './voice';
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

export class SubtractiveSynth {
  private engine: AudioEngine;
  private voices: Map<string, Voice>;
  private params: SynthParams;

  constructor(engine: AudioEngine) {
    this.engine = engine;
    this.voices = new Map();
    this.params = {
      osc1: {
        waveform: 'sine',
        detune: 0,
        volume: 0.5,
      },
      osc2: {
        waveform: 'square',
        detune: 0,
        volume: 0.5,
      },
      osc3: {
        waveform: 'sawtooth',
        detune: 0,
        volume: 0.5,
      },
      osc4: {
        waveform: 'triangle',
        detune: 0,
        volume: 0.5,
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.7,
        release: 0.5,
      },
    };
  }

  public noteOn(note: number, velocity = 1): string {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const time = this.engine.audioContext.currentTime;
    const voiceId = `${note}-${time}`;

    const voice = new Voice(
      this.engine.audioContext,
      this.params,
      freq,
      velocity,
      this.engine.audioContext.destination,
      this.params.envelope
    );

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

  public setEnvelopeParams(params: Partial<typeof this.params.envelope>): void {
    this.params.envelope = { ...this.params.envelope, ...params };
    this.voices.forEach((voice) => {
      voice.updateEnvelope(params);
    });
  }
}
