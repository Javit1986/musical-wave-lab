import { useEffect, useRef } from "react";
import { useResizeObserver } from "../utils/useResizeObserver";
import { prepareCanvas, drawZeroLine, plotSamples } from "../utils/canvasDrawing";
import { sampleSineWave, sumSamples } from "../music/waveform";

const SAMPLE_COUNT = 512;

/**
 * OverlayVisualizer — "Overlay" mode.
 *
 * Draws every enabled tone's wave on the same axes, each in its own
 * color, so it's easy to see where they line up, drift apart, or cancel
 * out — plus the resultant wave in white, thicker, on top. A small
 * legend above the canvas keeps overlapping colored lines identifiable.
 */
function OverlayVisualizer({ tones, timeWindowMs }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;
    const ctx = prepareCanvas(canvas, size.width, size.height);
    if (tones.length === 0) return;

    const durationSeconds = timeWindowMs / 1000;
    const yCenter = size.height / 2;
    const rowHeight = size.height * 0.82;

    drawZeroLine(ctx, size.width, yCenter);

    const waveforms = tones.map((tone) => sampleSineWave(tone, durationSeconds, SAMPLE_COUNT));
    tones.forEach((tone, i) => {
      plotSamples(ctx, waveforms[i], {
        width: size.width,
        yCenter,
        rowHeight,
        color: tone.color,
        lineWidth: 1.5,
      });
    });

    if (tones.length > 1) {
      const resultant = sumSamples(waveforms);
      const maxAbs = resultant.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
      const scale = maxAbs > 1 ? 1 / maxAbs : 1;
      plotSamples(ctx, scale === 1 ? resultant : resultant.map((v) => v * scale), {
        width: size.width,
        yCenter,
        rowHeight,
        color: "#eef1f8",
        lineWidth: 2.5,
      });
    }
  }, [tones, timeWindowMs, size]);

  return (
    <>
      {tones.length > 0 && (
        <div className="viz-legend">
          {tones.map((tone) => (
            <span key={tone.id} className="viz-legend-item">
              <span className="viz-legend-swatch" style={{ background: tone.color }} />
              {tone.label}
            </span>
          ))}
          {tones.length > 1 && (
            <span className="viz-legend-item">
              <span className="viz-legend-swatch" style={{ background: "#eef1f8" }} />
              Resultado
            </span>
          )}
        </div>
      )}
      <div className="viz-frame" ref={containerRef}>
        <canvas ref={canvasRef} />
        {tones.length === 0 && (
          <div className="viz-placeholder">Agregá y activá un tono para ver la superposición.</div>
        )}
      </div>
    </>
  );
}

export default OverlayVisualizer;
