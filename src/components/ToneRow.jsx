import { NOTE_NAMES, OCTAVES } from "../music/notes";
import { nearestNoteFromFrequency } from "../music/frequencies";

/**
 * ToneRow
 *
 * Full controls for a single tone: enable toggle, color, optional custom
 * name, mode switch (Note / Free Hz), the note+octave or raw-frequency
 * input that matches the current mode, the resulting frequency, amplitude,
 * and delete. Switching mode preserves pitch — Note→Free copies the
 * tone's current computed frequency; Free→Note snaps to the nearest note
 * — so toggling never silently jumps the sound.
 */
function ToneRow({ tone, referenceFrequency, onChange, onRemove, onToggle }) {
  function handleModeChange(nextMode) {
    if (nextMode === tone.mode) return;
    if (nextMode === "free") {
      onChange({ mode: "free", freeFrequency: tone.frequency });
    } else {
      const nearest = nearestNoteFromFrequency(tone.frequency, referenceFrequency);
      onChange({ mode: "note", note: nearest.note, octave: nearest.octave });
    }
  }

  const nearest =
    tone.mode === "free" ? nearestNoteFromFrequency(tone.frequency, referenceFrequency) : null;

  return (
    <div className={`tone-row${tone.enabled ? "" : " tone-row-disabled"}`}>
      <input
        type="checkbox"
        checked={tone.enabled}
        onChange={onToggle}
        aria-label={`Activar/desactivar ${tone.label}`}
      />

      <input
        type="color"
        value={tone.color}
        onChange={(e) => onChange({ color: e.target.value })}
        aria-label={`Color de ${tone.label}`}
        className="tone-color-input"
      />

      <input
        type="text"
        value={tone.name}
        placeholder={tone.label}
        onChange={(e) => onChange({ name: e.target.value })}
        aria-label="Nombre del tono"
        className="tone-name-input"
      />

      <div className="segmented-control tone-mode-toggle" role="tablist" aria-label="Modo del tono">
        <button
          type="button"
          role="tab"
          aria-selected={tone.mode === "note"}
          className={tone.mode === "note" ? "active" : ""}
          onClick={() => handleModeChange("note")}
        >
          Note
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tone.mode === "free"}
          className={tone.mode === "free" ? "active" : ""}
          onClick={() => handleModeChange("free")}
        >
          Free Hz
        </button>
      </div>

      {tone.mode === "note" ? (
        <div className="tone-note-controls">
          <select
            value={tone.note}
            onChange={(e) => onChange({ note: e.target.value })}
            aria-label="Nota"
          >
            {NOTE_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            value={tone.octave}
            onChange={(e) => onChange({ octave: Number(e.target.value) })}
            aria-label="Octava"
          >
            {OCTAVES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="tone-freq-controls">
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={tone.freeFrequency}
            onChange={(e) => onChange({ freeFrequency: Number(e.target.value) })}
            aria-label="Frecuencia libre en Hz"
          />
          <span className="tone-hint">
            ≈ {nearest.note}
            {nearest.octave} ({nearest.cents >= 0 ? "+" : ""}
            {nearest.cents}¢)
          </span>
        </div>
      )}

      <span className="tone-freq-readout">{tone.frequency.toFixed(2)} Hz</span>

      <div className="tone-amplitude-controls">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={tone.amplitude}
          onChange={(e) => onChange({ amplitude: Number(e.target.value) })}
          aria-label={`Amplitud de ${tone.label}`}
        />
        <span className="tone-amp-readout">{tone.amplitude.toFixed(2)}</span>
      </div>

      <button
        type="button"
        className="btn btn-sm btn-icon-only"
        onClick={onRemove}
        aria-label={`Eliminar ${tone.label}`}
      >
        ✕
      </button>
    </div>
  );
}

export default ToneRow;
