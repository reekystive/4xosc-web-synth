import { FC, useEffect, useState, useCallback, MouseEvent, TouchEvent } from 'react';
import clsx from 'clsx';

type NoteType = 'white' | 'black';

interface Note {
  id: string;
  note: string;
  keys: string[];
  midiNote: number;
  type: NoteType;
}

interface KeyboardProps {
  onNoteOn?: (midiNote: number) => void;
  onNoteOff?: (midiNote: number) => void;
}

interface PianoKeyProps {
  note: Note;
  isActive: boolean;
  onNoteOn: (midiNote: number) => void;
  onNoteOff: (midiNote: number) => void;
}

const NOTES: readonly Note[] = [
  // 低八度 (从 Z 开始)
  { id: 'C3', note: 'C3', keys: ['KeyZ'], midiNote: 60, type: 'white' }, // Z
  { id: 'C#3', note: 'C#3', keys: ['KeyS'], midiNote: 61, type: 'black' }, // S
  { id: 'D3', note: 'D3', keys: ['KeyX'], midiNote: 62, type: 'white' }, // X
  { id: 'D#3', note: 'D#3', keys: ['KeyD'], midiNote: 63, type: 'black' }, // D
  { id: 'E3', note: 'E3', keys: ['KeyC'], midiNote: 64, type: 'white' }, // C
  { id: 'F3', note: 'F3', keys: ['KeyV'], midiNote: 65, type: 'white' }, // V
  { id: 'F#3', note: 'F#3', keys: ['KeyG'], midiNote: 66, type: 'black' }, // G
  { id: 'G3', note: 'G3', keys: ['KeyB'], midiNote: 67, type: 'white' }, // B
  { id: 'G#3', note: 'G#3', keys: ['KeyH'], midiNote: 68, type: 'black' }, // H
  { id: 'A3', note: 'A3', keys: ['KeyN'], midiNote: 69, type: 'white' }, // N
  { id: 'A#3', note: 'A#3', keys: ['KeyJ'], midiNote: 70, type: 'black' }, // J
  { id: 'B3', note: 'B3', keys: ['KeyM'], midiNote: 71, type: 'white' }, // M

  // 高八度 (从 Q 开始)
  { id: 'C4', note: 'C4', keys: ['KeyQ', 'Comma'], midiNote: 72, type: 'white' }, // Q, ,
  { id: 'C#4', note: 'C#4', keys: ['Digit2', 'KeyL'], midiNote: 73, type: 'black' }, // 2, L
  { id: 'D4', note: 'D4', keys: ['KeyW', 'Period'], midiNote: 74, type: 'white' }, // W, .
  { id: 'D#4', note: 'D#4', keys: ['Digit3', 'Semicolon'], midiNote: 75, type: 'black' }, // 3, ;
  { id: 'E4', note: 'E4', keys: ['KeyE', 'Slash'], midiNote: 76, type: 'white' }, // E, /
  { id: 'F4', note: 'F4', keys: ['KeyR'], midiNote: 77, type: 'white' }, // R
  { id: 'F#4', note: 'F#4', keys: ['Digit5'], midiNote: 78, type: 'black' }, // 5
  { id: 'G4', note: 'G4', keys: ['KeyT'], midiNote: 79, type: 'white' }, // T
  { id: 'G#4', note: 'G#4', keys: ['Digit6'], midiNote: 80, type: 'black' }, // 6
  { id: 'A4', note: 'A4', keys: ['KeyY'], midiNote: 81, type: 'white' }, // Y
  { id: 'A#4', note: 'A#4', keys: ['Digit7'], midiNote: 82, type: 'black' }, // 7
  { id: 'B4', note: 'B4', keys: ['KeyU'], midiNote: 83, type: 'white' }, // U

  // 再高八度 (从 I 开始)
  { id: 'C5', note: 'C5', keys: ['KeyI'], midiNote: 84, type: 'white' }, // I
  { id: 'C#5', note: 'C#5', keys: ['Digit9'], midiNote: 85, type: 'black' }, // 9
  { id: 'D5', note: 'D5', keys: ['KeyO'], midiNote: 86, type: 'white' }, // O
  { id: 'D#5', note: 'D#5', keys: ['Digit0'], midiNote: 87, type: 'black' }, // 0
  { id: 'E5', note: 'E5', keys: ['KeyP'], midiNote: 88, type: 'white' }, // P
  { id: 'F5', note: 'F5', keys: ['BracketLeft'], midiNote: 89, type: 'white' }, // [
  { id: 'F#5', note: 'F#5', keys: ['Equal'], midiNote: 90, type: 'black' }, // =
  { id: 'G5', note: 'G5', keys: ['BracketRight'], midiNote: 91, type: 'white' }, // ]
];

