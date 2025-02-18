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
      <h1 className={`text-6xl font-bold mb-8 text-center opacity-90 ${qwigley.className}`}>4xOsc Web Synth</h1>
      {!isReady ? (
        <button className="px-4 py-2 bg-blue-500 text-white rounded block mx-auto" onClick={resumeAudio}>
          Start Audio
        </button>
      ) : (
        <div className="max-w-4xl flex flex-col items-center gap-8">
          <div className="flex flex-row items-center gap-8">
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
      )}
    </main>
  );
};

export default Home;
