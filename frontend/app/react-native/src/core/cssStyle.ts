// A component's inline CSS (`style` on the wire) as a React Native style, for the SAFE subset a
// box can take: background, padding, margin, border, radius, sizes, flex-grow, gap, opacity.
// Pure (tested by node's runner). Anything else — calc(), min(), grid, gradients, transforms — is
// left out rather than guessed: a wrong guess breaks the layout, a missing one only looks plainer.
//
// Colours: a Lumo custom property (`var(--lumo-contrast-5pct, #f3f3f3)`) becomes the matching
// THEME token, so a tinted block follows the light/dark scheme like on the web; a literal colour is
// kept as written.
import { theme } from '../theme.ts';

export type RnStyle = Record<string, string | number>;

const LUMO_COLORS: Record<string, () => string> = {
  'lumo-base-color': () => theme.surface,
  'lumo-contrast-5pct': () => theme.background,
  'lumo-contrast-10pct': () => theme.divider,
  'lumo-contrast-20pct': () => theme.border,
  'lumo-contrast-30pct': () => theme.border,
  'lumo-contrast-50pct': () => theme.faint,
  'lumo-contrast-60pct': () => theme.muted,
  'lumo-contrast-70pct': () => theme.muted,
  'lumo-contrast-80pct': () => theme.ink,
  'lumo-contrast-90pct': () => theme.ink,
  'lumo-contrast': () => theme.ink,
  'lumo-body-text-color': () => theme.ink,
  'lumo-header-text-color': () => theme.ink,
  'lumo-secondary-text-color': () => theme.muted,
  'lumo-tertiary-text-color': () => theme.faint,
  'lumo-primary-color': () => theme.primary,
  'lumo-primary-text-color': () => theme.primary,
  'lumo-primary-color-10pct': () => theme.primaryContainer,
  'lumo-primary-color-50pct': () => theme.primary,
  'lumo-success-color': () => theme.success,
  'lumo-success-text-color': () => theme.success,
  'lumo-success-color-10pct': () => theme.successBg,
  'lumo-warning-color': () => theme.warning,
  'lumo-warning-text-color': () => theme.warning,
  'lumo-warning-color-10pct': () => theme.warningBg,
  'lumo-error-color': () => theme.danger,
  'lumo-error-text-color': () => theme.danger,
  'lumo-error-color-10pct': () => theme.dangerBg,
};

const LUMO_SPACE: Record<string, number> = {
  'lumo-space-xs': 4, 'lumo-space-s': 8, 'lumo-space-m': 16, 'lumo-space-l': 24, 'lumo-space-xl': 40,
};

const LUMO_RADIUS: Record<string, number> = {
  'lumo-border-radius-s': 4, 'lumo-border-radius-m': 8, 'lumo-border-radius-l': 12, 'lumo-border-radius': 8,
};

/** A colour value: a Lumo variable (its theme token, else its fallback), a hex/rgb()/named colour. */
export function cssColor(value: string): string | null {
  const v = value.trim();
  const variable = /^var\(\s*--([\w-]+)\s*(?:,\s*(.+))?\)$/.exec(v);
  if (variable) {
    const token = LUMO_COLORS[variable[1]];
    if (token) return token();
    return variable[2] ? cssColor(variable[2]) : null;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(v) || /^(rgb|rgba|hsl|hsla)\([^()]*\)$/i.test(v) || /^[a-z]+$/i.test(v)) {
    return v === 'none' || v === 'inherit' || v === 'initial' || v === 'unset' ? null : v;
  }
  return null;
}

/** A length: px, rem/em (16px), %, a bare 0, a Lumo space/radius variable; null otherwise. */
export function cssLength(value: string): number | string | null {
  const v = value.trim();
  const variable = /^var\(\s*--([\w-]+)\s*(?:,\s*(.+))?\)$/.exec(v);
  if (variable) {
    const known = LUMO_SPACE[variable[1]] ?? LUMO_RADIUS[variable[1]];
    if (known !== undefined) return known;
    return variable[2] ? cssLength(variable[2]) : null;
  }
  const m = /^(-?(?:\d+\.?\d*|\.\d+))(px|rem|em|%)?$/.exec(v);
  if (!m) return v === 'auto' ? 'auto' : null;
  const n = parseFloat(m[1]);
  if (m[2] === '%') return `${n}%`;
  if (m[2] === 'rem' || m[2] === 'em') return n * 16;
  if (!m[2] && n !== 0) return null; // a unitless non-zero length is not CSS
  return n;
}

/** Splits a declaration value on spaces that are not inside parentheses. */
function tokens(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value.trim()) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (current) out.push(current);
      current = '';
    } else current += ch;
  }
  if (current) out.push(current);
  return out;
}

/** The four sides of a 1–4 value box shorthand (top, right, bottom, left). */
function box(value: string): (number | string)[] | null {
  const parts = tokens(value).map(cssLength);
  if (parts.length === 0 || parts.length > 4 || parts.some((p) => p === null)) return null;
  const [t, r = t, b = t, l = r] = parts as (number | string)[];
  return [t, r, b, l];
}

const SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const;

