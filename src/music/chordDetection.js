import { nearestNoteFromFrequency } from "./frequencies";

// Interval sets (in semitones from an assumed root) for each recognized
// chord quality. Covers basic triads plus common seventh chords, per the
// brief's "tríadas + acordes de séptima" scope.
const CHORD_TEMPLATES = [
  { intervals: [0, 4, 7], quality: "Major" },
  { intervals: [0, 3, 7], quality: "Minor" },
  { intervals: [0, 3, 6], quality: "Diminished" },
  { intervals: [0, 4, 8], quality: "Augmented" },
  { intervals: [0, 4, 7, 10], quality: "Dominant 7th" },
  { intervals: [0, 4, 7, 11], quality: "Major 7th" },
  { intervals: [0, 3, 7, 10], quality: "Minor 7th" },
  { intervals: [0, 3, 6, 9], quality: "Diminished 7th" },
  { intervals: [0, 3, 6, 10], quality: "Half-Diminished 7th" },
];

/**
 * detectChord(frequencies, a4)
 *
 * What it does: tries to identify a chord from a set of tone frequencies.
 *
 * How: each frequency is snapped to its nearest 12-TET pitch class (0-11,
 * octave ignored) and deduplicated. Then, treating each present pitch
 * class as a possible root in turn, the intervals to the other pitch
 * classes are compared against a table of common triads/7th chords. Every
 * root that produces an exact match is returned — some chords (e.g.
 * diminished 7th) are symmetric and genuinely match under more than one
 * root, which is real ambiguity, not a bug, so it's surfaced as multiple
 * "possible interpretations" rather than picked arbitrarily.
 *
 * Input: an array of frequencies in Hz, and the current A4 reference
 * (needed to snap frequencies to pitch classes consistently with
 * whatever tuning the user has set).
 * Output: { matches, pitchClasses } — `matches` is an array of
 * { root, quality } (root is a NOTE_NAMES index), `pitchClasses` is the
 * sorted, deduplicated set of pitch classes actually present.
 */
export function detectChord(frequencies, a4) {
  const pitchClasses = [
    ...new Set(frequencies.map((f) => nearestNoteFromFrequency(f, a4).pitchClass)),
  ].sort((a, b) => a - b);

  if (pitchClasses.length < 2) {
    return { matches: [], pitchClasses };
  }

  const matches = [];
  for (const rootPc of pitchClasses) {
    const relativeSet = new Set(pitchClasses.map((pc) => ((pc - rootPc) % 12 + 12) % 12));
    for (const template of CHORD_TEMPLATES) {
      const templateSet = template.intervals;
      const sameSize = relativeSet.size === templateSet.length;
      const sameMembers = sameSize && templateSet.every((v) => relativeSet.has(v));
      if (sameMembers) {
        matches.push({ root: rootPc, quality: template.quality });
      }
    }
  }

  return { matches, pitchClasses };
}
