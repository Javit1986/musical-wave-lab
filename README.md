# Musical Wave Lab

**[🎧 Try it live →](https://javito1986.github.io/musical-wave-lab/)**

An interactive, browser-only tool for experimenting with musical tones,
frequencies, waveforms, and harmonies. Add one or more tones and watch —
and hear — how they interact: their individual waveforms, how they overlap,
the wave that results from adding them together, and their frequency
spectrum via FFT.

Everything runs client-side. There's no backend, no database, no accounts,
and no data leaves your browser. Fully responsive — works on desktop,
tablet, and mobile.

## Features

- **Tone management** — add, remove, enable/disable, and edit tones; each
  has its own frequency, amplitude, and display color.
- **Musical notes & free frequency** — pick a note (C–B) and octave under
  12-tone equal temperament, or switch a tone to "Free Hz" to use any
  arbitrary frequency, even one that doesn't land on a note.
- **Tuning (A4)** — switch the reference pitch between 432 / 440 / 442 Hz
  presets or enter a custom value; every note-based tone's frequency
  recalculates live.
- **Waveform visualization** — two modes: each tone's wave drawn on its
  own row with the resultant wave below it ("Individual + Resultant"), or
  every wave superimposed on shared axes ("Overlay") so you can see where
  they reinforce or cancel.
- **Resultant wave** — the point-by-point sum of every active tone,
  recalculated whenever a tone, its frequency, or its amplitude changes.
- **Time-window zoom** — adjust how much time the waveform view spans
  (1 ms to 100 ms), since high frequencies need a small window to show
  individual cycles and multi-tone interactions need a wider one.
- **Playback (Web Audio API)** — Play/Stop every enabled tone
  simultaneously as real sine-wave oscillators, with master and per-tone
  volume control. What you hear always matches what's drawn.
- **FFT spectrum** — a live frequency-domain view while playing, with
  dashed markers at each tone's expected frequency and labels on the
  detected peaks.
- **Musical analysis (optional)** — for the currently active tones: the
  nearest note for a single tone, the interval and ratio between two, or
  a best-effort chord guess (triads and common 7th chords) for three or
  more — plus an approximate consonance/dissonance estimate. Ambiguous
  chords (e.g. a symmetric diminished 7th) are shown as multiple
  "possible interpretations" rather than guessed at.

## Tech stack

- React + Vite
- Vanilla JavaScript (no TypeScript)
- Web Audio API (`OscillatorNode`, `GainNode`, `AnalyserNode`)
- Canvas 2D for all waveform/spectrum drawing
- Plain CSS (no UI framework)

## Run locally

```bash
npm install
npm run dev
```

This starts a local dev server (Vite prints the URL, typically
`http://localhost:5173`).

To create a production build:

```bash
npm run build
```

The output goes to `dist/`. Preview it locally with:

```bash
npm run preview
```

## Deploying to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, which builds the app and
publishes it to GitHub Pages automatically on every push to `main`. One-time
setup after the first push:

1. On GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

After that, every push to `main` redeploys the live site — no manual build
or upload needed. `vite.config.js` uses a relative base path (`base: "./"`),
so the build works correctly under a project subpath
(`https://<user>.github.io/<repo>/`) without any extra configuration.

Alternatively, you can run Docker locally instead of (or alongside) Pages —
see `Dockerfile` / `docker-compose.yml` in this repo.

## Architecture

```text
src/
├── components/    React UI: panels, tone rows, visualizers, analysis
├── audio/         Web Audio: AudioEngine, oscillator/analyser helpers,
│                  and the useAudioEngine hook that wires it into React
├── music/         Pure math: notes, frequencies, wave sampling,
│                  intervals, chord detection — no DOM/Audio dependency
├── utils/         Small generic helpers: canvas drawing, resize observer
├── App.jsx        Owns shared app state, composes the panels
└── main.jsx       Entry point
```

The split that matters most is between `music/` (pure functions — given
the same numbers, always the same result, easy to reason about and test)
and `audio/`/`components/` (the side-effectful parts: actually making
sound, actually drawing pixels). A tone's frequency is never stored
directly — it's always derived from its note/octave and the current A4
(or its free-frequency value), so it can't drift out of sync when the
tuning changes.

## Musical concepts, briefly

- **Frequency** — how many times per second a wave repeats, in Hz. It's
  what determines pitch.
- **Amplitude** — the wave's peak displacement, which determines loudness.
- **A4 reference** — by convention, the frequency assigned to the note A
  in the 4th octave; every other note's frequency is derived from it.
  440 Hz is the modern standard, but 432 and 442 Hz are also common.
- **12-TET (12-tone equal temperament)** — the tuning system that splits
  each octave into 12 equal semitone steps, each a factor of
  <sup>12</sup>√2 apart. It's why `frequencyFromNote` uses
  `f = a4 · 2^(n/12)`.
- **Superposition** — when multiple waves occupy the same space, their
  displacements simply add up at every instant. That sum is the
  "resultant wave" this app draws and plays.
- **FFT (Fast Fourier Transform)** — an algorithm that decomposes a
  signal into the frequencies it's made of. The spectrum view uses Web
  Audio's built-in `AnalyserNode` implementation rather than a hand-rolled
  one.
- **Intervals** — the distance between two pitches, expressed in
  semitones and as a frequency ratio (e.g. a perfect fifth is 7
  semitones, ratio 3:2).
