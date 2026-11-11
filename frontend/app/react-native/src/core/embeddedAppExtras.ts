/**
 * An app EMBEDDED in a page (a `MicroFrontend` or an island answering an `App`) is shown at its home
 * screen, inside the host's page — it has no drawer of its own, which is where a full-screen app keeps
 * its app-context selectors, its notification bell and (on the web, its header) its header actions.
 * So the embedded app gets a compact bar above its content carrying them. This is the pure part:
 * which extras an `App` brings, what the bar says about them, and the actions it offers. Tested with
 * node:test.
 */

export interface ContextSelectorMeta {
  fieldName: string;
  label?: string;
  options?: { value: unknown; label?: string }[];
  optionsSource?: Record<string, unknown> | null;
}

export interface HeaderAction {
  actionId?: string | null;
  label?: string | null;
  icon?: string | null;
  children?: HeaderAction[] | null;
}

export interface EmbeddedAppExtras {
  title?: string;
  /** The app class: app-level actions (context search, inbox, header actions) run against it. */
  serverSideType?: string;
  rootRoute?: string;
  homeRoute?: string;
  contextSelectors: ContextSelectorMeta[];
  contextActions: HeaderAction[];
  notificationsEnabled: boolean;
  notificationsSource?: Record<string, unknown> | null;
  notificationsReadSource?: Record<string, unknown> | null;
}

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const list = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** The extras an App's metadata brings — null when it brings none (nothing to draw). */
export function embeddedAppExtrasOf(meta: Record<string, unknown> | null | undefined): EmbeddedAppExtras | null {
  if (!meta || meta['type'] !== 'App') return null;
  const contextSelectors = list<ContextSelectorMeta>(meta['contextSelectors']).filter((s) => !!s?.fieldName);
  const contextActions = list<HeaderAction>(meta['contextActions']).filter((a) => !!a && (!!a.actionId || list(a.children).length > 0));
  const notificationsEnabled = meta['notificationsEnabled'] === true;
  if (contextSelectors.length === 0 && contextActions.length === 0 && !notificationsEnabled) return null;
  return {
    title: str(meta['title']),
    serverSideType: str(meta['serverSideType']),
    rootRoute: str(meta['rootRoute']),
    homeRoute: str(meta['homeRoute']),
    contextSelectors,
    contextActions,
    notificationsEnabled,
    notificationsSource: (meta['notificationsSource'] as Record<string, unknown> | null | undefined) ?? null,
    notificationsReadSource: (meta['notificationsReadSource'] as Record<string, unknown> | null | undefined) ?? null,
  };
}

/** What a context selector's chip says: "Hotel: Palma", or "Hotel: not set". */
export function contextChipText(selector: ContextSelectorMeta, appState: Record<string, unknown>): string {
  const name = selector.label || selector.fieldName;
  const value = appState[selector.fieldName];
  if (value == null || value === '') return `${name}: not set`;
  const label = (selector.options ?? []).find((o) => String(o.value) === String(value))?.label;
  return `${name}: ${label ?? String(value)}`;
}

/**
 * The header actions the bar shows inline (at most `inline`, a phone row is short) and those it folds
 * into its "More" sheet. A menu action (one with children) is always a sheet: only its children run.
 */
export function splitHeaderActions(actions: HeaderAction[], inline = 2): { inline: HeaderAction[]; more: HeaderAction[] } {
  const plain = actions.filter((a) => list(a.children).length === 0 && !!a.actionId);
  const menus = actions.filter((a) => list(a.children).length > 0);
  return { inline: plain.slice(0, inline), more: [...plain.slice(inline), ...menus] };
}

/** The runnable entries under a header action (a menu's children, flattened; a plain action itself). */
export function headerActionLeaves(action: HeaderAction): HeaderAction[] {
  const children = list<HeaderAction>(action.children);
  if (children.length === 0) return action.actionId ? [action] : [];
  return children.flatMap(headerActionLeaves);
}
