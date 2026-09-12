/**
 * AudioControls
 *
 * Transport bar: Play starts every enabled tone simultaneously through
 * the shared AudioEngine (see `src/audio/`), Stop silences them, and the
 * master volume slider scales everything post-mix. Play/Stop are kept as
 * two distinct buttons (each disabled in the state it can't apply) rather
 * than a single toggle, matching the brief's layout.
 */
function AudioControls({ isPlaying, onPlay, onStop, masterVolume, onMasterVolumeChange }) {
  return (
    <div className="app-header">
      <div className="app-title">
        <h1>Musical Wave Lab</h1>
        <p className="subtitle">
          Visualizador y laboratorio de ondas, frecuencias y armonías
        </p>
      </div>

      <div
        className="panel-header-actions"
        role="group"
        aria-label="Controles de reproducción"
      >
        <button
          className="btn btn-primary"
          onClick={onPlay}
          disabled={isPlaying}
          aria-label="Reproducir"
        >
          ▶ Play
        </button>
        <button
          className="btn"
          onClick={onStop}
          disabled={!isPlaying}
          aria-label="Detener"
        >
          ■ Stop
        </button>
        <div className="field" style={{ width: 130 }}>
          <label htmlFor="master-volume">
            Volumen: {Math.round(masterVolume * 100)}%
          </label>
          <input
            id="master-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
            aria-label="Volumen general"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioControls;
