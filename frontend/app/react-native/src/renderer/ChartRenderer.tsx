import React from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import { Text } from '../ui/Text';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { radarGeometry, trendPaths } from './chartGeometry';
import { cssToRn } from '../core/cssStyle';
import { theme, themed } from '../theme';
import { chartTextAlternative, formatTick } from '../core/uxRules';

/** ChartDto renderer (bar/line/pie families) on react-native-svg — same palette-by-index
 *  approach as the other native renderers; unknown chart types fall back to bars. */

// Categorical series colours: the Okabe-Ito colour-blind-safe set (minus its yellow, unreadable on
// white). The old palette started with the brand red — the error colour — so every first series
// read as "bad", and its first two entries were both blues once the accent became blue.
const PALETTE = themed(() => ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#D55E00', '#56B4E9', theme.muted, theme.ink]);

interface Dataset {
  label?: string;
  data?: number[];
}

interface Props {
  metadata: Record<string, unknown>;
  /** the component's inline style: its declared width/height (`width: 22rem; height: 240px`) */
  style?: string;
}

// the drawing's own coordinate space; the SVG scales to the width the chart really has
const W = 340;
const H = 200;
const PAD = 28;

export function ChartRenderer({ metadata, style }: Props) {
  const chartType = String(metadata['chartType'] ?? 'bar');
  const chartData = (metadata['chartData'] as Record<string, unknown>) ?? {};
  const labels = (chartData['labels'] as string[]) ?? [];
  const datasets = ((chartData['datasets'] as Dataset[]) ?? []).filter((d) => (d.data?.length ?? 0) > 0);
  if (datasets.length === 0) return null;

  const isPie = chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea';
  const isRadar = chartType === 'radar';
  const isLine = chartType === 'line' || chartType === 'scatter';
  // a declared width is kept (bounded by the screen): four 22rem charts in a wrapping row each
  // take their own 22rem — they used to be fixed 340px drawings overflowing equal cells
  const declared = cssToRn(style ?? '', CHART_BOX);
  const box = [styles.box, typeof declared['width'] === 'number' || typeof declared['width'] === 'string' ? { width: declared['width'] as DimensionValue } : styles.boxFill, { maxWidth: '100%' as const }];

  const max = Math.max(0, ...datasets.flatMap((d) => d.data ?? []));
  return (
    // RN-11: the chart is an image to a screen reader — it gets a text alternative that carries
    // the data (WCAG 1.1.1), and sighted users get the scale (the top value) the bars are read against.
    <View style={box} accessible accessibilityRole="image" accessibilityLabel={chartTextAlternative(labels, datasets, isPie || isRadar)}>
      {!isPie && !isRadar && <Text style={styles.yMax} importantForAccessibility="no">{formatTick(max)}</Text>}
      {isPie ? <PieChart values={datasets[0].data!} doughnut={chartType === 'doughnut'} />
        : isRadar ? <RadarChart labels={labels} datasets={datasets} />
          : isLine ? <LineChart labels={labels} datasets={datasets} /> : <BarChart labels={labels} datasets={datasets} />}
      {!isPie && !isRadar && (
        <View style={styles.xLabels}>
          {labels.map((l, i) => (
            <Text key={i} style={styles.xLabel} numberOfLines={1}>{l}</Text>
          ))}
        </View>
      )}
      <View style={styles.legend}>
        {(isPie ? labels : datasets.map((d) => d.label ?? '')).map((entry, i) =>
          entry ? (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: PALETTE[i % PALETTE.length] }]} />
              <Text style={styles.legendText}>{entry}</Text>
            </View>
          ) : null,
        )}
      </View>
    </View>
  );
}

function BarChart({ labels, datasets }: { labels: string[]; datasets: Dataset[] }) {
  const max = Math.max(1, ...datasets.flatMap((d) => d.data ?? []));
  const groups = labels.length || datasets[0].data!.length;
  const groupWidth = (W - PAD) / groups;
  const barWidth = Math.max(4, (groupWidth - 8) / datasets.length);
  return (
    <View style={styles.canvas}><Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <Path d={`M${PAD} 0 V${H - PAD} H${W}`} stroke={theme.border} strokeWidth={1} fill="none" />
      {datasets.map((ds, di) =>
        (ds.data ?? []).map((v, i) => {
          const h = ((H - PAD - 4) * v) / max;
          return (
            <Rect
              key={`${di}-${i}`}
              x={PAD + i * groupWidth + 4 + di * barWidth}
              y={H - PAD - h}
              width={barWidth - 2}
              height={h}
              fill={PALETTE[di % PALETTE.length]}
              rx={2}
            />
          );
        }),
      )}
    </Svg></View>
  );
}