// 键盘显示映射
const KEY_DISPLAY_MAP: Record<string, string> = {
  KeyZ: 'Z',
  KeyS: 'S',
  KeyX: 'X',
  KeyD: 'D',
  KeyC: 'C',
  KeyV: 'V',
  KeyG: 'G',
  KeyB: 'B',
  KeyH: 'H',
  KeyN: 'N',
  KeyJ: 'J',
  KeyM: 'M',
  KeyQ: 'Q',
  Comma: ',',
  Digit2: '2',
  KeyL: 'L',
  KeyW: 'W',
  Period: '.',
  Digit3: '3',
  Semicolon: ';',
  KeyE: 'E',
  Slash: '/',
  KeyR: 'R',
  Digit5: '5',
  KeyT: 'T',
  Digit6: '6',
  KeyY: 'Y',
  Digit7: '7',
  KeyU: 'U',
  KeyI: 'I',
  Digit9: '9',
  KeyO: 'O',
  Digit0: '0',
  KeyP: 'P',
  BracketLeft: '[',
  Equal: '=',
  BracketRight: ']',
};

const getBlackKeyPosition = (note: Note): number => {
  const noteIndex = NOTES.findIndex((n) => n.id === note.id);
  const whiteKeys = NOTES.filter((n) => n.type === 'white');
  const whiteKeyWidth = 100 / whiteKeys.length;

  // 计算当前黑键前面的白键数量
  const previousWhiteKeys = NOTES.slice(0, noteIndex).filter((n) => n.type === 'white').length;

  // 黑键应该位于前一个白键的右侧，偏移约 70%
  return previousWhiteKeys * whiteKeyWidth - whiteKeyWidth * 0.3;
};

const PianoKey: FC<PianoKeyProps> = ({ note, isActive, onNoteOn, onNoteOff }) => {
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    onNoteOn(note.midiNote);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    onNoteOff(note.midiNote);
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    onNoteOn(note.midiNote);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    onNoteOff(note.midiNote);
  };

  const whiteKeys = NOTES.filter((n) => n.type === 'white');

  if (note.type === 'black') {
    return (
      <div
        className={clsx(
          'absolute top-0 h-24 bg-black',
          'rounded-b transition-colors duration-75 ease-out z-10',
          isActive && 'bg-gray-800'
        )}
        style={{
          left: `${getBlackKeyPosition(note)}%`,
          width: '1.5rem',
          pointerEvents: 'auto',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isActive && onNoteOff(note.midiNote)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.6em] text-white opacity-50">
          {KEY_DISPLAY_MAP[note.keys[0]]}
        </span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative h-40 w-12 border border-gray-600',
        'bg-gray-100 rounded-b transition-colors duration-75 ease-out',
        isActive && 'bg-gray-400'
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => isActive && onNoteOff(note.midiNote)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-50">
        {KEY_DISPLAY_MAP[note.keys[0]]}
      </span>
    </div>
  );
};

export const Keyboard: FC<KeyboardProps> = ({ onNoteOn, onNoteOff }) => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  const handleNoteOn = useCallback(
    (midiNote: number) => {
      setActiveNotes((prev) => new Set([...prev, midiNote]));
      console.log('midi on, note: %o', midiNote);
      onNoteOn?.(midiNote);
    },
    [onNoteOn]
  );

  const handleNoteOff = useCallback(
    (midiNote: number) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(midiNote);
        return next;
      });
      console.log('midi off, note: %o', midiNote);
      onNoteOff?.(midiNote);
    },
    [onNoteOff]
  );

  useEffect(() => {
    const keyMap = new Map<string, number>();
    NOTES.forEach((note) => {
      note.keys.forEach((key) => {
        keyMap.set(key, note.midiNote);
      });
    });
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.shiftKey || e.repeat) {
        return;
      }
      console.log('keydown: %o', e);
      const code = e.code;
      const midiNote = keyMap.get(code);

      if (midiNote && !pressedKeys.has(code)) {
        pressedKeys.add(code);
        handleNoteOn(midiNote);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      console.log('keyup: %o', e);
      const code = e.code;
      const midiNote = keyMap.get(code);

      if (midiNote) {
        pressedKeys.delete(code);
        handleNoteOff(midiNote);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  const whiteKeys = NOTES.filter((note) => note.type === 'white');
  const blackKeys = NOTES.filter((note) => note.type === 'black');

  return (
    <div className="relative select-none h-40 overflow-hidden rounded-md isolate">
      <div className="flex relative h-full">
        {whiteKeys.map((note) => (
          <PianoKey
            key={note.id}
            note={note}
            isActive={activeNotes.has(note.midiNote)}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
          />
        ))}
      </div>
      <div className="absolute top-0 left-0 h-full w-full pointer-events-none">
        {blackKeys.map((note) => (
          <PianoKey
            key={note.id}
            note={note}
            isActive={activeNotes.has(note.midiNote)}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
          />
        ))}
      </div>
    </div>
  );
};
