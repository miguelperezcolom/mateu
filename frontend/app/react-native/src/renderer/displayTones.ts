// The colors and glyphs DisplayRenderer.tsx picks for the display components: badge palette,
// severity themes (callout, notice), trends (stat, comparison), meter thresholds, process health
// and the stepper's states. Pure TypeScript over the theme tokens, tested by node's runner.
import { theme, themed } from '../theme.ts';

/** Icons arrive as web icon tokens ("vaadin:chart") or emoji — only emoji/plain text render natively. */
export const displayIcon = (icon?: string): string => (icon && !icon.includes(':') ? icon : '');

/** Badge palette (normal | success | warning | error | contrast), mirroring BadgeRenderer. */
export const PALETTE: Record<string, string> = themed(() => ({
  success: theme.success, warning: theme.warning, error: theme.danger, danger: theme.danger, contrast: theme.ink, normal: theme.muted,
}));

/** A chip/note color by its palette name; unknown → muted. */
export const paletteColor = (c?: string): string => PALETTE[c ?? 'normal'] ?? theme.muted;

/** A Stat's trend: its color and the glyph before the delta. Absent trend reads as "up". */
export function statTrend(trend?: string): { color: string; glyph: string } {
  const t = trend ?? 'up';
  const color = t === 'down' ? theme.danger : t === 'flat' ? theme.faint : theme.success;
  const glyph = t === 'up' ? '▲' : t === 'down' ? '▼' : '→';
  return { color, glyph };
}

/** A ComparisonCard's delta chip: ink, tinted background and mark. Absent trend reads as "flat". */
export function comparisonDelta(trend?: string): { color: string; background: string; mark: string } {
  const t = trend ?? 'flat';
  return {
    color: t === 'up' ? theme.success : t === 'down' ? theme.danger : theme.faint,
    background: t === 'up' ? 'rgba(18,183,106,.12)' : t === 'down' ? 'rgba(225,29,72,.12)' : 'rgba(0,0,0,.06)',
    mark: t === 'up' ? '▲' : t === 'down' ? '▼' : '',
  };
}

/** A CalloutCard's accent and background by theme name; anything unknown is "info". */
export function calloutColors(themeName?: string): { accent: string; background: string } {
  const t = themeName ?? 'info';
  const accent = t === 'success' ? theme.success : t === 'warning' ? theme.warning : t === 'danger' ? theme.danger : theme.primary;
  const background = t === 'success' ? theme.successBg : t === 'warning' ? theme.warningBg : t === 'danger' ? theme.dangerBg : theme.infoBg;
  return { accent, background };
}

const NOTICE_COLORS: Record<string, { bg: string; ink: string; badge: string }> = themed(() => ({
  info: { bg: theme.infoBg, ink: theme.info, badge: theme.info },
  success: { bg: theme.successBg, ink: theme.success, badge: theme.success },
  warning: { bg: theme.warningBg, ink: theme.warning, badge: theme.warning },
  danger: { bg: theme.dangerBg, ink: theme.danger, badge: theme.danger },
}));
const NOTICE_ICONS: Record<string, string> = { info: 'ℹ', success: '✓', warning: '!', danger: '!' };

/** A Notice's look: the theme (unknown → info), its colors and the icon (a declared one wins). */
export function noticeLook(themeName: unknown, icon?: unknown): {
  theme: string; colors: { bg: string; ink: string; badge: string }; icon: string;
} {
  const name = (['info', 'success', 'warning', 'danger'].includes(themeName as string) ? themeName : 'info') as string;
  return { theme: name, colors: NOTICE_COLORS[name], icon: (icon as string) || NOTICE_ICONS[name] };
}

/** A Meter's fill ratio (0..1), its color (thresholds when declared, else the accent) and caption. */
export function meterModel(m: { value?: number; max?: number; caption?: string; warnAt?: number; dangerAt?: number }): {
  value: number; ratio: number; fill: string; caption: string;
} {
  const value = m.value ?? 0;
  const max = m.max ?? 0;
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const fill = m.dangerAt != null && value >= m.dangerAt ? PALETTE.error
    : m.warnAt != null && value >= m.warnAt ? PALETTE.warning
    : m.warnAt != null || m.dangerAt != null ? PALETTE.success : theme.primary;
  return { value, ratio, fill, caption: m.caption || `${Math.round(ratio * 100)}%` };
}

/** A ProcessMonitor row's health dot: error / warning, anything else is healthy. */
export const processDotColor = (status?: string): string =>
  status === 'error' ? PALETTE.error : status === 'warning' ? PALETTE.warning : PALETTE.success;

/** A TaskProgress banner's tint: green once complete, amber while pending. */
export const taskProgressBackground = (complete: boolean): string =>
  complete ? 'rgba(18,183,106,0.1)' : 'rgba(245,158,11,0.12)';

/** One ProgressSteps step: its state and how its dot, number and connector look. */
export function stepLook(status: string | undefined, index: number): {
  status: string; done: boolean; current: boolean; muted: boolean;
  dotColor: string; borderColor: string; textColor: string; lineColor: string; glyph: string;
} {
  const s = status ?? 'upcoming';
  const done = s === 'done';
  const current = s === 'current';
  return {
    status: s,
    done,
    current,
    muted: s === 'upcoming',
    dotColor: done ? theme.primary : current ? theme.white : theme.border,
    borderColor: current ? theme.primary : 'transparent',
    textColor: done ? theme.onFill : current ? theme.primary : theme.muted,
    lineColor: done ? theme.primary : theme.border,
    glyph: done ? '✓' : String(index + 1),
  };
}
