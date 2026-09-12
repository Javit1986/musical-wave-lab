import { NOTE_NAMES } from "./notes";

/** Default reference pitch: A4 = 440 Hz, the modern concert-pitch standard. */
export const DEFAULT_A4 = 440;

function noteIndex(note) {
  const idx = NOTE_NAMES.indexOf(note);
  if (idx === -1) {
    throw new Error(`Unknown note name: ${note}`);
  }
  return idx;
}

/**
 * frequencyFromNote(note, octave, a4)
 *
 * What it does: converts a note name + octave into a frequency in Hz,
 * using 12-tone equal temperament (12-TET).
 *
 * Why it exists: every other frequency in the app (a tone's pitch, the
 * wave that gets drawn and played) ultimately comes from a note the user
 * picked, so this is the one place that formula lives.
 *
 * Formula: f = a4 * 2^(n/12), where `n` is how many semitones the note
 * is away from A4 (positive above A4, negative below). Each semitone is
 * one twelfth of an octave, and each octave doubles the frequency — that
 * "12th root of 2 per semitone" is the definition of equal temperament.
 *
 * Input: a note name ("C", "C#", …, "B"), an octave number (scientific
 * pitch notation, so A4 = 440 Hz, C4 = middle C), and the reference A4
 * frequency in Hz (defaults to 440).
 * Output: the frequency in Hz as a float.
 *
 * Example: frequencyFromNote('A', 4) === 440
 *          frequencyFromNote('C', 4) ≈ 261.63
 */
export function frequencyFromNote(note, octave, a4 = DEFAULT_A4) {
  const aIndex = noteIndex("A");
  const semitonesFromA4 = (octave - 4) * 12 + (noteIndex(note) - aIndex);
  return a4 * Math.pow(2, semitonesFromA4 / 12);
}

/**
 * nearestNoteFromFrequency(frequency, a4)
 *
 * The inverse of frequencyFromNote: given an arbitrary frequency (as
 * produced by "free frequency" mode, which doesn't have to land exactly
 * on a 12-TET note), finds the closest note and how far off it is.
 *
 * Input: a frequency in Hz and the reference A4.
 * Output: { note, octave, pitchClass, cents } — `pitchClass` is the note's
 * index in NOTE_NAMES (0-11), and `cents` is the deviation from that note
 * in hundredths of a semitone (0 = exact, ±50 = halfway to the neighbor).
 *
 * Used to label free-frequency tones ("≈ E4, +14 cents") and to snap
 * frequencies onto pitch classes for chord detection.
 */
export function nearestNoteFromFrequency(frequency, a4 = DEFAULT_A4) {
  const aIndex = noteIndex("A");
  const exactSemitones = 12 * Math.log2(frequency / a4);
  const roundedSemitones = Math.round(exactSemitones);
  const cents = Math.round((exactSemitones - roundedSemitones) * 100);
  const absoluteIndex = roundedSemitones + aIndex;
  const pitchClass = ((absoluteIndex % 12) + 12) % 12;
  const octave = 4 + Math.floor(absoluteIndex / 12);
  return { note: NOTE_NAMES[pitchClass], octave, cents, pitchClass };
}
