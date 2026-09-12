import { useMemo, useState } from "react";
import AudioControls from "./components/AudioControls";
import SettingsPanel from "./components/SettingsPanel";
import ToneManager from "./components/ToneManager";
import VisualizationPanel from "./components/VisualizationPanel";
import MusicalAnalysis from "./components/MusicalAnalysis";
import { useAudioEngine } from "./audio/useAudioEngine";
import { getToneFrequency, getToneLabel, createDefaultTone } from "./music/tone";
import { DEFAULT_A4 } from "./music/frequencies";
import "./App.css";

// Starting preset: a C major triad, so the app shows something meaningful
// (all three visualization modes, a detected chord) the moment it loads.
const INITIAL_TONES = [
  { id: "tone-c4", name: "", mode: "note", note: "C", octave: 4, freeFrequency: 261.63, amplitude: 0.75, color: "#4fd1c5", enabled: true },
  { id: "tone-e4", name: "", mode: "note", note: "E", octave: 4, freeFrequency: 329.63, amplitude: 0.65, color: "#f472b6", enabled: true },
  { id: "tone-g4", name: "", mode: "note", note: "G", octave: 4, freeFrequency: 392.0, amplitude: 0.7, color: "#a78bfa", enabled: true },
];

/**
 * App
 *
 * Owns all shared application state (tones, master volume, reference A4,
 * visualization mode, time window, analysis visibility, isPlaying) per
 * the brief's state list, and passes it down to each panel. Each tone's
 * `frequency` and `label` are derived — never stored — with
 * `getToneFrequency`/`getToneLabel`, recomputed in a memo whenever the
 * tones or the A4 reference change, so they can never drift out of sync.
 */
function App() {
  const [tones, setTones] = useState(INITIAL_TONES);
  const [referenceFrequency, setReferenceFrequency] = useState(DEFAULT_A4);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [visualizationMode, setVisualizationMode] = useState("individual");
  const [timeWindowMs, setTimeWindowMs] = useState(10);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const enrichedTones = useMemo(
    () =>
      tones.map((tone) => ({
        ...tone,
        frequency: getToneFrequency(tone, referenceFrequency),
        label: getToneLabel(tone),
      })),
    [tones, referenceFrequency],
  );

  const audibleTones = useMemo(() => enrichedTones.filter((t) => t.enabled), [enrichedTones]);

  const engine = useAudioEngine({ tones: enrichedTones, masterVolume, isPlaying });

  function handleAddTone() {
    setTones((prev) => [...prev, createDefaultTone(prev)]);
  }

  function handleRemoveTone(id) {
    setTones((prev) => prev.filter((t) => t.id !== id));
  }

  function handleUpdateTone(id, patch) {
    setTones((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function handleToggleTone(id) {
    setTones((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  }

  return (
    <div className="app">
      <AudioControls
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onStop={() => setIsPlaying(false)}
        masterVolume={masterVolume}
        onMasterVolumeChange={setMasterVolume}
      />

      <main className="app-main">
        <SettingsPanel
          referenceFrequency={referenceFrequency}
          onReferenceFrequencyChange={setReferenceFrequency}
        />

        <ToneManager
          tones={enrichedTones}
          onAddTone={handleAddTone}
          onRemoveTone={handleRemoveTone}
          onUpdateTone={handleUpdateTone}
          onToggleTone={handleToggleTone}
          referenceFrequency={referenceFrequency}
        />

        <VisualizationPanel
          tones={audibleTones}
          visualizationMode={visualizationMode}
          onVisualizationModeChange={setVisualizationMode}
          timeWindowMs={timeWindowMs}
          onTimeWindowChange={setTimeWindowMs}
          engine={engine}
          isPlaying={isPlaying}
        />

        <MusicalAnalysis
          tones={audibleTones}
          referenceFrequency={referenceFrequency}
          visible={showAnalysis}
          onToggleVisible={() => setShowAnalysis((v) => !v)}
        />
      </main>
    </div>
  );
}

export default App;
