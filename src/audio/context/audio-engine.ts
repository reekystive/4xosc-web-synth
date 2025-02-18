export class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;

  constructor() {
    this.context = new globalThis.AudioContext({
      latencyHint: 'interactive',
    });
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }

  public get audioContext(): AudioContext {
    return this.context;
  }

  public setMasterVolume(value: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, value));
  }

  public getMasterVolume(): number {
    return this.masterGain.gain.value;
  }

  public async resume(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  public suspend(): Promise<void> {
    return this.context.suspend();
  }
}
