/**
 * sampleSineWave({ frequency, amplitude }, durationSeconds, sampleCount)
 *
 * What it does: samples a pure sine wave y(t) = A · sin(2π f t) at evenly
 * spaced points over a time window, for drawing on a <canvas>.
 *
 * Why it exists: the waveform visualizers need actual numeric sample
 * values (not just a Web Audio node) so they can draw individual waves,
 * overlay them, and add them together — independent of whether audio is
 * currently playing.
 *
 * Input: a tone's frequency (Hz) and amplitude (0-1), how many seconds of
 * the wave to sample, and how many sample points to produce.
 * Output: a Float32Array of `sampleCount` values, each in [-amplitude, amplitude].
 */
export function sampleSineWave({ frequency, amplitude }, durationSeconds, sampleCount) {
  const samples = new Float32Array(sampleCount);
  const angularFrequency = 2 * Math.PI * frequency;
  const lastIndex = Math.max(1, sampleCount - 1);
  for (let i = 0; i < sampleCount; i += 1) {
    const t = (i / lastIndex) * durationSeconds;
    samples[i] = amplitude * Math.sin(angularFrequency * t);
  }
  return samples;
}

/**
 * sumSamples(sampleArrays)
 *
 * Adds several equal-length sample arrays point-by-point — this is the
 * "resultant wave" from section 12 of the brief: result(t) = Σ wave_i(t).
 * Returns an empty array when given no waves, and a length-0-safe copy
 * otherwise.
 */
export function sumSamples(sampleArrays) {
  if (sampleArrays.length === 0) return new Float32Array(0);
  const length = sampleArrays[0].length;
  const result = new Float32Array(length);
  for (const samples of sampleArrays) {
    for (let i = 0; i < length; i += 1) {
      result[i] += samples[i];
    }
  }
  return result;
}
