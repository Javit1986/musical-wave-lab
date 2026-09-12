import { useState } from "react";

const A4_PRESETS = [432, 440, 442];

/**
 * SettingsPanel
 *
 * Lets the user pick the reference tuning (A4, in Hz) from three common
 * presets or type a custom value. Changing it is propagated up to App,
 * which recalculates every "note mode" tone's frequency — "free
 * frequency" tones are unaffected, since their pitch doesn't come from a
 * note. `mode` (preset vs. custom) is tracked locally so picking
 * "Personalizada…" doesn't snap back to the last preset just because the
 * typed value happens to match one.
 */
function SettingsPanel({ referenceFrequency, onReferenceFrequencyChange }) {
  const [mode, setMode] = useState(
    A4_PRESETS.includes(referenceFrequency) ? "preset" : "custom",
  );
  const [customValue, setCustomValue] = useState(String(referenceFrequency));

  function handleSelectChange(e) {
    const value = e.target.value;
    if (value === "custom") {
      setMode("custom");
    } else {
      setMode("preset");
      onReferenceFrequencyChange(Number(value));
    }
  }

  function handleCustomChange(e) {
    const raw = e.target.value;
    setCustomValue(raw);
    const parsed = Number(raw);
    if (raw !== "" && Number.isFinite(parsed) && parsed > 0) {
      onReferenceFrequencyChange(parsed);
    }
  }

  return (
    <section className="panel" aria-labelledby="settings-heading">
      <div className="panel-header">
        <h2 id="settings-heading">Tonal Settings</h2>
      </div>

      <div style={{ display: "flex", gap: "var(--space-5)", flexWrap: "wrap" }}>
        <div className="field" style={{ width: 160 }}>
          <label htmlFor="a4-select">A4 (Hz)</label>
          <select
            id="a4-select"
            value={mode === "preset" ? referenceFrequency : "custom"}
            onChange={handleSelectChange}
          >
            {A4_PRESETS.map((hz) => (
              <option key={hz} value={hz}>
                {hz} Hz
              </option>
            ))}
            <option value="custom">Personalizada…</option>
          </select>
        </div>

        {mode === "custom" && (
          <div className="field" style={{ width: 160 }}>
            <label htmlFor="a4-custom">Frecuencia personalizada</label>
            <input
              id="a4-custom"
              type="number"
              min="1"
              step="0.01"
              placeholder="438.00"
              value={customValue}
              onChange={handleCustomChange}
            />
          </div>
        )}

        <div className="field" style={{ width: 160 }}>
          <label htmlFor="wave-type">Forma de onda</label>
          <select id="wave-type" defaultValue="sine" disabled>
            <option value="sine">Sine</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default SettingsPanel;
