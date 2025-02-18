import { FC } from 'react';
import { Knob } from './knob';
import { WaveformSelector } from './waveform-selector';
import { OscillatorType } from '@/types/synth';

interface OscillatorParams {
  waveform: OscillatorType;
  detune: number;
  volume: number;
}

export type OscNumber = 1 | 2 | 3 | 4;

interface OscillatorProps {
  number: OscNumber;
  params: OscillatorParams;
  onParamsChange: (params: Partial<OscillatorParams>) => void;
}

export const Oscillator: FC<OscillatorProps> = ({ number, params, onParamsChange }) => {
  return (
    <div className="space-y-4 p-4 rounded-lg px-8">
      <h2 className="text-center">OSC {number}</h2>
      <div className="flex gap-4 justify-center">
        <Knob
          value={params.volume}
          min={0}
          max={1}
          step={0.01}
          label="Volume"
          formatValue={(v) => `${Math.round(v * 100)}%`}
          onChange={(value) => onParamsChange({ volume: value })}
        />
        <Knob
          value={params.detune}
          min={-1200}
          max={1200}
          step={1}
          label="Detune"
          formatValue={(v) => `${v > 0 ? '+' : ''}${Math.round(v)}ct`}
          onChange={(value) => onParamsChange({ detune: value })}
        />
      </div>
      <WaveformSelector value={params.waveform} onChange={(waveform) => onParamsChange({ waveform })} />
    </div>
  );
};
