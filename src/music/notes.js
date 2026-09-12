/**
 * The 12 pitch classes of 12-tone equal temperament (12-TET), in the order
 * used throughout the app — index 0 is C. Every other module in `music/`
 * that needs to name a pitch (frequencies, chord detection, UI selects)
 * builds on this ordering.
 */
export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Scientific pitch notation range offered in the note/octave selects.
// A4 = 440 Hz sits in the middle of this range; C4 is "middle C".
export const MIN_OCTAVE = 0;
export const MAX_OCTAVE = 8;

export const OCTAVES = Array.from(
  { length: MAX_OCTAVE - MIN_OCTAVE + 1 },
  (_, i) => MIN_OCTAVE + i,
);
