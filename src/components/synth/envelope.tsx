import { FC } from 'react';
import { Knob } from './knob';
import { EnvelopeVisualizer } from '@/components/synth/envelope-visualizer';
import { FilterMode } from '@/audio/synth/voice';

interface EnvelopeProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  type?: 'amplitude' | 'filter';
  filterMode?: FilterMode;
  cutoffFreq?: number;
  onFilterModeChange?: (mode: FilterMode) => void;
  onCutoffFreqChange?: (freq: number) => void;
}

function freqToNormalized(freq: number): number {
  const minFreq = 20;
  const maxFreq = 20000;
  return (Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq));
}

function normalizedToFreq(normalized: number): number {
  const minFreq = 20;
  const maxFreq = 20000;
  return Math.pow(10, Math.log10(minFreq) + normalized * (Math.log10(maxFreq) - Math.log10(minFreq)));
}

export const Envelope: FC<EnvelopeProps> = ({
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  type = 'amplitude',
  filterMode = 'none',
  cutoffFreq = 20000,
  onFilterModeChange,
  onCutoffFreqChange,
}) => {
  return (
    <div className="p-4">
      <h2 className="text-center mb-2">{type === 'amplitude' ? 'Amplitude' : 'Filter'} Envelope</h2>
      <div className="w-[300px] aspect-[2.35/1] box-content rounded-md border-[1px] overflow-hidden border-gray-800 bg-gray-900">
        <EnvelopeVisualizer
          className="w-full h-full text-white opacity-50"
          attack={attack}
          decay={decay}
          sustain={sustain}
          release={release}
        />
      </div>
      <div className="flex flex-row justify-between mt-4">
        <Knob
          size="small"
          value={attack}
          min={0}
          max={2}
          step={0.01}
          label="Attack"
          formatValue={(v) => `${v.toFixed(2)}s`}
          onChange={onAttackChange}
        />
        <Knob
          size="small"
          value={decay}
          min={0}
          max={2}
          step={0.01}
          label="Decay"
          formatValue={(v) => `${v.toFixed(2)}s`}
          onChange={onDecayChange}
        />
        <Knob
          size="small"
          value={sustain}
          min={0}
          max={1}
          step={0.01}
          label="Sustain"
          formatValue={(v) => `${Math.round(v * 100)}%`}
          onChange={onSustainChange}
        />
        <Knob
          size="small"
          value={release}
          min={0}
          max={2}
          step={0.01}
          label="Release"
          formatValue={(v) => `${v.toFixed(2)}s`}
          onChange={onReleaseChange}
        />
      </div>
      {type === 'filter' && (
        <div className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex w-full bg-gray-800 rounded-lg p-1">
                <button
                  className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors ${
                    filterMode === 'none' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => onFilterModeChange?.('none')}
                >
                  No Filter
                </button>
                <button
                  className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors ${
                    filterMode === 'lowpass' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => onFilterModeChange?.('lowpass')}
                >
                  Low Pass
                </button>
                <button
                  className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors ${
                    filterMode === 'highpass' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => onFilterModeChange?.('highpass')}
                >
                  High Pass
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Knob
                size="small"
                value={freqToNormalized(cutoffFreq)}
                min={0}
                max={1}
                step={0.01}
                label="Cutoff Freq"
                formatValue={(v) => `${Math.round(normalizedToFreq(v))}Hz`}
                onChange={(v) => onCutoffFreqChange?.(normalizedToFreq(v))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
