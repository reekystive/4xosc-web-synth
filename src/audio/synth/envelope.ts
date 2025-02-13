export interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class Envelope {
  private params: EnvelopeParams;

  constructor(params: EnvelopeParams) {
    this.params = { ...params };
  }

  public apply(param: AudioParam, time: number, velocity = 1): void {
    const { attack, decay, sustain, release } = this.params;

    param.cancelScheduledValues(time);
    param.setValueAtTime(0, time);

    // Attack phase
    param.linearRampToValueAtTime(velocity, time + attack);

    // Decay phase
    param.linearRampToValueAtTime(sustain * velocity, time + attack + decay);
  }

  public release(param: AudioParam, time: number): void {
    param.cancelScheduledValues(time);
    param.setValueAtTime(param.value, time);
    param.linearRampToValueAtTime(0, time + this.params.release);
  }

  public setAttack(value: number): void {
    this.params.attack = Math.max(0.001, value);
  }

  public setDecay(value: number): void {
    this.params.decay = Math.max(0.001, value);
  }

  public setSustain(value: number): void {
    this.params.sustain = Math.max(0, Math.min(1, value));
  }

  public setRelease(value: number): void {
    this.params.release = Math.max(0.001, value);
  }

  public getRelease(): number {
    return this.params.release;
  }
}
