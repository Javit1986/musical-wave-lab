import WaveformVisualizer from "./WaveformVisualizer";
import OverlayVisualizer from "./OverlayVisualizer";
import SpectrumVisualizer from "./SpectrumVisualizer";

const MODES = [
  { id: "individual", label: "Individual + Resultant" },
  { id: "overlay", label: "Overlay" },
  { id: "spectrum", label: "Spectrum" },
];

const TIME_WINDOWS_MS = [1, 5, 10, 20, 50, 100];

/**
 * VisualizationPanel
 *
 * Owns the visualization-mode tabs (Individual+Resultant / Overlay /
 * Spectrum) and the time-window (zoom) control, and renders whichever
 * visualizer is active. The time window doesn't apply to the spectrum
 * (an FFT view, not a time-domain one), so its slider hides in that mode.
 */
function VisualizationPanel({
  tones,
  visualizationMode,
  onVisualizationModeChange,
  timeWindowMs,
  onTimeWindowChange,
  engine,
  isPlaying,
}) {
  return (
    <section className="panel" aria-labelledby="viz-heading">
      <div className="panel-header">
        <h2 id="viz-heading">Visualization</h2>
        <div className="segmented-control" role="tablist" aria-label="Modo de visualización">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={visualizationMode === m.id}
              className={visualizationMode === m.id ? "active" : ""}
              onClick={() => onVisualizationModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {visualizationMode === "individual" && (
        <WaveformVisualizer tones={tones} timeWindowMs={timeWindowMs} />
      )}
      {visualizationMode === "overlay" && (
        <OverlayVisualizer tones={tones} timeWindowMs={timeWindowMs} />
      )}
      {visualizationMode === "spectrum" && (
        <SpectrumVisualizer tones={tones} engine={engine} isPlaying={isPlaying} />
      )}

      {visualizationMode !== "spectrum" && (
        <div className="field" style={{ marginTop: "var(--space-4)", maxWidth: 320 }}>
          <label htmlFor="time-window">Time window: {timeWindowMs} ms</label>
          <input
            id="time-window"
            type="range"
            min="0"
            max={TIME_WINDOWS_MS.length - 1}
            step="1"
            value={TIME_WINDOWS_MS.indexOf(timeWindowMs)}
            onChange={(e) => onTimeWindowChange(TIME_WINDOWS_MS[Number(e.target.value)])}
          />
        </div>
      )}
    </section>
  );
}

export default VisualizationPanel;
