/**
 * createToneNodes(audioContext, tone, destination)
 *
 * Builds the two Web Audio nodes one tone needs to actually make sound:
 * an OscillatorNode (the sine-wave source) feeding a per-tone GainNode
 * (its individual volume), which connects to `destination` (the master
 * gain). Starts the oscillator immediately — Web Audio oscillators are
 * cheap to run continuously and are muted via gain instead of being
 * stopped/restarted, which avoids audible clicks when a tone is toggled.
 *
 * Input: the AudioContext, a tone ({ frequency, amplitude, enabled }),
 * and the node to connect its gain into.
 * Output: { oscillator, gain } — kept by the caller to update or stop later.
 */
export function createToneNodes(audioContext, tone, destination) {
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(tone.frequency, audioContext.currentTime);

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(tone.enabled ? tone.amplitude : 0, audioContext.currentTime);

  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start();

  return { oscillator, gain };
}

/**
 * updateToneNodes(audioContext, nodes, tone)
 *
 * Ramps an existing tone's frequency and gain toward new values (instead
 * of jumping instantly, which would click) whenever the tone's frequency,
 * amplitude, or enabled state changes. Disabling a tone ramps its gain to
 * 0 rather than stopping the oscillator.
 */
export function updateToneNodes(audioContext, nodes, tone) {
  const now = audioContext.currentTime;
  nodes.oscillator.frequency.setTargetAtTime(tone.frequency, now, 0.01);
  nodes.gain.gain.setTargetAtTime(tone.enabled ? tone.amplitude : 0, now, 0.01);
}

/** Stops and disconnects a tone's nodes for good (used when a tone is deleted). */
export function stopToneNodes(nodes) {
  try {
    nodes.oscillator.stop();
  } catch {
    // Already stopped — safe to ignore.
  }
  nodes.oscillator.disconnect();
  nodes.gain.disconnect();
}
