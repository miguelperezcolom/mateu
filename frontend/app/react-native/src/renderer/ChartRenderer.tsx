import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { theme } from '../theme';
import { chartTextAlternative, formatTick } from '../core/uxRules';

/** ChartDto renderer (bar/line/pie families) on react-native-svg — same palette-by-index
 *  approach as the other native renderers; unknown chart types fall back to bars. */

// Categorical series colours: the Okabe-Ito colour-blind-safe set (minus its yellow, unreadable on
// white). The old palette started with the brand red — the error colour — so every first series
// read as "bad", and its first two entries were both blues once the accent became blue.
const PALETTE = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#D55E00', '#56B4E9', theme.muted, theme.ink];

interface Dataset {
  label?: string;
  data?: number[];
}

interface Props {
  metadata: Record<string, unknown>;
}

const W = 340;
const H = 200;
const PAD = 28;

export function ChartRenderer({ metadata }: Props) {
  const chartType = String(metadata['chartType'] ?? 'bar');
  const chartData = (metadata['chartData'] as Record<string, unknown>) ?? {};
  const labels = (chartData['labels'] as string[]) ?? [];
  const datasets = ((chartData['datasets'] as Dataset[]) ?? []).filter((d) => (d.data?.length ?? 0) > 0);
  if (datasets.length === 0) return null;

  const isPie = chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea';
  const isLine = chartType === 'line' || chartType === 'radar' || chartType === 'scatter';

  const max = Math.max(0, ...datasets.flatMap((d) => d.data ?? []));
  return (
    // RN-11: the chart is an image to a screen reader — it gets a text alternative that carries
    // the data (WCAG 1.1.1), and sighted users get the scale (the top value) the bars are read against.
    <View style={styles.box} accessible accessibilityRole="image" accessibilityLabel={chartTextAlternative(labels, datasets, isPie)}>
      {!isPie && <Text style={styles.yMax} importantForAccessibility="no">{formatTick(max)}</Text>}
      {isPie ? <PieChart values={datasets[0].data!} doughnut={chartType === 'doughnut'} /> : isLine ? <LineChart labels={labels} datasets={datasets} /> : <BarChart labels={labels} datasets={datasets} />}
      {!isPie && (
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
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
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
    </Svg>
  );
}

function LineChart({ labels, datasets }: { labels: string[]; datasets: Dataset[] }) {
  const max = Math.max(1, ...datasets.flatMap((d) => d.data ?? []));
  const n = Math.max(2, labels.length || datasets[0].data!.length);
  const stepX = (W - PAD - 8) / (n - 1);
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Path d={`M${PAD} 0 V${H - PAD} H${W}`} stroke={theme.border} strokeWidth={1} fill="none" />
      {datasets.map((ds, di) => {
        const points = (ds.data ?? [])
          .map((v, i) => `${PAD + i * stepX},${H - PAD - ((H - PAD - 4) * v) / max}`)
          .join(' ');
        return <Polyline key={di} points={points} stroke={PALETTE[di % PALETTE.length]} strokeWidth={2} fill="none" />;
      })}
    </Svg>
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
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {slices}
      {doughnut && <Circle cx={cx} cy={cy} r={r * 0.55} fill={theme.white} />}
    </Svg>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: 8 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: theme.muted },
  xLabels: { flexDirection: 'row', width: W, paddingLeft: PAD, marginTop: 2 },
  xLabel: { flex: 1, fontSize: 11, color: theme.faint, textAlign: 'center' },
  yMax: { alignSelf: 'flex-start', fontSize: 11, color: theme.faint, marginBottom: 2 },
});
