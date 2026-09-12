import { NOTE_NAMES } from "./notes";
import { frequencyFromNote } from "./frequencies";

/**
 * Tone shape kept in React state (see App.jsx):
 *   { id, name, mode, note, octave, freeFrequency, amplitude, color, enabled }
 *
 * `mode` is 'note' (pitch comes from note+octave, recalculated whenever A4
 * changes) or 'free' (pitch is `freeFrequency`, entered directly and
 * unaffected by A4). Only one of {note+octave} / {freeFrequency} is "live"
 * at a time, but both are kept so switching modes doesn't lose the other
 * representation. The actual sounding frequency is always derived with
 * `getToneFrequency` below rather than stored redundantly, so it can never
 * drift out of sync with A4 or the note.
 */

// One color per tone slot. Defined as literal hex values (not CSS custom
// properties) because <canvas> drawing needs real color strings.
export const TONE_COLORS = [
  "#4fd1c5",
  "#f472b6",
  "#a78bfa",
  "#fbbf24",
  "#60a5fa",
  "#fb923c",
  "#34d399",
  "#f87171",
];

export const MAX_TONES = TONE_COLORS.length;

export function getToneFrequency(tone, a4) {
  return tone.mode === "free"
    ? tone.freeFrequency
    : frequencyFromNote(tone.note, tone.octave, a4);
}

export function getToneLabel(tone) {
  if (tone.name && tone.name.trim()) return tone.name.trim();
  return tone.mode === "free" ? "Free" : `${tone.note}${tone.octave}`;
}

export function generateToneId() {
  return `tone-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nextAvailableColor(existingTones) {
  const used = new Set(existingTones.map((t) => t.color));
  const free = TONE_COLORS.find((c) => !used.has(c));
  return free ?? TONE_COLORS[existingTones.length % TONE_COLORS.length];
}

/**
 * Finds the next free note+octave starting at C4 and walking up the
 * chromatic scale, so a newly added tone never silently doubles a pitch
 * that's already in use. Only considers tones currently in "note" mode.
 */
export function nextAvailableNote(existingTones) {
  const used = new Set(
    existingTones
      .filter((t) => t.mode === "note")
      .map((t) => `${t.note}${t.octave}`),
  );

  let octave = 4;
  let index = NOTE_NAMES.indexOf("C");
  for (let step = 0; step < NOTE_NAMES.length * 8; step += 1) {
    const note = NOTE_NAMES[index];
    const key = `${note}${octave}`;
    if (!used.has(key)) return { note, octave };
    index += 1;
    if (index >= NOTE_NAMES.length) {
      index = 0;
      octave += 1;
    }
  }
  return { note: "C", octave: 4 };
}

/** Builds a new tone for "+ Add Tone": next free note from C4, amplitude
 *  0.7, next unused palette color, enabled. */
export function createDefaultTone(existingTones) {
  const { note, octave } = nextAvailableNote(existingTones);
  return {
    id: generateToneId(),
    name: "",
    mode: "note",
    note,
    octave,
    freeFrequency: frequencyFromNote(note, octave),
    amplitude: 0.7,
    color: nextAvailableColor(existingTones),
    enabled: true,
  };
}