/** `1px solid #ddd` → width + colour (style keyword ignored: RN draws solid/dashed/dotted only). */
function border(value: string): { width?: number; color?: string; style?: string } | null {
  const out: { width?: number; color?: string; style?: string } = {};
  for (const t of tokens(value)) {
    if (/^(solid|dashed|dotted)$/.test(t)) { out.style = t; continue; }
    if (t === 'none' || t === '0') { out.width = 0; continue; }
    const len = cssLength(t);
    if (typeof len === 'number') { out.width = len; continue; }
    const color = cssColor(t);
    if (color) out.color = color;
  }
  return out.width === undefined && !out.color ? null : out;
}

/** The declarations of an inline style string: `a: b; c: d` → [[a, b], [c, d]]. */
export function cssDeclarations(css: string | null | undefined): [string, string][] {
  const out: [string, string][] = [];
  for (const decl of (css ?? '').split(';')) {
    const i = decl.indexOf(':');
    if (i <= 0) continue;
    const prop = decl.slice(0, i).trim().toLowerCase();
    const value = decl.slice(i + 1).replace(/!important/g, '').trim();
    if (prop && value) out.push([prop, value]);
  }
  return out;
}

/**
 * The React Native style of an inline CSS string. `only` restricts it to some properties (a caller
 * that lays a box out itself takes only its looks, say).
 */
export function cssToRn(css: string | null | undefined, only?: ReadonlySet<string>): RnStyle {
  const style: RnStyle = {};
  for (const [prop, value] of cssDeclarations(css)) {
    if (only && !only.has(prop)) continue;
    switch (prop) {
      case 'background':
      case 'background-color': {
        const color = cssColor(value);
        if (color) style.backgroundColor = color;
        break;
      }
      case 'color': {
        const color = cssColor(value);
        if (color) style.color = color;
        break;
      }
      case 'padding':
      case 'margin': {
        const sides = box(value);
        if (sides) SIDES.forEach((s, i) => { style[`${prop}${s}`] = sides[i]; });
        break;
      }
      case 'padding-block':
      case 'margin-block':
      case 'padding-inline':
      case 'margin-inline': {
        const [base, axis] = prop.split('-');
        const parts = tokens(value).map(cssLength);
        if (parts.length < 1 || parts.length > 2 || parts.some((p) => p === null)) break;
        const [a, b = a] = parts as (number | string)[];
        if (axis === 'block') { style[`${base}Top`] = a; style[`${base}Bottom`] = b; }
        else { style[`${base}Left`] = a; style[`${base}Right`] = b; }
        break;
      }
      case 'border':
      case 'border-top':
      case 'border-right':
      case 'border-bottom':
      case 'border-left': {
        const b = border(value);
        if (!b) break;
        const side = prop === 'border' ? '' : prop.slice(7, 8).toUpperCase() + prop.slice(8);
        if (b.width !== undefined) style[`border${side}Width`] = b.width;
        if (b.color) style[`border${side}Color`] = b.color;
        if (b.style && b.style !== 'solid' && !side) style.borderStyle = b.style;
        break;
      }
      case 'border-radius': {
        const r = cssLength(tokens(value)[0] ?? '');
        if (typeof r === 'number') style.borderRadius = r;
        else if (r === '50%') style.borderRadius = 9999;
        break;
      }
      case 'width':
      case 'height':
      case 'min-width':
      case 'max-width':
      case 'min-height':
      case 'max-height':
      case 'gap':
      case 'row-gap':
      case 'column-gap': {
        const len = cssLength(value);
        if (len === null || (len === 'auto' && prop !== 'width' && prop !== 'height')) break;
        style[prop.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())] = len;
        break;
      }
      case 'flex-grow':
      case 'flex-shrink': {
        const n = Number(value);
        if (Number.isFinite(n)) style[prop === 'flex-grow' ? 'flexGrow' : 'flexShrink'] = n;
        break;
      }
      case 'flex': {
        // `2`, `1 1 0`, `0 0 22rem` — calc()/auto bases are left out
        const parts = tokens(value);
        const grow = Number(parts[0]);
        if (!Number.isFinite(grow)) break;
        style.flexGrow = grow;
        if (parts[1] !== undefined && Number.isFinite(Number(parts[1]))) style.flexShrink = Number(parts[1]);
        const basis = parts[2] !== undefined ? cssLength(parts[2]) : parts.length === 1 ? 0 : null;
        if (basis !== null && basis !== 'auto') style.flexBasis = basis;
        break;
      }
      case 'opacity': {
        const n = Number(value);
        if (Number.isFinite(n)) style.opacity = n;
        break;
      }
      case 'align-self': {
        const map: Record<string, string> = { center: 'center', start: 'flex-start', 'flex-start': 'flex-start', end: 'flex-end', 'flex-end': 'flex-end', stretch: 'stretch', baseline: 'baseline' };
        if (map[value]) style.alignSelf = map[value];
        break;
      }
      default:
        break;
    }
  }
  return style;
}

/** The looks of a box (colour, padding, border, radius) — never its size or flex. */
export const BOX_LOOKS = new Set([
  'background', 'background-color', 'padding', 'padding-block', 'padding-inline', 'border', 'border-top',
  'border-right', 'border-bottom', 'border-left', 'border-radius', 'opacity', 'margin', 'margin-block', 'margin-inline',
]);

/** Sizes a box declares (width, height and their bounds). */
export const BOX_SIZES = new Set(['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height']);
