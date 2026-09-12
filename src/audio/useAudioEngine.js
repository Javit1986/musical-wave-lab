import { useEffect, useRef } from "react";
import { AudioEngine } from "./audioEngine";

/**
 * useAudioEngine({ tones, masterVolume, isPlaying })
 *
 * React glue around a single, stable AudioEngine instance (created once
 * per component lifetime via useRef, never recreated on re-render — this
 * is what keeps the app to exactly one AudioContext). Starts/stops the
 * engine when `isPlaying` flips, keeps oscillators in sync whenever
 * `tones` changes while playing, and disposes the whole audio graph on
 * unmount.
 *
 * Returns the engine instance itself so callers (the spectrum visualizer)
 * can read its AnalyserNode for drawing.
 */
export function useAudioEngine({ tones, masterVolume, isPlaying }) {
  const engineRef = useRef(null);
  if (!engineRef.current) {
    engineRef.current = new AudioEngine();
  }

  useEffect(() => {
    const engine = engineRef.current;
    if (isPlaying) {
      engine.start(tones, masterVolume);
    } else {
      engine.stop();
    }
    // Only react to isPlaying here — tone/volume updates while already
    // playing are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => {
    const engine = engineRef.current;
    if (isPlaying) {
      engine.syncTones(tones);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tones, isPlaying]);

  useEffect(() => {
    engineRef.current.setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    const engine = engineRef.current;
    return () => engine.dispose();
  }, []);

  return engineRef.current;
}
