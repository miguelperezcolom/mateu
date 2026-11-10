// Pure decisions of the Material look (tested by node's runner): which Paper button mode a wire
// button gets, and which colours a status tone paints a chip with.
import { theme } from '../theme.ts';

export type ButtonMode = 'contained' | 'contained-tonal' | 'outlined' | 'text';

/**
 * A wire button's Material emphasis: `buttonStyle` primary → filled (contained), secondary → tonal,
 * tertiary (and link-like styles) → text, anything else → outlined. A destructive action
 * (`color: "error"`, or a `danger`/`error` style) keeps its emphasis but is painted in the theme's
 * error colour — distinguishable from its harmless neighbours (HIG/Material).
 */
export function buttonLook(buttonStyle?: string | null, color?: string | null): { mode: ButtonMode; danger: boolean } {
  const style = (buttonStyle ?? '').toLowerCase();
  const danger = (color ?? '').toLowerCase() === 'error' || style === 'danger' || style === 'error';
  const mode: ButtonMode =
    style === 'primary' ? 'contained'
      : style === 'secondary' ? 'contained-tonal'
        : style === 'tertiary' || style === 'tertiary-inline' || style === 'link' ? 'text'
          : 'outlined';
  return { mode, danger };
}

/**
 * The colour a wire button's `color` paints it with (Lumo's button themes): error = danger,
 * success, warning, contrast (the ink) — null for normal/absent (the accent). success used to come
 * out as the accent and warning/contrast as a plain outlined button.
 */
export function buttonColor(color?: string | null): { fill: string; onFill: string } | null {
  switch ((color ?? '').toLowerCase()) {
    case 'error': case 'danger': return { fill: theme.danger, onFill: theme.onFill };
    case 'success': return { fill: theme.success, onFill: theme.onFill };
    case 'warning': return { fill: theme.warning, onFill: theme.onFill };
    case 'contrast': return { fill: theme.ink, onFill: theme.surface };
    default: return null;
  }
}

/** A wire button's `size`: small (dense), large, or the normal one. */
export function buttonSize(size?: string | null): 'small' | 'normal' | 'large' {
  const s = (size ?? '').toLowerCase();
  return s === 'small' ? 'small' : s === 'large' ? 'large' : 'normal';
}

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** A tone name off the wire (GridColumn.tones values, StatusType, badge colours) → a Tone. */
export function toneOf(name?: string | null): Tone {
  const t = (name ?? '').toLowerCase();
  if (t === 'success' || t === 'ok' || t === 'green') return 'success';
  if (t === 'warning' || t === 'warn' || t === 'amber') return 'warning';
  if (t === 'danger' || t === 'error' || t === 'red') return 'danger';
  if (t === 'info' || t === 'primary' || t === 'blue') return 'info';
  return 'neutral';
}

/** A tone's chip colours: tinted container + its own ink (AA on that container, see theme.test). */
export function toneColors(tone: Tone): { background: string; ink: string } {
  switch (tone) {
    case 'success': return { background: theme.successBg, ink: theme.success };
    case 'warning': return { background: theme.warningBg, ink: theme.warning };
    case 'danger': return { background: theme.dangerBg, ink: theme.danger };
    case 'info': return { background: theme.infoBg, ink: theme.info };
    default: return { background: theme.divider, ink: theme.muted };
  }
}

export interface BadgeLook {
  background: string;
  ink: string;
  /** a pill is fully rounded; the default badge has the chip's small radius */
  pill: boolean;
  small: boolean;
}

/**
 * A wire Badge's look, as Lumo's badge themes: `color` normal (the default — the PRIMARY tint, so
 * it reads apart from a contrast badge), success, error, warning, contrast (the ink tint);
 * `primary` = FILLED with the tone's colour; `pill` fully rounded; `small` a smaller chip. Every
 * one of them used to come out as the same grey chip.
 */
export function badgeLook(m: { color?: unknown; primary?: unknown; pill?: unknown; small?: unknown }): BadgeLook {
  const color = String(m.color ?? '').toLowerCase();
  const tinted = color === 'contrast'
    ? { background: theme.divider, ink: theme.ink }
    : toneColors(color === '' || color === 'normal' || color === 'primary' ? 'info' : toneOf(color));
  const filled = m.primary === true;
  return {
    background: filled ? tinted.ink : tinted.background,
    ink: filled ? theme.onFill : tinted.ink,
    pill: m.pill === true,
    small: m.small === true,
  };
}
