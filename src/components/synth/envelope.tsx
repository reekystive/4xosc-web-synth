import { FC } from 'react';
import { Knob } from './knob';
import { EnvelopeVisualizer } from '@/components/synth/envelope-visualizer';

interface EnvelopeProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
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
}) => {
  return (
    <div className="p-4">
      <h2 className="text-center mb-2">Envelope</h2>
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
        <Knob size="small" value={attack} min={0} max={2} step={0.01} label="Attack" onChange={onAttackChange} />
        <Knob size="small" value={decay} min={0} max={2} step={0.01} label="Decay" onChange={onDecayChange} />
        <Knob size="small" value={sustain} min={0} max={1} step={0.01} label="Sustain" onChange={onSustainChange} />
        <Knob size="small" value={release} min={0} max={2} step={0.01} label="Release" onChange={onReleaseChange} />
      </div>
    </div>
  );
};
