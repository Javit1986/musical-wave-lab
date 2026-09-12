import { createToneNodes, updateToneNodes, stopToneNodes } from "./oscillator";
import { createAnalyser } from "./analyzer";

/**
 * AudioEngine
 *
 * Owns the Web Audio graph for the whole app:
 *
 *   tone oscillators → masterGain → analyser → destination (speakers)
 *
 * Exactly one AudioContext is created, lazily, the first time `start()`
 * runs (browsers require a user gesture before audio can play, and
 * creating it eagerly on page load would also risk multiple contexts if
 * this were ever instantiated more than once). `syncTones` reconciles the
 * live oscillator/gain nodes with whatever tones currently exist — it
 * creates nodes for new tones, updates frequency/amplitude/enabled for
 * existing ones, and disconnects nodes for tones that were removed —
 * without ever destroying and recreating the underlying AudioContext.
 */
export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.analyser = null;
    this.toneNodes = new Map(); // tone id -> { oscillator, gain }
  }

  ensureContext() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.analyser = createAnalyser(this.audioContext);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } else if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setMasterVolume(volume) {
    if (!this.masterGain || !this.audioContext) return;
    this.masterGain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.01);
  }

  /** Starts (or resumes) playback and syncs the current tone set. */
  start(tones, masterVolume) {
    this.ensureContext();
    this.setMasterVolume(masterVolume);
    this.syncTones(tones);
  }

  /** Reconciles live oscillator/gain nodes with the given tone list. */
  syncTones(tones) {
    if (!this.audioContext) return;

    const seenIds = new Set();
    for (const tone of tones) {
      seenIds.add(tone.id);
      let nodes = this.toneNodes.get(tone.id);
      if (!nodes) {
        nodes = createToneNodes(this.audioContext, tone, this.masterGain);
        this.toneNodes.set(tone.id, nodes);
      } else {
        updateToneNodes(this.audioContext, nodes, tone);
      }
    }

    for (const [id, nodes] of this.toneNodes) {
      if (!seenIds.has(id)) {
        stopToneNodes(nodes);
        this.toneNodes.delete(id);
      }
    }
  }

  /** Stops all sounding tones (keeps the AudioContext alive for a quick replay). */
  stop() {
    for (const nodes of this.toneNodes.values()) {
      stopToneNodes(nodes);
    }
    this.toneNodes.clear();
  }

  getAnalyser() {
    return this.analyser;
  }

  /** Tears the whole graph down — call on unmount only. */
  dispose() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
      this.analyser = null;
    }
  }
}
