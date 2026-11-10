/**
 * Pure helpers behind WireComponents.tsx (unit-tested): everything about the remaining wire
 * component types that can be decided without React — initials, grid columns/rows, responsive
 * grid tracks, content-layout slots, result glyphs, form-definition previews, element kinds.
 */

import { flattenColumnGroups } from './columnGroups.ts';
import { cellText as listingCellText } from './cellText.ts';

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

/** Grid columns: the GridColumn children carried in `metadata.content` (or `columns`); a column
 *  group is flattened into its columns, headed "Group · Column" (columnGroups.ts). */
export function gridColumnsOf(component: unknown): GridCol[] {
  const m = meta(component);
  const cols = flattenColumnGroups(((m['content'] ?? m['columns']) as unknown[]) ?? []);
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

export interface GridLeaf {
  id: string;
  label: string;
  align?: string;
  actionId?: string;
  dataType?: string;
  stereotype?: string;
  /** the declared width in dp (`width: 14rem`), else undefined (the default cell width) */
  width?: number;
}

/**
 * A Grid's columns as a header of TWO rows when it has GridGroupColumns: the groups (each spanning
 * its leaf columns; an ungrouped column under an empty group cell) over the leaf columns with
 * their own labels — the group's label used to be glued to each leaf ("Loan · Borrower") with no
 * group header row. `groups` is null for a grid without groups.
 */
export function gridHeader(component: unknown): { leaves: GridLeaf[]; groups: { label: string; span: number }[] | null } {
  const m = meta(component);
  const leaves: GridLeaf[] = [];
  const groups: { label: string; span: number }[] = [];
  let grouped = false;
  const leafOf = (c: unknown): GridLeaf => {
    const cm = meta(c);
    const id = ((c as Dict)['id'] as string) || (cm['id'] as string) || '';
    const w = cssLengthPx(typeof cm['width'] === 'string' ? (cm['width'] as string) : null);
    return {
      id,
      label: (cm['label'] as string) ?? id,
      align: (cm['align'] as string) || undefined,
      actionId: (cm['actionId'] as string) || undefined,
      dataType: (cm['dataType'] as string) || undefined,
      stereotype: (cm['stereotype'] as string) || undefined,
      width: w ?? undefined,
    };
  };
  const leavesOfGroup = (g: unknown): unknown[] => [
    ...(((meta(g)['columns'] as unknown[]) ?? [])),
    ...((((g as Dict)['children'] as unknown[]) ?? [])),
  ].flatMap((k) => (meta(k)['type'] === 'GridGroupColumn' ? leavesOfGroup(k) : [k]));
  for (const c of (((m['content'] ?? m['columns']) as unknown[]) ?? [])) {
    if (!c || typeof c !== 'object') continue;
    if (meta(c)['type'] === 'GridGroupColumn') {
      grouped = true;
      const kids = leavesOfGroup(c).filter((k) => k && typeof k === 'object');
      kids.forEach((k) => leaves.push(leafOf(k)));
      groups.push({ label: (meta(c)['label'] as string) ?? '', span: kids.length });
    } else {
      leaves.push(leafOf(c));
      groups.push({ label: '', span: 1 });
    }
  }
  return { leaves, groups: grouped ? groups : null };
}

/** The rows a tree grid shows: depth-first, a row's children only while it is expanded. */
export function visibleTreeRows(rows: Dict[], expanded: ReadonlySet<string>, path = '', depth = 0): { row: Dict; depth: number; key: string; hasChildren: boolean }[] {
  return rows.flatMap((row, i) => {
    const key = `${path}${i}`;
    const kids = Array.isArray(row['children']) ? (row['children'] as Dict[]) : [];
    const self = { row, depth, key, hasChildren: kids.length > 0 };
    return expanded.has(key) ? [self, ...visibleTreeRows(kids, expanded, `${key}.`, depth + 1)] : [self];
  });
}

/** Tree grids: rows carrying `children` are flattened depth-first with their depth. */
export function flattenTree(rows: Dict[], depth = 0): { row: Dict; depth: number }[] {
  return rows.flatMap((row) => [
    { row, depth },
    ...(Array.isArray(row['children']) ? flattenTree(row['children'] as Dict[], depth + 1) : []),
  ]);
}

/** A Grid cell: money and dates formatted by the column's dataType (82000000 → "82,000,000.00",
 *  an ISO date in the UI's locale), a structured value by its text, a flag as ✓. */
export function gridCellText(value: unknown, column: { dataType?: string; stereotype?: string }): string {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? '✓' : '';
  if (typeof value === 'object' && !(column.dataType === 'money' || column.stereotype === 'money')) {
    const o = value as Dict;
    return String(o['text'] ?? o['label'] ?? o['value'] ?? o['name'] ?? '');
  }
  return listingCellText(value, null, column);
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
  const threshold = cssLengthPx(stackBelow) ?? 600;
  if (width < threshold) return 1;
  const tracks = trackCount(template);
  if (tracks > 0) return tracks;
  return Math.max(1, Math.floor(width / 280));
}

/** A CSS length in px (px, rem/em at 16px, or a bare number); null when it is not one. */
export function cssLengthPx(value: string | null | undefined): number | null {
  const m = /^(\d+(?:\.\d+)?)(px|rem|em)?$/.exec((value ?? '').trim());
  if (!m) return null;
  const n = parseFloat(m[1]!);
  return m[2] === 'rem' || m[2] === 'em' ? n * 16 : n;
}

/** A simple track list ("1fr 22rem", "2fr 1fr 300px") as flex sizes: `{fr}` grows, `{px}` is fixed.
 *  Null for anything fancier (repeat(), minmax(), auto…) — callers fall back to equal columns. */
export function gridTrackSizes(template: string | null | undefined): ({ fr: number } | { px: number })[] | null {
  const tokens = (template ?? '').trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const out: ({ fr: number } | { px: number })[] = [];
  for (const t of tokens) {
    const fr = /^(\d+(?:\.\d+)?)fr$/.exec(t);
    if (fr) { out.push({ fr: parseFloat(fr[1]!) }); continue; }
    const px = cssLengthPx(t);
    if (px === null) return null;
    out.push({ px });
  }
  return out;
}

/** Children ordered by the FIRST row of `gridTemplateAreas` ("main info") matched against their
 *  `slot`, so a promoted slot listed first (for stacking) still lands in its declared column when
 *  the grid is wide. Null when the areas don't name every child exactly once. */
export function orderByAreas<T>(areas: string | null | undefined, children: T[]): T[] | null {
  const raw = (areas ?? '').trim();
  const quoted = /["']([^"']*)["']/.exec(raw);
  const firstRow = (quoted ? quoted[1]! : raw).trim().split(/\s+/).filter(Boolean);
  if (firstRow.length === 0 || firstRow.length !== children.length) return null;
  const slot = (c: T) => (((c as Dict)?.['slot'] as string) ?? '');
  const ordered = firstRow.map((name) => children.find((c) => slot(c) === name));
  if (ordered.some((c) => c === undefined) || new Set(ordered).size !== children.length) return null;
  return ordered as T[];
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
  let text = (html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n');
  // until stable: a tag split around another (`<scr<b>ipt>`) re-forms once its inner tag is gone
  let previous: string;
  do {
    previous = text;
    text = text.replace(/<[^>]*>/g, '');
  } while (text !== previous);
  return text
    // whatever is left of an unclosed tag — the result is plain text either way
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


/** A grid cell's action parameters, as mateu-table sends them: the ROW itself (`openWork` reads
 *  its fields), a crud row action (`action-on-row-*`) the row under `_clickedRow`. */
export function gridCellParameters(actionId: string, row: Record<string, unknown>): Record<string, unknown> {
  return actionId.startsWith('action-on-row-') ? { _clickedRow: row } : { ...row };
}
