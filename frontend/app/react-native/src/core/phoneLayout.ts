// Phone-width layout decisions (pure, tested by node's runner): how many columns a form row gets,
// which crud toolbar button becomes the listing's extended FAB, and how a wizard's step rail
// collapses above the form. "Phone" = a window narrower than COMPACT_WIDTH (600dp, Material's
// compact window class) — tablets keep the declared layout.
import { buttonActionId, COMPACT_WIDTH } from './uxRules.ts';

type Json = Record<string, unknown>;

export function isPhoneWidth(windowWidth: number): boolean {
  return windowWidth > 0 && windowWidth < COMPACT_WIDTH;
}

/** A tablet is wide enough for two panes side by side (MasterDetailLayout, a board row). */
export const SIDE_BY_SIDE_WIDTH = 768;

/**
 * How a MasterDetailLayout lays out its panes: beside each other from a tablet up, stacked on a
 * phone — and ALWAYS stacked (the detail below the master) when its `orientation` is vertical,
 * which used to be ignored.
 */
export function masterDetailDirection(orientation: unknown, windowWidth: number): 'row' | 'column' {
  if (String(orientation ?? '').toLowerCase() === 'vertical') return 'column';
  return windowWidth >= SIDE_BY_SIDE_WIDTH ? 'row' : 'column';
}

/** A wire Button keeps its natural width; inside a FullWidth it stretches across the row. */
export function wireButtonAlignSelf(inFullWidth: boolean): 'flex-start' | 'stretch' {
  return inFullWidth ? 'stretch' : 'flex-start';
}

/**
 * The columns a form row (FormLayout → FormRow) lays out in: ONE on a phone, whatever the section
 * declares (`@Section(columns = 4)` used to still show two fields side by side, each too narrow for
 * a value like an e-mail address), the declared count from a tablet up.
 */
export function formRowColumns(declared: number, windowWidth: number): number {
  const n = Math.max(1, Math.floor(declared) || 1);
  return isPhoneWidth(windowWidth) ? 1 : n;
}

/**
 * The listing's create action — the crud toolbar's `new` (the Java/.NET/Python cruds all send that
 * id; `create` is the creation FORM's save, never a listing button) — is lifted out of the toolbar
 * to become the Material extended FAB; every other toolbar button stays where it was.
 */
export function splitCreateAction<T extends { actionId?: string | null; id?: string | null }>(
  toolbar: T[] | null | undefined,
): { create: T | null; rest: T[] } {
  const all = toolbar ?? [];
  const index = all.findIndex((b) => buttonActionId(b) === 'new');
  if (index < 0) return { create: null, rest: all };
  return { create: all[index], rest: all.filter((_, i) => i !== index) };
}

/**
 * The ONE pane of a Collection Detail page (`template: CollectionDetailPage`, laid out by the server as
 * a `collection-detail` row of `collection-detail-list` + `-detail` | `-no-selection`) that a phone
 * shows: the list while nothing is selected, the detail once something is. Stacked, picking a row
 * repainted the list on top with the detail below it, so the record seemed not to open. Side by side
 * from a tablet up (null = lay the row out as usual).
 */
export function collectionDetailPane(row: unknown, windowWidth: number): number | null {
  const n = (row ?? {}) as Json;
  if (n['id'] !== 'collection-detail' || !isPhoneWidth(windowWidth)) return null;
  const ids = ((n['children'] as unknown[] | undefined) ?? []).map((c) => ((c ?? {}) as Json)['id']);
  const detail = ids.indexOf('collection-detail-detail');
  const pane = detail >= 0 ? detail : ids.indexOf('collection-detail-list');
  return pane >= 0 ? pane : null;
}

/**
 * The step rail of a `@WizardProgress(RAIL)` wizard: the row child the server composes as the rail
 * — a sticky fixed-width column (`flex: 0 0 15rem; … position: sticky`, the same in the Java, .NET
 * and Python wizards) whose own children are the `N | M` counter and a VERTICAL ProgressSteps.
 * -1 when the row is not a wizard rail row. A vertical ProgressSteps somewhere else in a row (a page
 * showing a step list beside other content) is content, not a rail: it used to be collapsed to the
 * one-line phone rail too.
 */
export function wizardRailIndex(children: unknown[] | null | undefined): number {
  return (children ?? []).findIndex((child) => railStepsOf(child) !== null);
}

function railStepsOf(node: unknown): Json | null {
  const n = (node ?? {}) as Json;
  const style = String(n['style'] ?? '');
  if (!/position:\s*sticky/.test(style) || !/flex:\s*0\s+0\s/.test(style)) return null;
  for (const c of (n['children'] as unknown[] | undefined) ?? []) {
    const m = (((c ?? {}) as Json)['metadata'] ?? {}) as Json;
    if (m['type'] === 'ProgressSteps' && m['vertical'] === true) return m;
  }
  return null;
}

/** The rail's `N | M` counter text, when it carries one. */
function railCounterOf(node: unknown): string | null {
  for (const c of (((node ?? {}) as Json)['children'] as unknown[] | undefined) ?? []) {
    const m = (((c ?? {}) as Json)['metadata'] ?? {}) as Json;
    if (m['type'] === 'Text' && /^\s*\d+\s*\|\s*\d+\s*$/.test(String(m['text'] ?? ''))) return String(m['text']).trim();
  }
  return null;
}

export interface CompactRail {
  /** the rail's own `N | M` counter (the server's: non-result steps only) */
  counter: string;
  /** "Step 2 of 4 · Account type", or the result title once every step is done */
  text: string;
  /** 0..1, for the linear progress under the summary — steps DONE over all the steps the wizard
   *  has (the result step included), the same fraction the BAR style shows */
  progress: number;
}

/**
 * The rail collapsed to one line for a phone, where it stacks ABOVE the form (side by side it took
 * a third of the width and clipped the field labels): the current step's position and title.
 */
export function compactRail(rail: unknown): CompactRail | null {
  const steps = railStepsOf(rail);
  if (!steps) return null;
  const list = ((steps['steps'] as Json[] | undefined) ?? []).filter(Boolean);
  if (list.length === 0) return null;
  const done = list.filter((s) => s['status'] === 'done' || s['status'] === 'completed').length;
  const current = list.findIndex((s) => s['status'] === 'current');
  if (current < 0) {
    const allDone = done === list.length;
    const counter = railCounterOf(rail) ?? (allDone ? `${list.length} | ${list.length}` : `1 | ${list.length}`);
    if (allDone) return { counter, text: String(steps['resultTitle'] ?? '') || 'Completed', progress: 1 };
    return { counter, text: `Step 1 of ${list.length}`, progress: 0 };
  }
  const title = String(list[current]['title'] ?? '');
  return {
    counter: railCounterOf(rail) ?? `${current + 1} | ${list.length}`,
    text: `Step ${current + 1} of ${list.length}${title ? ` · ${title}` : ''}`,
    progress: done / (list.length + 1),
  };
}

/** A row item that says where it wraps — a `min-width: min(…)` (zone columns) or a fixed basis
 *  (`flex: 0 0 22rem`, the item overview template's panel): it keeps a phone-sized minimum, so on a
 *  phone the row stacks and on a tablet the items stay side by side. */
export function declaresWrapPoint(style: string | null | undefined): boolean {
  const s = style ?? '';
  return /min-width:\s*min\(/.test(s) || /flex:\s*0\s+0\s+\d/.test(s);
}
