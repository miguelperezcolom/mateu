/**
 * Action panels («I want to…», wire type `ActionPanel`): a trigger button that opens an overlay with
 * one section per category, each listing its actions. Same contract as the web renderers:
 *
 *  - within a category the POPULATED actions come first (stable order otherwise) and are emphasised;
 *  - a label carries " (n)" when count > 0, " (25+)" when count > 25;
 *  - at most `maxPerCategory` show per category (default 10), the rest behind "Show more (k)";
 *  - with "Hide unpopulated" on, unpopulated actions disappear, and so do categories left empty.
 *
 * Show-more and hide-unpopulated are client-side state only — nothing asks the server.
 * Pure logic (no react-native import) so it runs under `node --test`.
 */

export interface ActionPanelItemMeta {
  label?: string | null;
  actionId?: string | null;
  parameters?: Record<string, unknown> | null;
  count?: number | null;
  populated?: boolean;
  disabled?: boolean;
}

export interface ActionPanelCategoryMeta {
  title?: string | null;
  actions?: ActionPanelItemMeta[] | null;
}

export interface ActionPanelMeta {
  label?: string | null;
  shortcut?: string | null;
  categories?: ActionPanelCategoryMeta[] | null;
  maxPerCategory?: number | null;
  hideUnpopulatedToggle?: boolean;
}

export interface PanelAction {
  label: string;
  actionId: string;
  parameters?: Record<string, unknown>;
  populated: boolean;
  disabled: boolean;
}

export interface PanelCategory {
  /** Index of the category in the wire list — the stable key for its "show more" state. */
  index: number;
  title: string;
  /** The actions to show now (already ordered and cut). */
  actions: PanelAction[];
  /** How many more the "Show more" control reveals; 0 = no control. */
  hiddenCount: number;
  moreLabel?: string;
}

export const DEFAULT_LABEL = 'I want to…';
export const DEFAULT_MAX_PER_CATEGORY = 10;

/** "Arrivals" + 3 → "Arrivals (3)"; + 30 → "Arrivals (25+)"; no count → as is. */
export const countLabel = (label: string, count: number | null | undefined): string =>
  count != null && count > 0 ? `${label} (${count > 25 ? '25+' : count})` : label;

/** Populated first; otherwise the declared order (a stable sort). */
export const orderActions = <T extends { populated?: boolean }>(actions: T[]): T[] =>
  actions
    .map((a, i) => ({ a, i }))
    .sort((x, y) => Number(!!y.a.populated) - Number(!!x.a.populated) || x.i - y.i)
    .map(({ a }) => a);

export const panelLabel = (meta: ActionPanelMeta): string => (meta.label ?? '').trim() || DEFAULT_LABEL;

export const maxPerCategoryOf = (meta: ActionPanelMeta): number =>
  meta.maxPerCategory != null && meta.maxPerCategory > 0 ? meta.maxPerCategory : DEFAULT_MAX_PER_CATEGORY;

export interface PanelViewState {
  /** Categories (by wire index) whose "Show more" was pressed. */
  expanded?: ReadonlySet<number>;
  hideUnpopulated?: boolean;
}

/** What the overlay shows for the given client-side state. */
export const actionPanelView = (meta: ActionPanelMeta, view: PanelViewState = {}): PanelCategory[] => {
  const max = maxPerCategoryOf(meta);
  const hide = !!meta.hideUnpopulatedToggle && !!view.hideUnpopulated;
  const out: PanelCategory[] = [];
  (meta.categories ?? []).forEach((category, index) => {
    let actions: PanelAction[] = orderActions(category.actions ?? []).map((a) => ({
      label: countLabel(a.label ?? '', a.count),
      actionId: a.actionId ?? '',
      ...(a.parameters ? { parameters: a.parameters } : {}),
      populated: !!a.populated,
      disabled: !!a.disabled,
    }));
    if (hide) actions = actions.filter((a) => a.populated);
    if (!actions.length) return;
    const showAll = view.expanded?.has(index) ?? false;
    const hiddenCount = showAll ? 0 : Math.max(0, actions.length - max);
    out.push({
      index,
      title: category.title ?? '',
      actions: hiddenCount ? actions.slice(0, max) : actions,
      hiddenCount,
      ...(hiddenCount ? { moreLabel: `Show more (${hiddenCount})` } : {}),
    });
  });
  return out;
};