function LineChart({ labels, datasets }: { labels: string[]; datasets: Dataset[] }) {
  const max = Math.max(1, ...datasets.flatMap((d) => d.data ?? []));
  const n = Math.max(2, labels.length || datasets[0].data!.length);
  const stepX = (W - PAD - 8) / (n - 1);
  return (
    <View style={styles.canvas}><Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <Path d={`M${PAD} 0 V${H - PAD} H${W}`} stroke={theme.border} strokeWidth={1} fill="none" />
      {datasets.map((ds, di) => {
        const points = (ds.data ?? [])
          .map((v, i) => `${PAD + i * stepX},${H - PAD - ((H - PAD - 4) * v) / max}`)
          .join(' ');
        return <Polyline key={di} points={points} stroke={PALETTE[di % PALETTE.length]} strokeWidth={2} fill="none" />;
      })}
    </Svg></View>
  );
}

function PieChart({ values, doughnut }: { values: number[]; doughnut: boolean }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) / 2 - 8;
  let angle = -Math.PI / 2;
  const slices = values.map((v, i) => {
    const sweep = (v / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return <Path key={i} d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={PALETTE[i % PALETTE.length]} />;
  });
  return (
    <View style={styles.canvas}><Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      {slices}
      {doughnut && <Circle cx={cx} cy={cy} r={r * 0.55} fill={theme.white} />}
    </Svg></View>
  );
}

/** A radar: one spoke per label, the guide rings, one translucent polygon per dataset. */
function RadarChart({ labels, datasets }: { labels: string[]; datasets: Dataset[] }) {
  const cx = W / 2;
  const cy = H / 2;
  const r = H / 2 - 22;
  const g = radarGeometry(labels.length, datasets.map((d) => d.data ?? []), cx, cy, r);
  return (
    <View style={styles.canvas}><Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      {g.rings.map((points, i) => <Polygon key={`r${i}`} points={points} stroke={theme.border} strokeWidth={1} fill="none" />)}
      {g.spokes.map((p, i) => <Line key={`s${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={theme.border} strokeWidth={1} />)}
      {g.polygons.map((points, i) => (
        <Polygon key={`p${i}`} points={points} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.18} />
      ))}
      {g.spokes.map((p, i) => (
        <SvgText key={`l${i}`} x={cx + (p.x - cx) * 1.12} y={cy + (p.y - cy) * 1.12 + 4} fontSize={11} fill={theme.faint}
          textAnchor={Math.abs(p.x - cx) < 4 ? 'middle' : p.x > cx ? 'start' : 'end'}>
          {labels[i] ?? ''}
        </SvgText>
      ))}
    </Svg></View>
  );
}

/** A TrendChart (the web's mateu-trend-chart): one series as a line, area-filled when `area`. */
export function TrendLine({ values, color, area }: { values: number[]; color: string; area: boolean }) {
  const paths = trendPaths(values, W, 80, 4);
  if (!paths) return null;
  return (
    <View style={styles.trendCanvas}><Svg width="100%" height="100%" viewBox={`0 0 ${W} 80`} preserveAspectRatio="none">
      {area && <Path d={paths.area} fill={color} fillOpacity={0.12} />}
      <Path d={paths.line} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </Svg></View>
  );
}

const CHART_BOX = new Set(['width', 'max-width']);

const styles = themed(() => StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: 8 },
  boxFill: { width: W },
  canvas: { width: '100%', aspectRatio: W / H },
  trendCanvas: { width: '100%', height: 64 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: theme.muted },
  xLabels: { flexDirection: 'row', width: '100%', paddingLeft: `${(PAD / W) * 100}%`, marginTop: 2 },
  xLabel: { flex: 1, fontSize: 11, color: theme.faint, textAlign: 'center' },
  yMax: { alignSelf: 'flex-start', fontSize: 11, color: theme.faint, marginBottom: 2 },
}));
