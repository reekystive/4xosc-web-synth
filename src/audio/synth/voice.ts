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
}

export interface VoiceParams {
  carrierFreq: number;
  modulatorRatio: number;
  modulationIndex: number;
}

export class Voice {
  private context: AudioContext;
  private oscillators: OscillatorNode[];
  private gains: GainNode[];
  private masterGain: GainNode;
  private envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };

  constructor(
    context: AudioContext,
    params: SynthParams,
    frequency: number,
    velocity: number,
    destination: AudioNode,
    envelope: { attack: number; decay: number; sustain: number; release: number }
  ) {
    this.context = context;
    this.oscillators = [];
    this.gains = [];
    this.envelope = envelope;

    // 创建主音量控制
    this.masterGain = context.createGain();
    this.masterGain.connect(destination);
    this.masterGain.gain.value = 0; // 初始音量为 0

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
    const { attack, decay, sustain } = this.envelope;
    const now = this.context.currentTime;

    // 应用 ADSR 包络
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(1, now + attack);
    this.masterGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    this.oscillators.forEach((osc) => osc.start(time));
  }

  public stop(time: number): void {
    const { release } = this.envelope;
    const now = this.context.currentTime;

    // 应用释放阶段
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + release);

    // 在释放结束后停止振荡器
    this.oscillators.forEach((osc) => osc.stop(now + release + 0.1));
  }

  public updateEnvelope(envelope: Partial<typeof this.envelope>): void {
    const now = this.context.currentTime;
    const currentValue = this.masterGain.gain.value;

    // 更新存储的包络参数
    this.envelope = { ...this.envelope, ...envelope };
    const { attack, decay, sustain, release } = this.envelope;

    // 如果当前音量大于 0，说明音符正在播放中
    if (currentValue > 0) {
      // 取消之前的所有预定值
      this.masterGain.gain.cancelScheduledValues(now);
      // 设置当前值
      this.masterGain.gain.setValueAtTime(currentValue, now);

      // 根据当前所处的包络阶段，应用新的包络设置
      if (currentValue === 1) {
        // 在 Attack 阶段
        this.masterGain.gain.linearRampToValueAtTime(sustain, now + decay);
      } else if (currentValue > sustain) {
        // 在 Decay 阶段
        this.masterGain.gain.linearRampToValueAtTime(sustain, now + (decay * (currentValue - sustain)) / (1 - sustain));
      }
      // 如果在 Sustain 阶段，不需要做任何改变
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
      gain.gain.value = params.volume;
    }
  }
}
