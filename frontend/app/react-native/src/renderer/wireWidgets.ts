/**
 * Pure helpers behind WireComponents.tsx (unit-tested): everything about the remaining wire
 * component types that can be decided without React — initials, grid columns/rows, responsive
 * grid tracks, content-layout slots, result glyphs, form-definition previews, element kinds.
 */

type Dict = Record<string, unknown>;
const meta = (c: unknown): Dict => ((c as Dict)?.['metadata'] as Dict) ?? {};

// ── Avatar ──────────────────────────────────────────────────────────────────

/** The abbreviation the server sent, else the initials of the first two words of the name. */
export function initials(name?: string | null, abbreviation?: string | null): string {
  if (abbreviation && abbreviation.trim()) return abbreviation.trim().slice(0, 3).toUpperCase();
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** A stable background colour per name (same person → same colour, as on the web). */
const AVATAR_COLORS = ['#2763B1', '#177A23', '#B85E04', '#7C3AED', '#0E7490', '#BE185D', '#4D7C0F', '#9A3412'];
export function avatarColor(seed: string | null | undefined, colorIndex?: number | null): string {
  if (typeof colorIndex === 'number') return AVATAR_COLORS[Math.abs(colorIndex) % AVATAR_COLORS.length]!;
  let h = 0;
  for (const ch of seed ?? '') h = (h * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]!;
}

/** The avatars shown + the "+N" overflow (maxItemsVisible ≤ 0 = all). */
export function avatarGroupSplit<T>(avatars: T[], maxItemsVisible: number): { shown: T[]; overflow: number } {
  const max = maxItemsVisible > 0 ? maxItemsVisible : avatars.length;
  return { shown: avatars.slice(0, max), overflow: Math.max(0, avatars.length - max) };
}

// ── Grid ────────────────────────────────────────────────────────────────────

export interface GridCol {
  id: string;
  label: string;
  align?: string;
  actionId?: string;
}

/** Grid columns: the GridColumn children carried in `metadata.content` (or `columns`). */
export function gridColumnsOf(component: unknown): GridCol[] {
  const m = meta(component);
  const cols = ((m['content'] ?? m['columns']) as unknown[]) ?? [];
  return cols
    .filter((c) => c && typeof c === 'object')
    .map((c) => {
      const cm = meta(c);
      const id = ((c as Dict)['id'] as string) || (cm['id'] as string) || '';
      return {
        id,
        label: (cm['label'] as string) ?? id,
        align: (cm['align'] as string) || undefined,
        actionId: (cm['actionId'] as string) || undefined,
      };
    });
}

/** Rows: the component's data page (search results), the state override, else the metadata page —
 *  the same precedence the web's neutral table uses. */
export function gridRowsOf(component: unknown, state: Dict | undefined, data: unknown): Dict[] {
  const id = (component as Dict)?.['id'] as string | undefined;
  const fromData = id ? ((data as Dict)?.[id] as Dict)?.['page'] as Dict | undefined : undefined;
  if (fromData && Array.isArray(fromData['content'])) return fromData['content'] as Dict[];
  if (id && state && Array.isArray(state[id])) return state[id] as Dict[];
  const page = meta(component)['page'] as Dict | undefined;
  return (page?.['content'] as Dict[]) ?? [];
}

/** Tree grids: rows carrying `children` are flattened depth-first with their depth. */
export function flattenTree(rows: Dict[], depth = 0): { row: Dict; depth: number }[] {
  return rows.flatMap((row) => [
    { row, depth },
    ...(Array.isArray(row['children']) ? flattenTree(row['children'] as Dict[], depth + 1) : []),
  ]);
}

export function cellText(row: Dict, colId: string): string {
  const v = row?.[colId];
  if (v == null) return '';
  if (typeof v === 'object') {
    const o = v as Dict;
    return String(o['text'] ?? o['label'] ?? o['value'] ?? o['name'] ?? '');
  }
  if (typeof v === 'boolean') return v ? '✓' : '';
  return String(v);
}

// ── ResponsiveGrid / BoardLayout ────────────────────────────────────────────

/** Number of tracks a CSS grid-template-columns declares: `repeat(3, 1fr)` → 3, `2fr 1fr` → 2,
 *  `repeat(auto-fit, …)` → 0 (auto: decided by width). */
export function trackCount(template: string | null | undefined): number {
  const t = (template ?? '').trim();
  if (!t) return 0;
  const rep = /^repeat\(\s*(\d+)\s*,/.exec(t);
  if (rep) return parseInt(rep[1]!, 10);
  if (/auto-(fit|fill)/.test(t)) return 0;
  // split on whitespace outside parentheses
  let depth = 0;
  let count = 0;
  let inToken = false;
  for (const ch of t) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      inToken = false;
    } else if (!inToken) {
      inToken = true;
      count++;
    }
  }
  return count;
}

/** Columns to lay a responsive grid out in at `width` px: stacked (1) below `stackBelow` (default
 *  600px — a phone in portrait), else the declared tracks, else as many 280px columns as fit. */
export function responsiveColumns(template: string | null | undefined, width: number, stackBelow?: string | null): number {
  const threshold = stackBelow && /^\d+(px)?$/.test(stackBelow.trim()) ? parseInt(stackBelow, 10) : 600;
  if (width < threshold) return 1;
  const tracks = trackCount(template);
  if (tracks > 0) return tracks;
  return Math.max(1, Math.floor(width / 280));
}

