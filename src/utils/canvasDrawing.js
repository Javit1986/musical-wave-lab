/**
 * prepareCanvas(canvas, width, height)
 *
 * Resizes a canvas's backing store to match its CSS size at the current
 * devicePixelRatio (so lines stay crisp on high-DPI screens instead of
 * blurry), clears it, and returns a 2D context whose drawing coordinates
 * are in plain CSS pixels (0,0 to width,height) regardless of DPR.
 */
export function prepareCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return ctx;
}

/** Draws a horizontal reference line (a row's zero-amplitude axis). */
export function drawZeroLine(ctx, width, y, color = "rgba(255, 255, 255, 0.12)") {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

/**
 * Plots a Float32Array of samples (values in roughly [-1, 1]) as a
 * polyline centered at `yCenter`, using `rowHeight` as the full
 * peak-to-peak pixel height available for amplitude ±1.
 */
export function plotSamples(ctx, samples, { width, yCenter, rowHeight, color, lineWidth = 2 }) {
  if (samples.length === 0) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.beginPath();
  const lastIndex = Math.max(1, samples.length - 1);
  for (let i = 0; i < samples.length; i += 1) {
    const x = (i / lastIndex) * width;
    const y = yCenter - samples[i] * (rowHeight / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export const MONO_FONT = '11px "SF Mono", "Cascadia Code", Menlo, Consolas, monospace';
