import { AudioEngine } from '../context/audio-engine';

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
    };
  }

  public noteOn(note: number, velocity = 1): string {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const time = this.engine.audioContext.currentTime;
    // 为每次触发生成唯一的 ID
    const voiceId = `${note}-${time}`;

    const voice = new Voice(
      this.engine.audioContext,
      this.params,
      freq,
      velocity,
      this.engine.audioContext.destination
    );

    voice.start(time);
    this.voices.set(voiceId, voice);
    return voiceId;
  }

  public noteOff(note: number, voiceId?: string): void {
    // 如果提供了 voiceId，只停止特定的 voice
    if (voiceId && this.voices.has(voiceId)) {
      const voice = this.voices.get(voiceId);
      voice?.stop(this.engine.audioContext.currentTime);
      this.voices.delete(voiceId);
      return;
    }

    // 否则停止所有匹配音符的 voices
    for (const [id, voice] of this.voices.entries()) {
      if (id.startsWith(`${note}-`)) {
        voice.stop(this.engine.audioContext.currentTime);
        this.voices.delete(id);
      }
    }
  }

  public setOscParams(
    oscNumber: 1 | 2 | 3 | 4,
    params: Partial<OscillatorParams>
  ): void {
    const osc = `osc${oscNumber}` as keyof SynthParams;
    this.params[osc] = { ...this.params[osc], ...params };

    // 更新所有正在播放的音符
    this.voices.forEach((voice) => {
      voice.updateOscParams(oscNumber, params);
    });
  }
}

class Voice {
  private context: AudioContext;
  private oscillators: OscillatorNode[];
  private gains: GainNode[];
  private masterGain: GainNode;

  constructor(
    context: AudioContext,
    params: SynthParams,
    frequency: number,
    velocity: number,
    destination: AudioNode
  ) {
    this.context = context;
    this.oscillators = [];
    this.gains = [];

    // 创建主音量控制
    this.masterGain = context.createGain();
    this.masterGain.connect(destination);
    this.masterGain.gain.value = velocity;

    // 创建四个振荡器
    [params.osc1, params.osc2, params.osc3, params.osc4].forEach((oscParams) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = oscParams.waveform;
      osc.frequency.value = frequency;
      osc.detune.value = oscParams.detune;

      gain.gain.value = oscParams.volume;

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.oscillators.push(osc);
      this.gains.push(gain);
    });
  }

  public start(time: number): void {
    this.oscillators.forEach((osc) => osc.start(time));
  }

  public stop(time: number): void {
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, time);
    this.masterGain.gain.linearRampToValueAtTime(0, time + 0.1);

    const stopTime = time + 0.2;
    this.oscillators.forEach((osc) => osc.stop(stopTime));
  }

  public updateOscParams(
    oscNumber: 1 | 2 | 3 | 4,
    params: Partial<OscillatorParams>
  ): void {
    const index = oscNumber - 1;
    const osc = this.oscillators[index];
    const gain = this.gains[index];

    if (params.waveform !== undefined) {
      osc.type = params.waveform;
    }
    if (params.detune !== undefined) {
      osc.detune.value = params.detune;
    }
    if (params.volume !== undefined) {
      gain.gain.value = params.volume;
    }
  }
}
