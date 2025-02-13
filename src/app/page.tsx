'use client';

import { Keyboard } from '@/components/synth/keyboard';
import { Knob } from '@/components/synth/knob';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { useSynth } from '@/hooks/use-synth';
import { useState } from 'react';

export default function Home() {
  const { engine, isReady, resumeAudio } = useAudioEngine();
  const { noteOn, noteOff, setModulatorRatio, setModulationIndex } =
    useSynth(engine);
  const [ratio, setRatio] = useState(1);
  const [index, setIndex] = useState(1);

  return (
    <main className="min-h-screen p-8 w-full">
      <h1 className="text-3xl font-bold mb-8 text-center">
        WebAudio Simple Synth
      </h1>
      {!isReady ? (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded block mx-auto"
          onClick={resumeAudio}
        >
          Start Audio
        </button>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex gap-8 justify-center p-4 rounded-lg">
            <Knob
              value={ratio}
              min={0.1}
              max={8}
              step={0.1}
              label="FM Ratio"
              onChange={(value) => {
                setRatio(value);
                setModulatorRatio(value);
              }}
            />
            <Knob
              value={index}
              min={0}
              max={10}
              step={0.1}
              label="FM Index"
              color="#8b5cf6"
              onChange={(value) => {
                setIndex(value);
                setModulationIndex(value);
              }}
            />
          </div>
          <div className="w-full flex justify-center px-8">
            <Keyboard onNoteOn={noteOn} onNoteOff={noteOff} />
          </div>
        </div>
      )}
    </main>
  );
}
