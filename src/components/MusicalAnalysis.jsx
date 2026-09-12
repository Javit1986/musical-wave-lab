import { describeInterval, classifyConsonance, classifyOverallConsonance } from "../music/intervals";
import { detectChord } from "../music/chordDetection";
import { nearestNoteFromFrequency } from "../music/frequencies";
import { NOTE_NAMES } from "../music/notes";

const CONSONANCE_LABELS = {
  consonant: "Consonant",
  neutral: "Neutral",
  dissonant: "Dissonant",
};

function ConsonanceBadge({ value }) {
  if (!value) return null;
  return (
    <p className={`consonance-badge consonance-${value}`}>
      <span className="consonance-label">{CONSONANCE_LABELS[value]}</span>
      <span className="consonance-disclaimer">
        {" "}
        — aproximación basada en relaciones de frecuencia, no una medición de percepción
      </span>
    </p>
  );
}

/**
 * MusicalAnalysis
 *
 * Optional panel that reads meaning into the currently enabled tones:
 * a single tone's nearest note, an interval between two, or a chord
 * guess (plus consonance estimate) for three or more — all derived
 * straight from each tone's frequency, so it works the same whether the
 * tone came from a note or a free-frequency value. When multiple chord
 * roots match equally well (e.g. a symmetric diminished 7th), every
 * match is shown as a "possible interpretation" rather than guessing.
 */
function MusicalAnalysis({ tones, referenceFrequency, visible, onToggleVisible }) {
  return (
    <section className="panel" aria-labelledby="analysis-heading">
      <div className="panel-header">
        <h2 id="analysis-heading">Musical Analysis</h2>
        <button
          type="button"
          className="btn btn-sm"
          onClick={onToggleVisible}
          aria-expanded={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {visible && renderContent(tones, referenceFrequency)}
    </section>
  );
}

function renderContent(tones, referenceFrequency) {
  if (tones.length === 0) {
    return (
      <div className="empty-state">
        <p>Activá al menos un tono para ver el análisis musical.</p>
      </div>
    );
  }

  const frequencies = tones.map((t) => t.frequency);

  if (tones.length === 1) {
    const nearest = nearestNoteFromFrequency(frequencies[0], referenceFrequency);
    return (
      <div className="analysis-content">
        <p className="analysis-headline">{tones[0].label} · Single tone</p>
        <p className="analysis-detail">
          ≈ {nearest.note}
          {nearest.octave} ({nearest.cents >= 0 ? "+" : ""}
          {nearest.cents}¢) · {frequencies[0].toFixed(2)} Hz
        </p>
      </div>
    );
  }

  if (tones.length === 2) {
    const interval = describeInterval(frequencies[0], frequencies[1]);
    const consonance = classifyConsonance(frequencies[0], frequencies[1]);
    return (
      <div className="analysis-content">
        <p className="analysis-headline">
          {tones[0].label} → {tones[1].label} · {interval.name}
        </p>
        <p className="analysis-detail">
          {interval.semitones} semitones · ratio ≈ {interval.ratio.toFixed(4)}
          {interval.cents !== 0 ? ` (${interval.cents > 0 ? "+" : ""}${interval.cents}¢)` : ""}
        </p>
        <ConsonanceBadge value={consonance} />
      </div>
    );
  }

  const { matches, pitchClasses } = detectChord(frequencies, referenceFrequency);
  const overall = classifyOverallConsonance(frequencies);
  const noteNames = pitchClasses.map((pc) => NOTE_NAMES[pc]);

  return (
    <div className="analysis-content">
      <p className="analysis-detail">Notes: {noteNames.join(" - ")}</p>

      {matches.length === 0 && (
        <p className="analysis-headline">No se detectó un acorde estándar</p>
      )}

      {matches.length === 1 && (
        <p className="analysis-headline">
          Possible chord: {NOTE_NAMES[matches[0].root]} {matches[0].quality}
        </p>
      )}

      {matches.length > 1 && (
        <div>
          <p className="analysis-headline">Possible interpretations</p>
          <ul className="analysis-list">
            {matches.map((m) => (
              <li key={`${m.root}-${m.quality}`}>
                {NOTE_NAMES[m.root]} {m.quality}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConsonanceBadge value={overall} />
    </div>
  );
}

export default MusicalAnalysis;