// ── ContentLayout ───────────────────────────────────────────────────────────

/** Children partitioned by slot prefix (main-N / aside-N / footer-N); unslotted → main. */
export function contentSlots<T>(children: T[]): { main: T[]; aside: T[]; footer: T[] } {
  const slot = (c: T) => (((c as Dict)?.['slot'] as string) ?? '');
  return {
    main: children.filter((c) => !slot(c).startsWith('aside-') && !slot(c).startsWith('footer-')),
    aside: children.filter((c) => slot(c).startsWith('aside-')),
    footer: children.filter((c) => slot(c).startsWith('footer-')),
  };
}

// ── Result ──────────────────────────────────────────────────────────────────

export function resultLook(resultType: string | null | undefined): { glyph: string; tone: 'success' | 'info' | 'warning' | 'danger' | 'muted' } {
  switch (resultType) {
    case 'Success':
      return { glyph: '✓', tone: 'success' };
    case 'Warning':
      return { glyph: '!', tone: 'warning' };
    case 'Error':
      return { glyph: '✕', tone: 'danger' };
    case 'Ignored':
      return { glyph: '–', tone: 'muted' };
    default:
      return { glyph: 'i', tone: 'info' };
  }
}

/** What tapping a Destination does: open a URL, navigate in-app, or run an action. */
export function destinationIntent(d: Dict | null | undefined): { kind: 'url' | 'route' | 'action' | 'none'; target: string } {
  if (!d) return { kind: 'none', target: '' };
  const value = ((d['value'] as string) || (d['id'] as string) || '').trim();
  const type = d['type'] as string;
  if (!value) return { kind: 'none', target: '' };
  if (type === 'ActionId') return { kind: 'action', target: value };
  if (type === 'Url') return /^[a-z]+:/i.test(value) ? { kind: 'url', target: value } : { kind: 'route', target: value };
  if (type === 'View' || type === 'Component') return { kind: 'route', target: value };
  return /^[a-z]+:/i.test(value) ? { kind: 'url', target: value } : { kind: 'route', target: value };
}

// ── FormEditor ──────────────────────────────────────────────────────────────

export interface FormDefinitionPreview {
  name: string;
  description?: string;
  fields: { id: string; label: string; dataType: string; stereotype?: string; required?: boolean; description?: string }[];
}

export function parseFormDefinition(value: string | null | undefined): FormDefinitionPreview {
  try {
    const d = JSON.parse(value || '{}') as Dict;
    const fields = Array.isArray(d['fields']) ? (d['fields'] as Dict[]) : [];
    return {
      name: (d['name'] as string) ?? '',
      description: (d['description'] as string) || undefined,
      fields: fields.map((f) => ({
        id: String(f['id'] ?? ''),
        label: String(f['label'] ?? f['id'] ?? ''),
        dataType: String(f['dataType'] ?? 'string'),
        stereotype: f['stereotype'] && f['stereotype'] !== 'regular' ? String(f['stereotype']) : undefined,
        required: f['required'] === true,
        description: (f['description'] as string) || undefined,
      })),
    };
  } catch {
    return { name: '', fields: [] };
  }
}

// ── Element ─────────────────────────────────────────────────────────────────

export type ElementKind = 'heading' | 'paragraph' | 'inline' | 'link' | 'image' | 'rule' | 'break' | 'list' | 'listItem' | 'block' | 'custom';

/** How a web element maps to a native one. Custom elements (a dash in the tag) cannot run natively:
 *  they degrade to their text content. */
export function elementKind(name: string | null | undefined): ElementKind {
  const n = (name ?? '').toLowerCase();
  if (n.includes('-')) return 'custom';
  if (/^h[1-6]$/.test(n)) return 'heading';
  if (n === 'p' || n === 'pre' || n === 'blockquote') return 'paragraph';
  if (['span', 'strong', 'b', 'em', 'i', 'small', 'code', 'label', 'mark', 'u', 's'].includes(n)) return 'inline';
  if (n === 'a') return 'link';
  if (n === 'img') return 'image';
  if (n === 'hr') return 'rule';
  if (n === 'br') return 'break';
  if (n === 'ul' || n === 'ol') return 'list';
  if (n === 'li') return 'listItem';
  return 'block';
}

/** Strips markup to readable text (an `html: true` element's content). */
export function textOfHtml(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    // a tag split around another (`<scr<b>ipt>`) re-forms once its inner tag is gone: and
    // whatever is left of an unclosed one is dropped too — the result is plain text either way
    .replace(/<[^>]*>/g, '')
    .replace(/</g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Menus (MenuBar / ContextMenu / Directory) ───────────────────────────────

export interface MenuOptionLike {
  label?: string;
  actionId?: string;
  route?: string;
  path?: string;
  consumedRoute?: string;
  serverSideType?: string;
  submenus?: MenuOptionLike[];
  separator?: boolean;
  disabled?: boolean;
}

/** What tapping a menu option does. */
export function menuIntent(o: MenuOptionLike): { kind: 'action' | 'route' | 'submenu' | 'none'; target: string } {
  if (o.separator || o.disabled) return { kind: 'none', target: '' };
  if (o.submenus && o.submenus.length > 0) return { kind: 'submenu', target: '' };
  if (o.actionId) return { kind: 'action', target: o.actionId };
  const route = o.route ?? o.path;
  if (route != null && route !== '') return { kind: 'route', target: route };
  return { kind: 'none', target: '' };
}

