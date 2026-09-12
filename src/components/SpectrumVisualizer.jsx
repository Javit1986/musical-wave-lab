import { useEffect, useRef } from "react";
import { useResizeObserver } from "../utils/useResizeObserver";
import { prepareCanvas, MONO_FONT } from "../utils/canvasDrawing";
import { readFrequencyData, findSpectralPeaks } from "../audio/analyzer";

/**
 * SpectrumVisualizer — FFT / frequency-domain view.
 *
 * While playing, reads the AudioEngine's AnalyserNode every animation
 * frame and draws the live magnitude spectrum as bars, with a dashed
 * marker at each tone's expected frequency (so a bar can be matched back
 * to the tone that produced it) and Hz labels on the detected peaks.
 * Needs actual audio playback to have data, so it shows a placeholder
 * instead of an empty canvas when not playing.
 */
function SpectrumVisualizer({ tones, engine, isPlaying }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    if (!isPlaying || size.width === 0 || size.height === 0) {
      if (size.width > 0 && size.height > 0) prepareCanvas(canvas, size.width, size.height);
      return undefined;
    }

    let rafId;
    const draw = () => {
      const analyser = engine.getAnalyser();
      const audioContext = engine.audioContext;

      if (analyser && audioContext) {
        const ctx = prepareCanvas(canvas, size.width, size.height);
        const data = readFrequencyData(analyser);
        const nyquist = audioContext.sampleRate / 2;
        const maxFreqAxis = Math.min(
          nyquist,
          Math.max(1000, ...tones.map((t) => t.frequency * 1.4)),
        );
        const usableBins = Math.max(
          1,
          Math.floor((maxFreqAxis / nyquist) * data.length),
        );
        const barWidth = size.width / usableBins;

        ctx.fillStyle = "rgba(79, 209, 197, 0.55)";
        for (let i = 0; i < usableBins; i += 1) {
          const magnitude = data[i] / 255;
          const barHeight = magnitude * size.height * 0.92;
          ctx.fillRect(i * barWidth, size.height - barHeight, Math.max(1, barWidth - 1), barHeight);
        }

        tones.forEach((tone) => {
          const x = (tone.frequency / maxFreqAxis) * size.width;
          ctx.strokeStyle = tone.color;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, size.height);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        const peaks = findSpectralPeaks(data, analyser, audioContext.sampleRate, {
          threshold: 35,
          maxPeaks: Math.max(5, tones.length),
        });
        ctx.fillStyle = "rgba(238, 241, 248, 0.9)";
        ctx.font = MONO_FONT;
        peaks.forEach((peak) => {
          if (peak.frequency > maxFreqAxis) return;
          const x = (peak.frequency / maxFreqAxis) * size.width;
          const label = `${peak.frequency.toFixed(0)} Hz`;
          ctx.fillText(label, Math.min(x + 4, size.width - 60), 14);
        });
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, size, tones, engine]);

  return (
    <div className="viz-frame" ref={containerRef}>
      <canvas ref={canvasRef} />
      {!isPlaying && (
        <div className="viz-placeholder">Presioná Play para ver el espectro en vivo.</div>
      )}
    </div>
  );
}

export default SpectrumVisualizer;
