// The geometry of the hand-drawn charts (pure, tested by node's runner).

/** A single series as an SVG polyline path, and the closed path that fills the area under it
 *  (the web's mateu-trend-chart: line, optionally area-filled at low opacity). */
export function trendPaths(values: number[], w: number, h: number, pad = 4): { line: string; area: string } | null {
  const v = values.filter((n) => Number.isFinite(n));
  if (v.length === 0) return null;
  const min = Math.min(...v);
  const max = Math.max(...v);
  const span = max - min || 1;
  const step = v.length > 1 ? (w - pad * 2) / (v.length - 1) : 0;
  const pts = v.map((n, i) => [pad + i * step, h - pad - ((n - min) / span) * (h - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pts[0][0].toFixed(1)} ${h - pad} Z`;
  return { line, area };
}

/**
 * A radar chart: one spoke per label, starting at 12 o'clock, clockwise; each dataset a polygon
 * whose vertex on a spoke is its value over the largest value. `rings` concentric guide polygons.
 */
export function radarGeometry(axes: number, datasets: number[][], cx: number, cy: number, r: number, rings = 4): {
  spokes: { x: number; y: number }[];
  rings: string[];
  polygons: string[];
} {
  const n = Math.max(3, axes);
  const max = Math.max(1, ...datasets.flat().filter((x) => Number.isFinite(x)));
  const at = (i: number, f: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: cx + r * f * Math.cos(a), y: cy + r * f * Math.sin(a) };
  };
  const poly = (f: (i: number) => number) =>
    Array.from({ length: n }, (_, i) => at(i, f(i))).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return {
    spokes: Array.from({ length: n }, (_, i) => at(i, 1)),
    rings: Array.from({ length: rings }, (_, k) => poly(() => (k + 1) / rings)),
    polygons: datasets.map((d) => poly((i) => Math.max(0, d[i] ?? 0) / max)),
  };
}
