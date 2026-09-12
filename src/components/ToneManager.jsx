import ToneRow from "./ToneRow";
import { MAX_TONES } from "../music/tone";

/**
 * ToneManager
 *
 * Panel listing every active tone as a `ToneRow`, plus "+ Add Tone"
 * (capped at MAX_TONES — one per palette color, so every tone always
 * keeps a visually distinct color) and the empty state before any tone
 * exists.
 */
function ToneManager({ tones, onAddTone, onRemoveTone, onUpdateTone, onToggleTone, referenceFrequency }) {
  const atLimit = tones.length >= MAX_TONES;

  return (
    <section className="panel" aria-labelledby="tones-heading">
      <div className="panel-header">
        <h2 id="tones-heading">Tones</h2>
        <div className="panel-header-actions">
          <button className="btn btn-sm" onClick={onAddTone} disabled={atLimit}>
            + Add Tone
          </button>
        </div>
      </div>

      {tones.length === 0 ? (
        <div className="empty-state">
          <p>Todavía no hay tonos agregados.</p>
          <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
            Usá &quot;+ Add Tone&quot; para empezar.
          </p>
        </div>
      ) : (
        <div className="tone-list">
          {tones.map((tone) => (
            <ToneRow
              key={tone.id}
              tone={tone}
              referenceFrequency={referenceFrequency}
              onChange={(patch) => onUpdateTone(tone.id, patch)}
              onRemove={() => onRemoveTone(tone.id)}
              onToggle={() => onToggleTone(tone.id)}
            />
          ))}
        </div>
      )}

      {atLimit && (
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: "var(--space-3)" }}>
          Límite de {MAX_TONES} tonos alcanzado.
        </p>
      )}
    </section>
  );
}

export default ToneManager;
