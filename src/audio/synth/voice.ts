import { OscillatorType } from '@/types/synth';

// 添加音量转换函数
function linearToDecibels(value: number): number {
  // 将 0-1 的线性值转换为 -60dB 到 0dB
  return value === 0 ? -Infinity : 20 * Math.log10(value);
}

function decibelsToGain(db: number): number {
  // 将分贝值转换为增益值
  return db === -Infinity ? 0 : Math.pow(10, db / 20);
}

function linearToGain(value: number): number {
  // 将 0-1 的线性值转换为增益值，使用分贝作为中间值
  const db = linearToDecibels(value);
  return decibelsToGain(db);
}

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

export interface VoiceParams {
  carrierFreq: number;
  modulatorRatio: number;
  modulationIndex: number;
}

export type FilterMode = 'lowpass' | 'highpass' | 'none';

interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface VoiceConfig {
  context: AudioContext;
  params: SynthParams;
  frequency: number;
  velocity: number;
  destination: AudioNode;
  ampEnvelope: EnvelopeParams;
  filterEnvelope: EnvelopeParams;
  filterMode: FilterMode;
  cutoffFreq: number;
}

export class Voice {
  private context: AudioContext;
  private oscillators: OscillatorNode[];
  private gains: GainNode[];
  private masterGain: GainNode;
  private compressor: DynamicsCompressorNode;
  private filter: BiquadFilterNode;
  private ampEnvelope: EnvelopeParams;
  private filterEnvelope: EnvelopeParams;
  private baseFrequency: number;
  private filterMode: FilterMode = 'none';
  private cutoffFreq: number;
  private baseFilterFreq: number = 20;

  constructor({
    context,
    params,
    frequency,
    velocity,
    destination,
    ampEnvelope,
    filterEnvelope,
    filterMode,
    cutoffFreq,
  }: VoiceConfig) {
    this.context = context;
    this.oscillators = [];
    this.gains = [];
    this.ampEnvelope = ampEnvelope;
    this.filterEnvelope = filterEnvelope;
    this.filterMode = filterMode;
    this.cutoffFreq = cutoffFreq;
    this.baseFrequency = frequency;

    // 创建滤波器
    this.filter = context.createBiquadFilter();
    this.filter.type = filterMode === 'highpass' ? 'highpass' : 'lowpass';
    this.filter.frequency.value = this.baseFilterFreq;
    this.filter.Q.value = 1;

    // 创建动态压缩器
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = -20;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0;
    this.compressor.release.value = 0.25;
    this.compressor.connect(destination);

    // 创建主音量控制
    this.masterGain = context.createGain();
    this.masterGain.connect(this.filter);
    this.filter.connect(this.compressor);
    this.masterGain.gain.value = 0;

    // 创建四个振荡器
    [params.osc1, params.osc2, params.osc3, params.osc4].forEach((oscParams) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = oscParams.waveform;
      osc.frequency.value = frequency;
      osc.detune.value = oscParams.detune;

      // 使用转换函数设置音量
      gain.gain.value = linearToGain(oscParams.volume);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.oscillators.push(osc);
      this.gains.push(gain);
    });
  }

  private applyAmpEnvelope(now: number): void {
    const { attack, decay, sustain } = this.ampEnvelope;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(linearToGain(1), now + attack);
    this.masterGain.gain.linearRampToValueAtTime(linearToGain(sustain), now + attack + decay);
  }

  private applyFilterEnvelope(now: number): void {
    if (this.filterMode === 'none') {
      this.filter.Q.value = 0;
      this.filter.frequency.setValueAtTime(20000, now);
      return;
    }

    const { attack, decay, sustain } = this.filterEnvelope;
    const maxFreq = 20000;
    const minFreq = 20;

    // 使用实际的截止频率
    const targetFreq = Math.min(Math.max(this.cutoffFreq, minFreq), maxFreq);

    this.filter.Q.value = 2;
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.baseFilterFreq, now);
    this.filter.frequency.exponentialRampToValueAtTime(targetFreq, now + attack);
    this.filter.frequency.exponentialRampToValueAtTime(
      this.baseFilterFreq + (targetFreq - this.baseFilterFreq) * sustain,
      now + attack + decay
    );
  }

  private releaseAmpEnvelope(now: number): void {
    const { release } = this.ampEnvelope;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + release);
  }

  private releaseFilterEnvelope(now: number): void {
    if (this.filterMode === 'none') return;

    const { release } = this.filterEnvelope;
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.exponentialRampToValueAtTime(this.baseFilterFreq, now + release);
  }

  public start(time: number): void {
    const now = this.context.currentTime;
    this.applyAmpEnvelope(now);
    this.applyFilterEnvelope(now);
    this.oscillators.forEach((osc) => osc.start(time));
  }

  public stop(time: number): void {
    const now = this.context.currentTime;
    this.releaseAmpEnvelope(now);
    this.releaseFilterEnvelope(now);

    // 在释放结束后停止振荡器
    const maxRelease = Math.max(this.ampEnvelope.release, this.filterEnvelope.release);
    this.oscillators.forEach((osc) => osc.stop(now + maxRelease + 0.1));
  }

  public updateAmpEnvelope(envelope: Partial<EnvelopeParams>): void {
    const now = this.context.currentTime;
    const currentValue = this.masterGain.gain.value;
    this.ampEnvelope = { ...this.ampEnvelope, ...envelope };

    if (currentValue > 0) {
      const { decay, sustain } = this.ampEnvelope;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(currentValue, now);

      if (currentValue === linearToGain(1)) {
        this.masterGain.gain.linearRampToValueAtTime(linearToGain(sustain), now + decay);
      } else if (currentValue > linearToGain(sustain)) {
        this.masterGain.gain.linearRampToValueAtTime(
          linearToGain(sustain),
          now + (decay * (currentValue - linearToGain(sustain))) / (1 - linearToGain(sustain))
        );
      }
    }
  }

  public updateFilterEnvelope(envelope: Partial<EnvelopeParams>): void {
    if (this.filterMode === 'none') return;

    const now = this.context.currentTime;
    this.filterEnvelope = { ...this.filterEnvelope, ...envelope };
    const { decay, sustain } = this.filterEnvelope;
    const maxFreq = 20000;
    const minFreq = 20;

    // 使用实际的截止频率
    const targetFreq = Math.min(Math.max(this.cutoffFreq, minFreq), maxFreq);

    // 保持当前的包络状态
    if (this.filter.frequency.value !== targetFreq) {
      this.filter.frequency.cancelScheduledValues(now);
      this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
      this.filter.frequency.exponentialRampToValueAtTime(
        this.baseFilterFreq + (targetFreq - this.baseFilterFreq) * sustain,
        now + decay
      );
    }
  }

  public setFilterMode(mode: FilterMode, cutoffFreq: number): void {
    const now = this.context.currentTime;
    this.filterMode = mode;
    this.cutoffFreq = cutoffFreq;
    this.filter.type = mode === 'highpass' ? 'highpass' : 'lowpass';

    // 如果当前没有声音播放，直接应用新的滤波器设置
    if (this.masterGain.gain.value === 0) {
      this.applyFilterEnvelope(now);
    }
  }

  public updateOscParams(oscNumber: 1 | 2 | 3 | 4, params: Partial<OscillatorParams>): void {
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
      // 使用转换函数设置音量
      gain.gain.value = linearToGain(params.volume);
    }
  }
}
