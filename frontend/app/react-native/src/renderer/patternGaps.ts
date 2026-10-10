/**
 * Pure logic behind the "Redwood pattern gaps" wire pieces, kept free of react-native imports so it
 * runs under `node --test`:
 *
 *  - A2 `PageDto.switcher` — the record/context switcher in the page header: option filtering for
 *    the searchable variant, the current value's label and the dispatched action;
 *  - A3 `HeroSectionDto.tone` — the shared dark-band palette (our own hues, not Oracle's);
 *  - A4 the foldout panel's `summary-N` slot;
 *  - A5 `CrudlDto.preSearch` — shown instead of the results until the first search answers;
 *  - the overlay stack: a Drawer/Dialog re-sent with the SAME id while open refreshes in place.
 */

// ── A2 record / context switcher ─────────────────────────────────────────────────────────

export interface SwitcherOption {
  value?: unknown;
  label?: string | null;
  description?: string | null;
  disabled?: boolean;
}

export interface RecordSwitcher {
  options?: SwitcherOption[] | null;
  value?: string | null;
  type?: string | null; // "object" | "context" — semantic only
  label?: string | null;
  searchable?: boolean;
  disabled?: boolean;
  actionId?: string | null;
}

/** The action a pick dispatches and its parameter name (Java RecordSwitcherSupplier). */
export const SWITCHER_ACTION_ID = '_switchRecord';
export const SWITCHER_VALUE_PARAMETER = '_record';

const optionLabel = (o: SwitcherOption): string => String(o.label ?? o.value ?? '');

/** The switcher's options, or null when the page carries none worth drawing. */
export function switcherOf(metadata: Record<string, unknown> | null | undefined): RecordSwitcher | null {
  const s = metadata?.['switcher'] as RecordSwitcher | null | undefined;
  if (!s || typeof s !== 'object') return null;
  if (!Array.isArray(s.options) || s.options.length === 0) return null;
  return s;
}

/** Label shown on the closed selector: the current value's option label, else the raw value. */
export function switcherCurrentLabel(s: RecordSwitcher): string {
  const current = (s.options ?? []).find((o) => String(o.value ?? '') === String(s.value ?? ''));
  return current ? optionLabel(current) : String(s.value ?? '');
}

/** Type-to-filter: case/diacritic-insensitive containment over label + description; every word must match. */
export function filterSwitcherOptions(options: SwitcherOption[], query: string): SwitcherOption[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return options;
  return options.filter((o) => {
    const hay = fold(`${optionLabel(o)} ${o.description ?? ''}`);
    return words.every((w) => hay.includes(w));
  });
}

/** The action to run for a pick, or null when nothing should happen (disabled, same value). */
export function switcherPick(
  s: RecordSwitcher,
  picked: unknown,
): { actionId: string; parameters: Record<string, unknown> } | null {
  if (s.disabled) return null;
  if (String(picked ?? '') === String(s.value ?? '')) return null;
  return { actionId: s.actionId || SWITCHER_ACTION_ID, parameters: { [SWITCHER_VALUE_PARAMETER]: picked } };
}

function fold(s: string): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// ── A3 hero tone ─────────────────────────────────────────────────────────────────────────

/** Shared palette for `HeroSectionDto.tone` (dark band, light ink). */
export const HERO_TONES: Readonly<Record<string, string>> = {
  ocean: '#1f4e79',
  pine: '#2d5a3d',
  lilac: '#5b4a7a',
  teal: '#1f5c5c',
  rose: '#7a3b4f',
  pebble: '#5a5550',
  slate: '#3d4a57',
  plum: '#5e3557',
  sienna: '#7a4a2e',
};

export interface HeroToneColors {
  background: string;
  title: string;
  subtitle: string;
}

/** Colors for a tone; null for null/unknown tones (→ the default look). */
export function heroToneColors(tone: string | null | undefined): HeroToneColors | null {
  const bg = tone ? HERO_TONES[tone.trim().toLowerCase()] : undefined;
  if (!bg) return null;
  return { background: bg, title: '#ffffff', subtitle: 'rgba(255,255,255,.85)' };
}

// ── A4 foldout summary slot ──────────────────────────────────────────────────────────────

/** The child slotted `summary-<index>` (what a folded panel shows), or undefined. */
export function foldoutSlot(children: unknown[], slot: string): unknown {
  return children.find((c) => (c as Record<string, unknown>)?.['slot'] === slot);
}

export const foldoutSummaryOf = (children: unknown[], index: number): unknown =>
  foldoutSlot(children, `summary-${index}`);

// ── A5 pre-search content ────────────────────────────────────────────────────────────────

/** Pre-search components show only while the listing has not received its first search answer. */
export function showsPreSearch(preSearch: unknown, searched: boolean): boolean {
  return !searched && Array.isArray(preSearch) && preSearch.length > 0;
}

// ── overlays ─────────────────────────────────────────────────────────────────────────────

export interface OverlayEntry {
  component: unknown;
  /** Bumped when the entry is refreshed in place, so the host remounts its content. */
  revision: number;
}

/** An overlay's identity: the Drawer/Dialog's own `metadata.id`. The ClientSide wrapper's id is NOT
 *  used — the server stamps the same placeholder ("fieldId") on every overlay, so it would make two
 *  unrelated drawers look like one. No metadata id → no identity → always stacks. */
export const overlayIdOf = (component: unknown): string => {
  const c = component as Record<string, unknown> | null | undefined;
  const id = (c?.['metadata'] as Record<string, unknown> | undefined)?.['id'];
  return id === null || id === undefined ? '' : String(id);
};
const idOf = overlayIdOf;

/**
 * The overlay's content node, carrying the Drawer/Dialog's `initialData` (the values the form
 * opens with — the next row on "Save and next", what was typed when a save failed) layered over
 * whatever the content brings itself. Null when there is no content.
 */
export function overlayContentWithData(meta: Record<string, unknown>): unknown {
  const content = meta['content'] as Record<string, unknown> | null | undefined;
  if (!content || typeof content !== 'object') return content ?? null;
  const initialData = meta['initialData'] as Record<string, unknown> | null | undefined;
  if (!initialData || typeof initialData !== 'object' || Object.keys(initialData).length === 0) return content;
  const own = (content['initialData'] as Record<string, unknown> | null | undefined) ?? {};
  return { ...content, initialData: { ...own, ...initialData } };
}

/**
 * Adds an overlay, or — when an open overlay already carries the same component id (a Drawer
 * re-sent while open: save-and-next, the error banner) — replaces that one IN PLACE instead of
 * stacking a duplicate. Entries above it stay where they are.
 */
export function upsertOverlay<T extends OverlayEntry>(stack: T[], entry: T): T[] {
  const id = idOf(entry.component);
  if (id) {
    const at = stack.findIndex((o) => idOf(o.component) === id);
    if (at >= 0) {
      const next = stack.slice();
      next[at] = { ...entry, revision: stack[at].revision + 1 };
      return next;
    }
  }
  return [...stack, entry];
}
