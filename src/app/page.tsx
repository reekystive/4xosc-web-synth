'use client';

import { FC } from 'react';
import { Keyboard } from '@/components/synth/keyboard';
import { Envelope } from '@/components/synth/envelope';
import { Oscillator } from '@/components/synth/oscillator';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { useSynth } from '@/hooks/use-synth';
import { useSynthState, INITIAL_STATE } from '@/hooks/use-synth-state';
import { Qwigley } from 'next/font/google';

const qwigley = Qwigley({ weight: '400', subsets: ['latin'] });

const Home: FC = () => {
  const { engine, isReady, resumeAudio } = useAudioEngine();
  const { noteOn, noteOff, setOscillatorParams, setAmpEnvelope, setFilterEnvelope, setFilterMode } = useSynth(
    engine,
    INITIAL_STATE
  );
  const {
    oscillators,
    ampEnvelope,
    filterEnvelope,
    filterMode,
    cutoffFreq,
    handleOscParamsChange,
    handleAmpEnvelopeChange,
    handleFilterEnvelopeChange,
    handleFilterModeChange,
    handleCutoffFreqChange,
  } = useSynthState(setOscillatorParams, setAmpEnvelope, setFilterEnvelope, setFilterMode);

  return (
    <main className="px-4 py-4 flex flex-col justify-center items-center select-none">
      {!isReady ? (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center cursor-pointer z-50"
          onClick={resumeAudio}
        >
          <div className="text-white text-xl">Click anywhere to start</div>
        </div>
      ) : null}
      <h1 className={`text-6xl font-bold mb-8 text-center opacity-90 ${qwigley.className}`}>4xOsc Web Synth</h1>
      <div className="max-w-4xl flex flex-col items-center gap-8">
        <div className="flex flex-row items-center gap-8">
          <div className="flex flex-col gap-4">
            <div className="grid w-fit grid-cols-2 gap-4">
              {([1, 2, 3, 4] as const).map((number) => (
                <Oscillator
                  key={number}
                  number={number}
                  params={oscillators[`osc${number}` as keyof typeof oscillators]}
                  onParamsChange={(params) => handleOscParamsChange(number, params)}
                />
              ))}
            </div>
            <div
              className="text-gray-400 border-slate-500 opacity-20 text-xl
              ml-[30px] border-2 h-[180px] rounded-md flex items-center justify-center"
            >
              LFO Planned
            </div>
            <div className={`text-gray-400 opacity-20 text-4xl ml-[30px] ${qwigley.className}`}>
              Made by{' '}
              <a href="https://github.com/reekystive/4xosc-web-synth" target="_blank" className="text-gray-200">
                reekystive
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Envelope
              attack={ampEnvelope.attack}
              decay={ampEnvelope.decay}
              sustain={ampEnvelope.sustain}
              release={ampEnvelope.release}
              onAttackChange={(value) => handleAmpEnvelopeChange('attack', value)}
              onDecayChange={(value) => handleAmpEnvelopeChange('decay', value)}
              onSustainChange={(value) => handleAmpEnvelopeChange('sustain', value)}
              onReleaseChange={(value) => handleAmpEnvelopeChange('release', value)}
            />
            <Envelope
              type="filter"
              attack={filterEnvelope.attack}
              decay={filterEnvelope.decay}
              sustain={filterEnvelope.sustain}
              release={filterEnvelope.release}
              filterMode={filterMode}
              cutoffFreq={cutoffFreq}
              onAttackChange={(value) => handleFilterEnvelopeChange('attack', value)}
              onDecayChange={(value) => handleFilterEnvelopeChange('decay', value)}
              onSustainChange={(value) => handleFilterEnvelopeChange('sustain', value)}
              onReleaseChange={(value) => handleFilterEnvelopeChange('release', value)}
              onFilterModeChange={handleFilterModeChange}
              onCutoffFreqChange={handleCutoffFreqChange}
            />
          </div>
        </div>
        <Keyboard onNoteOn={noteOn} onNoteOff={noteOff} />
      </div>
    </main>
  );
};

export default Home;
