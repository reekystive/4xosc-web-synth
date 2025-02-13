import { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';

type Note = {
  note: string;
  key: string;
  midiNote: number;
  black?: boolean;
};

const NOTES: readonly Note[] = [
  { note: 'C', key: 'a', midiNote: 60 },
  { note: 'C#', key: 'w', midiNote: 61, black: true },
  { note: 'D', key: 's', midiNote: 62 },
  { note: 'D#', key: 'e', midiNote: 63, black: true },
  { note: 'E', key: 'd', midiNote: 64 },
  { note: 'F', key: 'f', midiNote: 65 },
  { note: 'F#', key: 't', midiNote: 66, black: true },
  { note: 'G', key: 'g', midiNote: 67 },
  { note: 'G#', key: 'y', midiNote: 68, black: true },
  { note: 'A', key: 'h', midiNote: 69 },
  { note: 'A#', key: 'u', midiNote: 70, black: true },
  { note: 'B', key: 'j', midiNote: 71 },
  { note: 'C2', key: 'k', midiNote: 72 },
  { note: 'C#2', key: 'o', midiNote: 73, black: true },
  { note: 'D2', key: 'l', midiNote: 74 },
  { note: 'D#2', key: 'p', midiNote: 75, black: true },
  { note: 'E2', key: ';', midiNote: 76 },
  { note: 'F2', key: "'", midiNote: 77 },
];

interface KeyboardProps {
  onNoteOn?: (n: number) => void;
  onNoteOff?: (n: number) => void;
}

export function Keyboard({ onNoteOn, onNoteOff }: KeyboardProps) {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  // 分别渲染白键和黑键，以确保黑键总是在白键上方
  const whiteKeys = NOTES.filter((note) => !note.black);
  const blackKeys = NOTES.filter((note) => note.black);

  // 添加计算黑键位置的函数
  const getBlackKeyPosition = (index: number): number => {
    const blackKeyNote = blackKeys[index];
    if (!blackKeyNote) return 0;

    const noteIndex = NOTES.findIndex(
      (note) => note.midiNote === blackKeyNote.midiNote
    );

    const previousWhiteKeys = NOTES.slice(0, noteIndex).filter(
      (note) => !note.black
    ).length;

    const whiteKeyWidth = 100 / whiteKeys.length;

    // 先计算基础位置（前一个白键的位置），然后向左移动一个半白键宽度
    return (previousWhiteKeys - 1.5) * whiteKeyWidth + whiteKeyWidth * 1.5;
  };

  const handleNoteOn = useCallback(
    (midiNote: number) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(midiNote);
        return next;
      });
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
      onNoteOff?.(midiNote);
    },
    [onNoteOff]
  );

  useEffect(() => {
    const keyMap = new Map(NOTES.map((note) => [note.key, note.midiNote]));
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() as Note['key'];
      const midiNote = keyMap.get(key);

      if (midiNote && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        handleNoteOn(midiNote);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() as Note['key'];
      const midiNote = keyMap.get(key);

      if (midiNote) {
        pressedKeys.delete(key);
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

  return (
    <div className="relative select-none">
      {/* 白键容器 */}
      <div className="flex relative">
        {whiteKeys.map(({ note, midiNote, key }) => (
          <div
            key={note}
            className={clsx(
              'piano-key', // 移除白键的 z-10
              activeNotes.has(midiNote) && 'piano-key-active'
            )}
            onMouseDown={() => handleNoteOn(midiNote)}
            onMouseUp={() => handleNoteOff(midiNote)}
            onMouseLeave={() =>
              activeNotes.has(midiNote) && handleNoteOff(midiNote)
            }
            onTouchStart={(e) => {
              e.preventDefault();
              handleNoteOn(midiNote);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleNoteOff(midiNote);
            }}
          >
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-black dark:text-white">
              {key.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      {/* 黑键容器设置更小的宽度，只覆盖黑键区域 */}
      <div className="absolute top-0 left-0 h-full z-20 w-full">
        {blackKeys.map(({ note, midiNote, key }, index) => {
          const position = `${getBlackKeyPosition(index)}%`;

          return (
            <div
              key={note}
              style={{
                position: 'absolute',
                left: position,
                pointerEvents: 'auto', // 确保黑键可以点击
                width: '1.5rem', // 直接设置黑键宽度
              }}
              className={clsx(
                'piano-key-black',
                activeNotes.has(midiNote) && 'piano-key-black-active'
              )}
              onMouseDown={() => handleNoteOn(midiNote)}
              onMouseUp={() => handleNoteOff(midiNote)}
              onMouseLeave={() =>
                activeNotes.has(midiNote) && handleNoteOff(midiNote)
              }
              onTouchStart={(e) => {
                e.preventDefault();
                handleNoteOn(midiNote);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNoteOff(midiNote);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
