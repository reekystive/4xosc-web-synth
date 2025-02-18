'use client';

import { Keyboard } from '@/components/synth/keyboard';
import { Knob } from '@/components/synth/knob';
import { WaveformSelector } from '@/components/synth/waveform-selector';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { useSynth } from '@/hooks/use-synth';
import { OscillatorType } from '@/types/synth';
import { useState } from 'react';

import { Qwigley } from 'next/font/google';

// If loading a variable font, you don't need to specify the font weight
const qwigley = Qwigley({ weight: '400', subsets: ['latin'] });

const OSC_TYPES: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];

export default function Home() {
  const { engine, isReady, resumeAudio } = useAudioEngine();
  const { noteOn, noteOff, setOscillatorParams } = useSynth(engine);

  // 每个振荡器的状态
  const [osc1, setOsc1] = useState({
    waveform: 'sine' as OscillatorType,
    detune: 0,
    volume: 0.5,
  });
  const [osc2, setOsc2] = useState({
    waveform: 'square' as OscillatorType,
    detune: 0,
    volume: 0.5,
  });
  const [osc3, setOsc3] = useState({
    waveform: 'sawtooth' as OscillatorType,
    detune: 0,
    volume: 0.5,
  });
  const [osc4, setOsc4] = useState({
    waveform: 'triangle' as OscillatorType,
    detune: 0,
    volume: 0.5,
  });

  return (
    <main className="px-4 py-4 flex flex-col justify-center items-center select-none">
      <h1 className={`text-6xl font-bold mb-8 text-center opacity-90 ${qwigley.className}`}>4xOsc Web Synth</h1>
      {!isReady ? (
        <button className="px-4 py-2 bg-blue-500 text-white rounded block mx-auto" onClick={resumeAudio}>
          Start Audio
        </button>
      ) : (
        <div className="max-w-4xl flex flex-col items-center gap-8">
          <div className="grid w-fit grid-cols-2 gap-4">
            {/* OSC 1 */}
            <div className="space-y-4 p-4 rounded-lg px-8">
              <h2 className="text-center">OSC 1</h2>
              <div className="flex gap-4 justify-center">
                <Knob
                  value={osc1.volume}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Volume"
                  onChange={(value) => {
                    setOsc1((prev) => ({ ...prev, volume: value }));
                    setOscillatorParams(1, { volume: value });
                  }}
                />
                <Knob
                  value={osc1.detune}
                  min={-1200}
                  max={1200}
                  step={1}
                  label="Detune"
                  onChange={(value) => {
                    setOsc1((prev) => ({ ...prev, detune: value }));
                    setOscillatorParams(1, { detune: value });
                  }}
                />
              </div>
              <WaveformSelector
                value={osc1.waveform}
                onChange={(waveform) => {
                  setOsc1((prev) => ({ ...prev, waveform }));
                  setOscillatorParams(1, { waveform });
                }}
              />
            </div>

            {/* OSC 2 */}
            <div className="space-y-4 p-4 rounded-lg px-8">
              <h2 className="text-center">OSC 2</h2>
              <div className="flex gap-4 justify-center">
                <Knob
                  value={osc2.volume}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Volume"
                  onChange={(value) => {
                    setOsc2((prev) => ({ ...prev, volume: value }));
                    setOscillatorParams(2, { volume: value });
                  }}
                />
                <Knob
                  value={osc2.detune}
                  min={-1200}
                  max={1200}
                  step={1}
                  label="Detune"
                  onChange={(value) => {
                    setOsc2((prev) => ({ ...prev, detune: value }));
                    setOscillatorParams(2, { detune: value });
                  }}
                />
              </div>
              <WaveformSelector
                value={osc2.waveform}
                onChange={(waveform) => {
                  setOsc2((prev) => ({ ...prev, waveform }));
                  setOscillatorParams(2, { waveform });
                }}
              />
            </div>

            {/* OSC 3 */}
            <div className="space-y-4 p-4 rounded-lg px-8">
              <h2 className="text-center">OSC 3</h2>
              <div className="flex gap-4 justify-center">
                <Knob
                  value={osc3.volume}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Volume"
                  onChange={(value) => {
                    setOsc3((prev) => ({ ...prev, volume: value }));
                    setOscillatorParams(3, { volume: value });
                  }}
                />
                <Knob
                  value={osc3.detune}
                  min={-1200}
                  max={1200}
                  step={1}
                  label="Detune"
                  onChange={(value) => {
                    setOsc3((prev) => ({ ...prev, detune: value }));
                    setOscillatorParams(3, { detune: value });
                  }}
                />
              </div>
              <WaveformSelector
                value={osc3.waveform}
                onChange={(waveform) => {
                  setOsc3((prev) => ({ ...prev, waveform }));
                  setOscillatorParams(3, { waveform });
                }}
              />
            </div>

            {/* OSC 4 */}
            <div className="space-y-4 p-4 rounded-lg px-8">
              <h2 className="text-center">OSC 4</h2>
              <div className="flex gap-4 justify-center">
                <Knob
                  value={osc4.volume}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Volume"
                  onChange={(value) => {
                    setOsc4((prev) => ({ ...prev, volume: value }));
                    setOscillatorParams(4, { volume: value });
                  }}
                />
                <Knob
                  value={osc4.detune}
                  min={-1200}
                  max={1200}
                  step={1}
                  label="Detune"
                  onChange={(value) => {
                    setOsc4((prev) => ({ ...prev, detune: value }));
                    setOscillatorParams(4, { detune: value });
                  }}
                />
              </div>
              <WaveformSelector
                value={osc4.waveform}
                onChange={(waveform) => {
                  setOsc4((prev) => ({ ...prev, waveform }));
                  setOscillatorParams(4, { waveform });
                }}
              />
            </div>
          </div>

          <div className="w-full flex justify-center px-8">
            <Keyboard onNoteOn={noteOn} onNoteOff={noteOff} />
          </div>
        </div>
      )}
    </main>
  );
}
