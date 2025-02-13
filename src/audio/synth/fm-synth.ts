import { AudioEngine } from '../context/audio-engine';
import { Voice, VoiceParams } from './voice';

export class FMSynth {
  private engine: AudioEngine;
  private voices: Map<number, Voice>;
  private params: VoiceParams;

  constructor(engine: AudioEngine) {
    this.engine = engine;
    this.voices = new Map();
    this.params = {
      carrierFreq: 440,
      modulatorRatio: 1,
      modulationIndex: 1,
    };
  }

  public noteOn(note: number, velocity = 1): void {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const time = this.engine.audioContext.currentTime;

    const voice = new Voice(
      this.engine.audioContext,
      {
        ...this.params,
        carrierFreq: freq,
      },
      this.engine.audioContext.destination
    );

    voice.start(time, velocity);
    this.voices.set(note, voice);
  }

  public noteOff(note: number): void {
    const voice = this.voices.get(note);
    if (voice) {
      voice.stop(this.engine.audioContext.currentTime);
      this.voices.delete(note);
    }
  }

  public setModulatorRatio(ratio: number): void {
    this.params.modulatorRatio = ratio;
    this.voices.forEach((voice) => {
      voice.setParams({ modulatorRatio: ratio });
    });
  }

  public setModulationIndex(index: number): void {
    this.params.modulationIndex = index;
    this.voices.forEach((voice) => {
      voice.setParams({ modulationIndex: index });
    });
  }
}
