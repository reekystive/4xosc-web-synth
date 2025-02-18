import { Envelope } from './envelope';

export interface VoiceParams {
  carrierFreq: number;
  modulatorRatio: number;
  modulationIndex: number;
}

export class Voice {
  private context: AudioContext;
  private carrier: OscillatorNode;
  private modulator: OscillatorNode;
  private modulatorGain: GainNode;
  private amplitudeEnvelope: Envelope;
  private output: GainNode;
  private modEnvelope: Envelope;

  constructor(context: AudioContext, params: VoiceParams, destination: AudioNode) {
    this.context = context;

    // Create nodes
    this.carrier = context.createOscillator();
    this.modulator = context.createOscillator();
    this.modulatorGain = context.createGain();
    this.output = context.createGain();

    // Setup FM routing
    this.modulator.connect(this.modulatorGain);
    this.modulatorGain.connect(this.carrier.frequency);
    this.carrier.connect(this.output);
    this.output.connect(destination);

    // Initialize envelopes
    this.amplitudeEnvelope = new Envelope({
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.1,
    });

    this.modEnvelope = new Envelope({
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.1,
    });

    // Set initial parameters
    this.setParams(params);
  }

  public start(time: number, velocity = 1): void {
    this.modulator.start(time);
    this.carrier.start(time);
    this.amplitudeEnvelope.apply(this.output.gain, time, velocity);
    this.modEnvelope.apply(this.modulatorGain.gain, time, velocity);
  }

  public stop(time: number): void {
    const releaseTime = time + this.amplitudeEnvelope.getRelease();

    this.amplitudeEnvelope.release(this.output.gain, time);
    this.modEnvelope.release(this.modulatorGain.gain, time);

    this.carrier.stop(releaseTime);
    this.modulator.stop(releaseTime);
  }

  public setParams(params: Partial<VoiceParams>): void {
    if (params.carrierFreq !== undefined) {
      this.carrier.frequency.value = params.carrierFreq;
    }

    if (params.modulatorRatio !== undefined) {
      this.modulator.frequency.value = this.carrier.frequency.value * params.modulatorRatio;
    }

    if (params.modulationIndex !== undefined) {
      this.modulatorGain.gain.value = params.modulationIndex * this.carrier.frequency.value;
    }
  }
}
