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
