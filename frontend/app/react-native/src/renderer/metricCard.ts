// Pure helpers of the KPI tile (MetricCard), kept out of the .tsx so node:test can run them.
import type { MetricCard } from '../api/metadata';

const present = (s?: string | null): s is string => s != null && String(s).trim() !== '';

/** The period the value covers ("Last 7 days"), trimmed; '' when missing or blank. */
export const metricTimeframe = (m: MetricCard): string => (present(m.timeframe) ? m.timeframe.trim() : '');

/**
 * The tile's accessible name, in reading order: "Revenue, 12.4k €, Last 7 days, +8%, …" — the same
 * text the web and Redwood renderers give it, so the timeframe travels with the number it qualifies.
 */
export const metricA11yLabel = (m: MetricCard): string => {
  const value = [m.value, m.unit].filter(present).map((s) => String(s).trim()).join(' ');
  return [m.title, value, m.timeframe, m.trendLabel, m.description]
    .filter(present)
    .map((s) => String(s).trim())
    .join(', ');
};
