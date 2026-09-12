/**
 * createAnalyser(audioContext, fftSize)
 *
 * Creates an AnalyserNode configured for the spectrum view. `fftSize`
 * (2048 by default) sets the FFT window size Web Audio computes
 * internally; it produces `fftSize / 2` frequency bins, each covering
 * `sampleRate / fftSize` Hz. `smoothingTimeConstant` slightly averages
 * consecutive frames so the spectrum doesn't flicker.
 */
export function createAnalyser(audioContext, fftSize = 2048) {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.75;
  return analyser;
}

/** Reads the analyser's current frequency-domain magnitudes (0-255 per bin). */
export function readFrequencyData(analyser) {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  return data;
}

/** Converts an FFT bin index to the frequency (Hz) it represents. */
export function binIndexToFrequency(binIndex, analyser, sampleRate) {
  return (binIndex * sampleRate) / analyser.fftSize;
}

/**
 * findSpectralPeaks(data, analyser, sampleRate, options)
 *
 * What it does: scans the FFT magnitude data for local maxima above a
 * threshold — the bins where a bar is taller than its neighbors on both
 * sides — and returns their frequencies, sorted loudest first.
 *
 * Why: this is what lets the spectrum view label peaks with a frequency
 * in Hz (e.g. "261 Hz") instead of just showing bars, so a peak can be
 * matched back to the tone that produced it.
 *
 * Input: the Uint8Array from readFrequencyData, the AnalyserNode (for
 * fftSize), the AudioContext's sampleRate, and options { threshold
 * (0-255, minimum magnitude to count as a peak), maxPeaks }.
 * Output: an array of { frequency, magnitude }, longest peaks first,
 * capped at `maxPeaks`.
 */
export function findSpectralPeaks(
  data,
  analyser,
  sampleRate,
  { threshold = 40, maxPeaks = 8 } = {},
) {
  const peaks = [];
  for (let i = 2; i < data.length - 2; i += 1) {
    const v = data[i];
    if (v < threshold) continue;
    if (v >= data[i - 1] && v >= data[i + 1] && v > data[i - 2] && v > data[i + 2]) {
      peaks.push({
        frequency: binIndexToFrequency(i, analyser, sampleRate),
        magnitude: v,
      });
    }
  }
  return peaks.sort((a, b) => b.magnitude - a.magnitude).slice(0, maxPeaks);
}
