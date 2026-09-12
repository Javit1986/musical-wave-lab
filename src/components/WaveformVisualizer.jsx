import { useEffect, useRef } from "react";
import { useResizeObserver } from "../utils/useResizeObserver";
import { prepareCanvas, drawZeroLine, plotSamples, MONO_FONT } from "../utils/canvasDrawing";
import { sampleSineWave, sumSamples } from "../music/waveform";

const SAMPLE_COUNT = 512;

/**
 * WaveformVisualizer — "Individual + Resultant" mode.
 *
 * Draws one row per enabled tone (its own sine wave, in its own color,
 * labeled with name + frequency), plus a final row with the resultant
 * wave: the point-by-point sum of every tone. Purely a function of the
 * current tones and time window — redraws on any change, independent of
 * whether audio is actually playing.
 */
function WaveformVisualizer({ tones, timeWindowMs }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;
    const ctx = prepareCanvas(canvas, size.width, size.height);
    if (tones.length === 0) return;

    const durationSeconds = timeWindowMs / 1000;
    const rowCount = tones.length + 1; // +1 for the resultant row
    const rowHeight = size.height / rowCount;

    const waveforms = tones.map((tone) => sampleSineWave(tone, durationSeconds, SAMPLE_COUNT));

    ctx.font = MONO_FONT;

    tones.forEach((tone, i) => {
      const yCenter = rowHeight * (i + 0.5);
      drawZeroLine(ctx, size.width, yCenter);
      plotSamples(ctx, waveforms[i], {
        width: size.width,
        yCenter,
        rowHeight: rowHeight * 0.85,
        color: tone.color,
      });
      ctx.fillStyle = "rgba(238, 241, 248, 0.85)";
      ctx.fillText(`${tone.label}  ${tone.frequency.toFixed(2)} Hz`, 8, yCenter - rowHeight * 0.32);
    });

    const resultant = sumSamples(waveforms);
    const maxAbs = resultant.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
    const scale = maxAbs > 1 ? 1 / maxAbs : 1;
    const resultantY = rowHeight * (tones.length + 0.5);

    drawZeroLine(ctx, size.width, resultantY);
    plotSamples(ctx, scale === 1 ? resultant : resultant.map((v) => v * scale), {
      width: size.width,
      yCenter: resultantY,
      rowHeight: rowHeight * 0.85,
      color: "#eef1f8",
      lineWidth: 2.5,
    });
    ctx.fillStyle = "rgba(238, 241, 248, 0.85)";
    ctx.fillText(
      scale < 1 ? "Resultado (auto-escalado)" : "Resultado",
      8,
      resultantY - rowHeight * 0.32,
    );
  }, [tones, timeWindowMs, size]);

  return (
    <div className="viz-frame" ref={containerRef}>
      <canvas ref={canvasRef} />
      {tones.length === 0 && (
        <div className="viz-placeholder">Agregá y activá un tono para ver su onda.</div>
      )}
    </div>
  );
}

export default WaveformVisualizer;
