import { FC } from 'react';
import { OscillatorType } from '@/types/synth';
import clsx from 'clsx';
import { SineWaveIcon } from '@/icons/sine-wave';
import { SquareWaveIcon } from '@/icons/square-wave';
import { SawtoothWaveIcon } from '@/icons/sawtooth-wave';
import { TriangleWaveIcon } from '@/icons/triangle-wave';

interface WaveformSelectorProps {
  value: OscillatorType;
  onChange: (value: OscillatorType) => void;
}

const WAVEFORM_COMPONENTS = {
  sine: SineWaveIcon,
  square: SquareWaveIcon,
  sawtooth: SawtoothWaveIcon,
  triangle: TriangleWaveIcon,
};

export const WaveformSelector: FC<WaveformSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 items-center justify-center">
      {(Object.keys(WAVEFORM_COMPONENTS) as OscillatorType[]).map((type) => {
        const WaveIcon = WAVEFORM_COMPONENTS[type];
        return (
          <button
            key={type}
            className={clsx(
              'w-10 h-10 rounded-md transition-all duration-150',
              'border border-gray-700',
              value === type ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700/50'
            )}
            onClick={() => onChange(type)}
          >
            <WaveIcon className={clsx('w-full h-full p-1.5', value === type ? 'text-white' : 'text-gray-400')} />
          </button>
        );
      })}
    </div>
  );
};
