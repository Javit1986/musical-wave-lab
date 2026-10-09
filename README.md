# Musical Wave Lab

**[🎧 Probala en vivo →](https://Javit1986.github.io/musical-wave-lab/)**

Herramienta interactiva, 100% en el navegador, para experimentar con tonos
musicales, frecuencias, ondas y armonías. Agregá uno o varios tonos y mirá
—y escuchá— cómo interactúan: su onda individual, cómo se superponen, la
onda resultante de sumarlos, y su espectro de frecuencias mediante FFT.

Todo corre del lado del cliente. No hay backend, ni base de datos, ni
cuentas, y ningún dato sale de tu navegador. Totalmente responsive —
funciona en desktop, tablet y celular.

## Funcionalidades

- **Gestión de tonos** — agregar, eliminar, activar/desactivar y editar
  tonos; cada uno con su propia frecuencia, amplitud y color.
- **Notas musicales y frecuencia libre** — elegí una nota (C–B) y octava
  bajo temperamento igual de 12 tonos, o pasá un tono a "Free Hz" para usar
  cualquier frecuencia arbitraria, incluso una que no corresponda a una nota.
- **Afinación (A4)** — cambiá la frecuencia de referencia entre los
  presets 432 / 440 / 442 Hz o ingresá un valor personalizado; la
  frecuencia de cada tono en modo nota se recalcula al instante.
- **Visualización de ondas** — dos modos: cada onda en su propia fila con
  la onda resultante debajo ("Individual + Resultant"), o todas las ondas
  superpuestas sobre los mismos ejes ("Overlay") para ver dónde se
  refuerzan o se cancelan.
- **Onda resultante** — la suma punto a punto de todos los tonos activos,
  recalculada cada vez que cambia un tono, su frecuencia o su amplitud.
- **Zoom temporal** — ajustá cuánto tiempo abarca la visualización (1 ms a
  100 ms), ya que las frecuencias altas necesitan una ventana chica para
  mostrar ciclos individuales, y la interacción entre varios tonos necesita
  una ventana más amplia.
- **Reproducción (Web Audio API)** — Play/Stop para todos los tonos
  activos simultáneamente, como osciladores seno reales, con volumen
  general y por tono. Lo que escuchás siempre corresponde a lo que se
  dibuja.
- **Espectro FFT** — vista en vivo del dominio de frecuencia mientras se
  reproduce, con marcadores punteados en la frecuencia esperada de cada
  tono y etiquetas en los picos detectados.
- **Análisis musical (opcional)** — para los tonos activos: la nota más
  cercana para un solo tono, el intervalo y la relación (ratio) entre dos,
  o una estimación de acorde (tríadas y acordes de 7ma comunes) para tres o
  más — más una estimación aproximada de consonancia/disonancia. Los
  acordes ambiguos (por ejemplo, un disminuido 7 simétrico) se muestran
  como varias "posibles interpretaciones" en lugar de adivinar uno solo.

## Stack técnico

- React + Vite
- JavaScript puro (sin TypeScript)
- Web Audio API (`OscillatorNode`, `GainNode`, `AnalyserNode`)
- Canvas 2D para todo el dibujo de ondas/espectro
- CSS plano (sin frameworks de UI)

## Correr localmente

```bash
npm install
npm run dev
```

Esto levanta un servidor de desarrollo local (Vite imprime la URL,
típicamente `http://localhost:5173`).

Para generar un build de producción:

```bash
npm run build
```

El resultado queda en `dist/`. Para previsualizarlo localmente:

```bash
npm run preview
```

## Desplegar en GitHub Pages

Este repo incluye `.github/workflows/deploy.yml`, que compila la app y la
publica en GitHub Pages automáticamente en cada push a `main`. Configuración
única, después del primer push:

1. En GitHub, andá a **Settings → Pages**.
2. En **Build and deployment → Source**, elegí **GitHub Actions**.

A partir de ahí, cada push a `main` redespliega el sitio en vivo — sin
builds ni subidas manuales. `vite.config.js` usa una ruta base relativa
(`base: "./"`), así que el build funciona correctamente alojado en un
subpath de proyecto (`https://<usuario>.github.io/<repo>/`) sin
configuración extra.

Alternativamente, podés correrlo localmente con Docker en lugar de (o
además de) Pages — ver `Dockerfile` / `docker-compose.yml` en este repo.

## Arquitectura

```text
src/
├── components/    UI en React: paneles, filas de tono, visualizadores, análisis
├── audio/         Web Audio: AudioEngine, helpers de oscilador/analyser,
│                  y el hook useAudioEngine que lo conecta con React
├── music/         Matemática pura: notas, frecuencias, muestreo de ondas,
│                  intervalos, detección de acordes — sin dependencia de DOM/Audio
├── utils/         Helpers genéricos chicos: dibujo en canvas, resize observer
├── App.jsx        Dueño del estado compartido, arma los paneles
└── main.jsx       Punto de entrada
```

La separación que más importa es entre `music/` (funciones puras — dados
los mismos números, siempre el mismo resultado, fácil de razonar y
testear) y `audio/`/`components/` (las partes con efectos secundarios:
generar sonido de verdad, dibujar píxeles de verdad). La frecuencia de un
tono nunca se guarda directamente — siempre se deriva de su nota/octava y
el A4 actual (o de su valor de frecuencia libre), así nunca puede quedar
desincronizada cuando cambia la afinación.

## Conceptos musicales, brevemente

- **Frecuencia** — cuántas veces por segundo se repite una onda, en Hz. Es
  lo que determina la altura (pitch) del sonido.
- **Amplitud** — el desplazamiento máximo de la onda, que determina el
  volumen.
- **Referencia A4** — por convención, la frecuencia asignada a la nota A
  en la 4ta octava; todas las demás notas se derivan de ella. 440 Hz es el
  estándar moderno, pero 432 y 442 Hz también son comunes.
- **12-TET (temperamento igual de 12 tonos)** — el sistema de afinación
  que divide cada octava en 12 semitonos iguales, cada uno un factor de
  <sup>12</sup>√2 de distancia. Por eso `frequencyFromNote` usa
  `f = a4 · 2^(n/12)`.
- **Superposición** — cuando varias ondas ocupan el mismo espacio, sus
  desplazamientos simplemente se suman en cada instante. Esa suma es la
  "onda resultante" que esta app dibuja y reproduce.
- **FFT (Transformada Rápida de Fourier)** — un algoritmo que descompone
  una señal en las frecuencias que la componen. La vista de espectro usa
  la implementación nativa de `AnalyserNode` de Web Audio, en lugar de una
  hecha a mano.
- **Intervalos** — la distancia entre dos alturas, expresada en semitonos
  y como relación de frecuencia (por ejemplo, una quinta justa son 7
  semitonos, ratio 3:2).
