const INTERVAL_NAMES = [
  "Unison",
  "Minor Second",
  "Major Second",
  "Minor Third",
  "Major Third",
  "Perfect Fourth",
  "Tritone",
  "Perfect Fifth",
  "Minor Sixth",
  "Major Sixth",
  "Minor Seventh",
  "Major Seventh",
];

/** Semitones between two frequencies (can be negative; freqB relative to freqA). */
export function semitonesBetween(freqA, freqB) {
  return 12 * Math.log2(freqB / freqA);
}

/**
 * describeInterval(freqA, freqB)
 *
 * What it does: names the musical interval between two frequencies and
 * reports its frequency ratio — e.g. C4 → E4 is a Major Third, 4
 * semitones, ratio ≈ 1.2599.
 *
 * Input: two frequencies in Hz (order doesn't matter — the lower one is
 * always treated as the base).
 * Output: { semitones, name, ratio, cents } where `semitones` is the
 * rounded distance, `cents` is how far the *actual* frequencies deviate
 * from that exact semitone count (for non-12-TET / free-frequency tones),
 * and `ratio` is high/low as a plain number.
 */
export function describeInterval(freqA, freqB) {
  const low = Math.min(freqA, freqB);
  const high = Math.max(freqA, freqB);
  const rawSemitones = semitonesBetween(low, high);
  const semitones = Math.round(rawSemitones);
  const octaves = Math.floor(semitones / 12);
  const withinOctave = ((semitones % 12) + 12) % 12;

  let name;
  if (semitones === 0) {
    name = "Unison";
  } else if (withinOctave === 0 && octaves > 0) {
    name = octaves > 1 ? `Octave (x${octaves})` : "Octave";
  } else {
    name = INTERVAL_NAMES[withinOctave];
  }

  return {
    semitones,
    name,
    ratio: high / low,
    cents: Math.round((rawSemitones - semitones) * 100),
  };
}

// Simple just-intonation ratios (reduced to one octave, i.e. within [1,2))
// that read as consonant: unison/octave, perfect 5th (3:2), perfect 4th
// (4:3), major/minor 3rd (5:4, 6:5), major/minor 6th (5:3, 8:5).
const CONSONANT_RATIOS = [1, 1.5, 4 / 3, 1.25, 1.2, 5 / 3, 1.6];
const CONSONANT_TOLERANCE = 0.02;

// Semitone classes (mod 12) that read as dissonant when no simple ratio
// matches closely: minor/major 2nd, tritone, minor/major 7th.
const DISSONANT_SEMITONE_CLASSES = new Set([1, 2, 6, 10, 11]);

function reduceToOneOctave(ratio) {
  let r = ratio;
  while (r >= 2) r /= 2;
  while (r < 1) r *= 2;
  return r;
}

/**
 * classifyConsonance(freqA, freqB)
 *
 * A simple, approximate consonance/dissonance estimate for a pair of
 * frequencies, based purely on how close their ratio is to a handful of
 * simple just-intonation ratios (octave-reduced). This is NOT a model of
 * human perception — it's a rough, explicitly-labeled approximation, as
 * the brief asks for (section 15).
 *
 * Output: 'consonant' | 'neutral' | 'dissonant'.
 */
export function classifyConsonance(freqA, freqB) {
  const { semitones, ratio } = describeInterval(freqA, freqB);
  const withinOctave = ((semitones % 12) + 12) % 12;
  const reduced = reduceToOneOctave(ratio);
  const closestDistance = Math.min(
    ...CONSONANT_RATIOS.map((r) => Math.abs(reduced - r)),
  );

  if (closestDistance < CONSONANT_TOLERANCE) return "consonant";
  if (DISSONANT_SEMITONE_CLASSES.has(withinOctave)) return "dissonant";
  return "neutral";
}

/**
 * classifyOverallConsonance(frequencies)
 *
 * For 3+ tones, classifies every pair and returns the single worst
 * (most dissonant) result — a chord with even one clashing pair of
 * tones tends to read as dissonant overall, so this errs toward that.
 * Returns null when fewer than two frequencies are given.
 */
export function classifyOverallConsonance(frequencies) {
  if (frequencies.length < 2) return null;
  const rank = { dissonant: 0, neutral: 1, consonant: 2 };
  let worst = "consonant";
  for (let i = 0; i < frequencies.length; i += 1) {
    for (let j = i + 1; j < frequencies.length; j += 1) {
      const c = classifyConsonance(frequencies[i], frequencies[j]);
      if (rank[c] < rank[worst]) worst = c;
    }
  }
  return worst;
}
