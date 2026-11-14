/**
 * What the user sees, as compact JSON for an agent — the answer to a live UI session's
 * `describe-screen` (conformance/mcp/README.md "Reading and operating the screen the user has
 * open"). The SAME shape and caps as the desktop app's `mateu_get_screen` (IntelliJ
 * mcp/ScreenSummary.kt), so an agent reads both the same way.
 *
 * Pure: built from the WIRE model the views rendered (their component trees, their state, their
 * listing pages) and nothing else. A field the server did not send is not there; one a client rule
 * hid is left out; a password shows as dots; no token or secret is ever read. Long text and lists
 * are capped and listed in `truncated`.
 */
import { interpolate } from './expressions.ts';

type Json = Record<string, unknown>;

export const MAX_TEXT = 500;
export const MAX_LIST = 50;
export const MAX_OPTIONS = 50;
export const MAX_ROWS = 50;
export const MAX_FIELDS = 200;
export const MAX_ACTIONS = 200;
export const MAX_MESSAGES = 10;

/** The row action that opens a listing row, as a press on the row does. */
export const OPEN_ROW_ACTION = 'open-row';

/** One rendered view: its tree, the state its widgets show, and what came with it. */
export interface SummaryView {
  content: unknown;
  state?: Json;
  fieldErrors?: Record<string, string>;
  fieldAttributes?: Record<string, Json>;
  /** Listing id → the last listing envelope it painted (`{page: {content, totalElements, …}}`). */
  listings?: Record<string, unknown>;
  /** Listing id → the search text its box holds (RN keeps it in the listing, not the state). */
  searchTexts?: Record<string, string>;
}

export interface SummaryMessage {
  variant: string;
  title?: string | null;
  text: string;
}

export interface SummaryInput {
  route: string;
  windowTitle?: string | null;
  view?: SummaryView | null;
  /** An open Drawer/Dialog (its wire node) and the view it renders: in front of the page. */
  overlay?: { component: unknown; view: SummaryView } | null;
  /** The app shell's metadata (`App`): context selectors, header actions, the user. */
  app?: Json | null;
  appState?: Json;
  messages?: SummaryMessage[];
}

const SKIP = new Set([
  'initialData', 'state', 'data', 'menu', 'options', 'columns', 'filters', 'triggers', 'rules',
  'validations', 'actions', 'restSources', 'actionCatalogue', 'contextSelectors', 'contextActions',
  'shortcuts', 'headerValues', 'editorOptions', 'valueLabels', 'tones', 'optionsSource', 'rowsSource',
  'restAction', 'attributes', 'remoteCoordinates', 'resolved', 'server',
]);

/** Actions the renderer runs on its own (a search box, a pager): not options of their own. */
const INTERNAL_ACTIONS = new Set(['search', '__restdata__', '__restfetch__', 'nextPage', 'prevPage', 'update-row']);

const isObj = (v: unknown): v is Json => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (n: unknown, key: string, fallback = ''): string => {
  if (!isObj(n)) return fallback;
  const v = n[key];
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string') return v || fallback;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return fallback;
};
const bool = (n: unknown, key: string): boolean => isObj(n) && n[key] === true;
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

class Notes {
  readonly paths = new Set<string>();
  add(path: string) {
    this.paths.add(path);
  }
  sorted(): string[] {
    return [...this.paths].sort();
  }
}

export function buildScreenSummary(input: SummaryInput): Json {
  const truncated = new Notes();
  const out: Json = {};
  const ui: Json = {};
  const appTitle = text(input.app, 'title');
  if (appTitle) ui['appTitle'] = appTitle;
  if (Object.keys(ui).length) out['ui'] = ui;
  const user = userOf(input.app);
  if (user !== undefined) out['user'] = user;
  out['route'] = input.route ?? '';
  if (input.windowTitle) out['windowTitle'] = input.windowTitle;
  out['focus'] = input.overlay ? 'overlay' : 'page';
  const appState = input.appState ?? {};
  const context = appContextOf(input.app, appState, truncated);
  if (context) out['appContext'] = context;
  const actions = appActionsOf(input.app);
  if (actions) out['appActions'] = actions;

  if (input.overlay) {
    const meta = isObj(input.overlay.component) ? ((input.overlay.component as Json)['metadata'] as Json) ?? {} : {};
    const o: Json = {};
    o['kind'] = (text(meta, 'type') || 'overlay').toLowerCase();
    const ctx = exprCtx(input.overlay.view.state ?? {}, appState);
    const title = text(meta, 'headerTitle', text(meta, 'title'));
    if (title) o['title'] = interp(title, ctx);
    const subtitle = text(meta, 'subtitle');
    if (subtitle) o['subtitle'] = interp(subtitle, ctx);
    const parts: unknown[] = [];
    for (const key of ['header', 'content', 'footer']) if (isObj(meta[key])) parts.push(meta[key]);
    parts.push(...arr((input.overlay.component as Json)?.['children']));
    // the content the overlay's own view renders is its view's tree
    if (input.overlay.view.content) parts.push(input.overlay.view.content);
    describeView(o, parts, input.overlay.view, appState, truncated, 'overlay.');
    out['overlay'] = o;
  }

  if (input.view) {
    const page: Json = input.overlay ? {} : out;
    describeView(page, input.view.content, input.view, appState, truncated, '');
    if (input.overlay) out['page'] = page;
  }

  const messages = input.messages ?? [];
  if (messages.length) {
    out['messages'] = messages.slice(-MAX_MESSAGES).map((m) => {
      const one: Json = { variant: m.variant };
      if (m.title) one['title'] = m.title;
      one['text'] = capText(m.text ?? '', 'messages', truncated);
      return one;
    });
  }
  const notes = truncated.sorted();
  if (notes.length) out['truncated'] = notes;
  return out;
}

/** The action ids the screen offers (what a `run-action` may name). */
export function offeredActionIds(summary: Json): Set<string> {
  const ids = new Set<string>();
  if (isObj(summary['overlay'])) offeredIn(summary['overlay'] as Json).forEach((i) => ids.add(i));
  offeredIn(isObj(summary['page']) ? (summary['page'] as Json) : summary).forEach((i) => ids.add(i));
  const walk = (a: unknown) => {
    const id = text(a, 'id');
    if (id) ids.add(id);
    arr(isObj(a) ? a['children'] : null).forEach(walk);
  };
  arr(summary['appActions']).forEach(walk);
  return ids;
}

/** The action ids one part of the summary (the page, or the overlay) offers. */
export function offeredIn(part: Json): Set<string> {
  const ids = new Set<string>();
  const walk = (a: unknown) => {
    const id = text(a, 'id');
    if (id) ids.add(id);
    arr(isObj(a) ? a['children'] : null).forEach(walk);
  };
  arr(part['actions']).forEach(walk);
  arr(part['otherActionIds']).forEach((i) => typeof i === 'string' && ids.add(i));
  for (const l of arr(part['listings'])) {
    if (!isObj(l)) continue;
    arr(l['actions']).forEach(walk);
    arr(l['rowActions']).forEach(walk);
    arr(l['builtInActions']).forEach((i) => typeof i === 'string' && ids.add(i));
  }
  return ids;
}

/** The action of the summary with this id (searched like offeredActionIds), for its `enabled`. */
export function offeredAction(summary: Json, id: string): Json | undefined {
  let found: Json | undefined;
  const walk = (a: unknown) => {
    if (found || !isObj(a)) return;
    if (text(a, 'id') === id) found = a;
    arr(a['children']).forEach(walk);
  };
  const parts = [summary['overlay'], isObj(summary['page']) ? summary['page'] : summary].filter(isObj) as Json[];
  for (const p of parts) {
    arr(p['actions']).forEach(walk);
    for (const l of arr(p['listings'])) if (isObj(l)) { arr(l['actions']).forEach(walk); arr(l['rowActions']).forEach(walk); }
  }
  arr(summary['appActions']).forEach(walk);
  return found;
}

/** The part of the summary in front: the overlay when one is open, else the page. */
export function focusOf(summary: Json): Json {
  if (isObj(summary['overlay'])) return summary['overlay'] as Json;
  return isObj(summary['page']) ? (summary['page'] as Json) : summary;
}

/**
 * What a `set-fields` may write in the part in front: its fields that are not read-only, and each
 * listing's search text and filters (field id → `field` | `searchText:<listing>` | `filter:<listing>`).
 */
export function editableTargets(summary: Json): Map<string, string> {
  const part = focusOf(summary);
  const out = new Map<string, string>();
  for (const f of arr(part['fields'])) {
    if (isObj(f) && f['readOnly'] !== true && text(f, 'id')) out.set(text(f, 'id'), 'field');
  }
  for (const l of arr(part['listings'])) {
    if (!isObj(l)) continue;
    const listing = text(l, 'id');
    if ('searchText' in l) out.set('searchText', `searchText:${listing}`);
    for (const f of arr(l['filters'])) if (text(f, 'id')) out.set(text(f, 'id'), `filter:${listing}`);
  }
  return out;
}

// ── one view ──────────────────────────────────────────────────────────────────────────────

interface Acc {
  header: Json | null;
  fields: Map<string, Json>;
  buttons: Json[];
  cruds: { node: Json; meta: Json }[];
  declared: Set<string>;
  initialData: Map<string, unknown>;
}

function describeView(into: Json, tree: unknown, view: SummaryView, appState: Json, truncated: Notes, prefix: string) {
  const acc: Acc = { header: null, fields: new Map(), buttons: [], cruds: [], declared: new Set(), initialData: new Map() };
  if (tree) walk(tree, acc, null, new Set());
  const state = view.state ?? {};
  const ctx = exprCtx(state, appState);

  if (acc.header) {
    const h = acc.header;
    const header: Json = {};
    for (const k of ['title', 'subtitle', 'overline']) if (text(h, k)) header[k] = interp(text(h, k), ctx);
    if (text(h, 'timestamp')) header['timestamp'] = text(h, 'timestamp');
    const badges = arr(h['badges']);
    if (badges.length) header['badges'] = badges.map((b) => interp(text(b, 'text', text(b, 'label')), ctx));
    const kpis = arr(h['kpis']);
    if (kpis.length) header['kpis'] = kpis.map((k) => ({ title: interp(text(k, 'title'), ctx), value: interp(text(k, 'text'), ctx) }));
    if (Object.keys(header).length) into['header'] = header;
    const crumbs = arr(h['breadcrumbs']);
    if (crumbs.length) {
      into['breadcrumbs'] = crumbs.map((b) => {
        const one: Json = { label: text(b, 'text') };
        if (text(b, 'link')) one['route'] = text(b, 'link');
        return one;
      });
    }
  }

  const fields: Json[] = [];
  let count = 0;
  for (const [id, meta] of acc.fields) {
    const attrs = view.fieldAttributes?.[id] ?? {};
    if (attrs['hidden']) continue;
    if (count++ >= MAX_FIELDS) {
      truncated.add(`${prefix}fields`);
      break;
    }
    fields.push(field(id, meta, view, acc, attrs, ctx, truncated, `${prefix}fields.${id}`));
  }
  into['fields'] = fields;
  const errors = view.fieldErrors ?? {};
  if (Object.keys(errors).length) into['errors'] = { ...errors };

  const actions: Json[] = [];
  const seen = new Set<string>();
  for (const b of acc.buttons) {
    if (actions.length >= MAX_ACTIONS) {
      truncated.add(`${prefix}actions`);
      break;
    }
    const a = action(b, ctx);
    if (a && !seen.has(`${a['id']}|${a['label'] ?? ''}`)) {
      seen.add(`${a['id']}|${a['label'] ?? ''}`);
      actions.push(a);
    }
  }
  into['actions'] = actions;
  const buttonIds = new Set(actions.map((a) => String(a['id'])));
  const others = [...acc.declared].filter((id) => !buttonIds.has(id) && !INTERNAL_ACTIONS.has(id));
  if (others.length) into['otherActionIds'] = others.slice(0, MAX_ACTIONS);

  if (acc.cruds.length) {
    into['listings'] = acc.cruds.map(({ node, meta }) => listing(node, meta, view, ctx, truncated, prefix));
  }
}

function walk(n: unknown, acc: Acc, inherited: Json | null, seen: Set<unknown>) {
  if (Array.isArray(n)) {
    n.forEach((c) => walk(c, acc, inherited, seen));
    return;
  }
  if (!isObj(n) || seen.has(n)) return;
  seen.add(n);
  let initial = inherited;
  const type = text(n, 'type');
  if (type === 'ServerSide') {
    if (isObj(n['initialData'])) initial = n['initialData'] as Json;
    for (const a of arr(n['actions'])) if (text(a, 'id')) acc.declared.add(text(a, 'id'));
  }
  if (type === 'FormField') {
    const id = text(n, 'fieldId');
    if (id && !acc.fields.has(id)) {
      acc.fields.set(id, n);
      if (initial && id in initial && !acc.initialData.has(id)) acc.initialData.set(id, initial[id]);
    }
  } else if (type === 'Button') {
    // a button group's children are listed under it, not again on their own
    acc.buttons.push(n);
    return;
  } else if (type === 'Page' || type === 'Form') {
    if (!acc.header) acc.header = n;
    for (const a of arr(n['actions'])) if (text(a, 'id')) acc.declared.add(text(a, 'id'));
  }
  const meta = n['metadata'];
  if (isObj(meta)) {
    if (text(meta, 'type') === 'Crud') {
      acc.cruds.push({ node: n, meta });
      // its toolbar is the listing's: summarised with it
      walkChildren(meta, acc, initial, new Set(['toolbar']), seen);
    } else {
      walk(meta, acc, initial, seen);
    }
  }
  walkChildren(n, acc, initial, new Set(['metadata']), seen);
}

function walkChildren(n: Json, acc: Acc, initial: Json | null, skipAlso: Set<string>, seen: Set<unknown>) {
  for (const [k, v] of Object.entries(n)) {
    if (SKIP.has(k) || skipAlso.has(k)) continue;
    if (v && typeof v === 'object') walk(v, acc, initial, seen);
  }
}

function field(id: string, meta: Json, view: SummaryView, acc: Acc, attrs: Json, ctx: Json, truncated: Notes, path: string): Json {
  const out: Json = { id };
  if (text(meta, 'label')) out['label'] = interp(text(meta, 'label'), ctx);
  out['type'] = text(meta, 'dataType');
  const stereotype = text(meta, 'stereotype');
  if (stereotype && stereotype !== 'regular') out['stereotype'] = stereotype;
  const required = attrs['required'] !== undefined ? Boolean(attrs['required']) : bool(meta, 'required');
  if (required) out['required'] = true;
  if (bool(meta, 'readOnly') || attrs['disabled'] === true) out['readOnly'] = true;
  if (text(meta, 'description')) out['help'] = capText(text(meta, 'description'), path, truncated);
  const state = view.state ?? {};
  const raw = id in state ? state[id] : acc.initialData.get(id);
  if (isSecret(meta)) {
    out['value'] = raw === null || raw === undefined || String(raw) === '' ? '' : '••••••';
  } else {
    out['value'] = cap(raw, path, truncated, 0);
  }
  const options = arr(meta['options']);
  if (options.length) {
    out['options'] = options.slice(0, MAX_OPTIONS).map((o) => ({ value: text(o, 'value'), label: text(o, 'label', text(o, 'value')) }));
    if (options.length > MAX_OPTIONS) truncated.add(`${path}.options`);
  } else if (meta['optionsSource'] !== undefined && meta['optionsSource'] !== null) {
    out['optionsFrom'] = 'a source the renderer fetches';
  }
  const error = view.fieldErrors?.[id];
  if (error) out['error'] = error;
  return out;
}

function isSecret(meta: Json): boolean {
  return text(meta, 'stereotype').toLowerCase() === 'password' || text(meta, 'dataType').toLowerCase() === 'password';
}

function action(b: Json, ctx: Json): Json | null {
  const id = text(b, 'actionId');
  const route = text(b, 'route');
  const label = interp(text(b, 'label'), ctx);
  const children = arr(b['children']);
  if (!id && !route && children.length === 0) return null;
  const out: Json = { id: id || route || label };
  if (label) out['label'] = label;
  out['enabled'] = !bool(b, 'disabled');
  if (route) out['navigatesTo'] = route;
  if (bool(b, 'rowsSelectedRequired')) out['needsSelectedRows'] = true;
  if (children.length) {
    out['children'] = children.map((c) => (isObj(c) ? action((c['metadata'] as Json) ?? c, ctx) : null)).filter((c): c is Json => !!c);
  }
  return out;
}

function listing(node: Json, meta: Json, view: SummaryView, ctx: Json, truncated: Notes, prefix: string): Json {
  const id = text(node, 'id') || text(meta, 'id') || 'crud';
  const path = `${prefix}listings.${id}`;
  const out: Json = { id };
  const state = view.state ?? {};
  if (text(meta, 'title')) out['title'] = interp(text(meta, 'title'), ctx);
  const columns = arr(meta['columns']).map((c) => (isObj(c) && isObj(c['metadata']) ? (c['metadata'] as Json) : (c as Json)));
  out['columns'] = columns.map((c) => ({ id: text(c, 'id'), label: text(c, 'label') }));
  const actions: Json[] = [];
  for (const b of arr(meta['toolbar'])) {
    const a = action(isObj(b) && isObj(b['metadata']) ? (b['metadata'] as Json) : (b as Json), ctx);
    if (a) actions.push(a);
  }
  out['actions'] = actions;
  if (bool(meta, 'searchable')) out['searchText'] = view.searchTexts?.[id] ?? (typeof state['searchText'] === 'string' ? state['searchText'] : '');
  const filters = arr(meta['filters']);
  if (filters.length) {
    out['filters'] = filters.map((f) => {
      const fid = text(f, 'fieldId');
      const one: Json = { id: fid, label: text(f, 'label', fid), type: text(f, 'dataType') };
      if (state[fid] !== undefined && state[fid] !== null) one['value'] = cap(state[fid], `${path}.filters.${fid}`, truncated, 0);
      if (state[`${fid}_from`] !== undefined) one['from'] = state[`${fid}_from`];
      if (state[`${fid}_to`] !== undefined) one['to'] = state[`${fid}_to`];
      const opts = arr(isObj(f) ? f['options'] : null);
      if (opts.length) one['options'] = opts.slice(0, MAX_OPTIONS).map((o) => ({ value: text(o, 'value'), label: text(o, 'label') }));
      return one;
    });
  }
  if (Array.isArray(state['sort']) && (state['sort'] as unknown[]).length) out['sort'] = state['sort'];

  const envelope = view.listings?.[id] ?? view.listings?.['crud'];
  const page = pageOf(envelope);
  const rows = page ? arr(page['content']) : [];
  if (page) {
    out['page'] = num(page['pageNumber'], 0);
    out['pageSize'] = num(page['pageSize'], rows.length);
    if (typeof page['totalElements'] === 'number') out['totalElements'] = page['totalElements'];
  }
  const colIds = columns.map((c) => text(c, 'id')).filter(Boolean);
  out['rows'] = rows.slice(0, MAX_ROWS).map((row) => {
    const one: Json = {};
    if (!isObj(row)) return one;
    const keys = colIds.length ? colIds : Object.keys(row).filter((k) => !k.startsWith('_'));
    for (const k of keys) {
      if (!(k in row)) continue;
      one[k] = cellValue(row[k], columns.find((c) => text(c, 'id') === k), path, truncated);
    }
    return one;
  });
  if (rows.length > MAX_ROWS) truncated.add(`${path}.rows`);

  const rowActions: Json[] = [];
  const opens = !!text(meta, 'rowRoute') || columns.some((c) => text(c, 'actionId') === 'view');
  if (opens) rowActions.push({ id: OPEN_ROW_ACTION, label: 'Open' });
  for (const c of columns) {
    const a = text(c, 'actionId');
    if (a && a !== 'view') rowActions.push({ id: a, label: text(c, 'label') });
  }
  const seenMethods = new Set<string>();
  for (const c of columns.filter((c) => ['action', 'actionGroup', 'menu'].includes(text(c, 'dataType')))) {
    for (const row of rows) {
      const cell = isObj(row) ? row[text(c, 'id')] : undefined;
      for (const a of rowActionsOf(cell, text(c, 'dataType'))) {
        const method = text(a, 'methodNameInCrud');
        if (method && !seenMethods.has(method)) {
          seenMethods.add(method);
          rowActions.push({ id: `action-on-row-${method}`, label: text(a, 'label', method) });
        }
      }
    }
  }
  out['rowActions'] = rowActions;
  if (bool(meta, 'rowsSelectionEnabled')) out['rowsSelectable'] = true;
  if (isObj(meta['rowsSource'])) {
    out['rowsFrom'] = 'a REST source the app fetches; search and paging are not offered to agents';
  } else {
    out['builtInActions'] = page ? ['search', 'nextPage', 'prevPage'] : ['search'];
  }
  return out;
}

/** The page an envelope carries (`{crud: {page}}`, `{page}`, or the page itself). */
export function pageOf(envelope: unknown): Json | null {
  if (!isObj(envelope)) return null;
  if (isObj(envelope['crud']) && isObj((envelope['crud'] as Json)['page'])) return (envelope['crud'] as Json)['page'] as Json;
  if (isObj(envelope['page'])) return envelope['page'] as Json;
  return Array.isArray(envelope['content']) ? envelope : null;
}

function rowActionsOf(cell: unknown, dataType: string): Json[] {
  if (!isObj(cell)) return [];
  if (dataType === 'action') return 'methodNameInCrud' in cell ? [cell] : [];
  return arr(cell['actions']).filter(isObj) as Json[];
}

function cellValue(cell: unknown, col: Json | undefined, path: string, truncated: Notes): unknown {
  if (isObj(cell)) {
    for (const k of ['message', 'text', 'label', 'value']) {
      const v = cell[k];
      if (v !== null && v !== undefined && typeof v !== 'object') return capText(String(v), path, truncated);
    }
  }
  if (cell !== null && cell !== undefined && typeof cell !== 'object' && col && isObj(col['valueLabels'])) {
    const label = (col['valueLabels'] as Json)[String(cell)];
    if (typeof label === 'string') return label;
  }
  return cap(cell, path, truncated, 0);
}

// ── the app shell ─────────────────────────────────────────────────────────────────────────

function appContextOf(app: Json | null | undefined, appState: Json, truncated: Notes): Json[] | null {
  const selectors = arr(app?.['contextSelectors']);
  if (!selectors.length) return null;
  return selectors.map((s) => {
    const fieldName = text(s, 'fieldName');
    const raw = appState[fieldName];
    const value = raw === null || raw === undefined ? '' : String(raw);
    const one: Json = { field: fieldName, label: text(s, 'label', fieldName), value };
    const options = arr(isObj(s) ? s['options'] : null);
    const match = options.find((o) => text(o, 'value') === value);
    if (match) one['valueLabel'] = text(match, 'label');
    one['options'] = options.slice(0, MAX_OPTIONS).map((o) => ({ value: text(o, 'value'), label: text(o, 'label') }));
    if (options.length > MAX_OPTIONS) truncated.add(`appContext.${fieldName}.options`);
    return one;
  });
}

function appActionsOf(app: Json | null | undefined): Json[] | null {
  const list = arr(app?.['contextActions']);
  if (!list.length) return null;
  const one = (a: unknown): Json => {
    const out: Json = { id: text(a, 'actionId'), label: text(a, 'label', text(a, 'actionId')) };
    if (text(a, 'route')) out['navigatesTo'] = text(a, 'route');
    const children = arr(isObj(a) ? a['children'] : null);
    if (children.length) out['children'] = children.map(one);
    return out;
  };
  return list.map(one);
}

/** The signed-in user, when the shell carries one (`App.user`): never a token or a secret. */
function userOf(app: Json | null | undefined): unknown {
  const u = app?.['user'];
  if (typeof u === 'string') return u;
  if (!isObj(u)) return undefined;
  const out: Json = {};
  for (const [k, v] of Object.entries(u)) {
    const lower = k.toLowerCase();
    if (v !== null && typeof v === 'object') continue;
    if (['token', 'secret', 'password', 'credential'].some((s) => lower.includes(s))) continue;
    out[k] = v;
  }
  return out;
}

// ── values ────────────────────────────────────────────────────────────────────────────────

const exprCtx = (state: Json, appState: Json): Json => ({ state, appState, data: {} });

function interp(template: string, ctx: Json): string {
  if (!template.includes('${')) return template;
  try {
    return interpolate(template, ctx as never);
  } catch {
    return template;
  }
}

const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

function capText(value: string, path: string, truncated: Notes): string {
  if (value.startsWith('data:')) {
    truncated.add(path);
    return `[${value.split(',')[0].split(';')[0]} data, ${value.length} characters]`;
  }
  if (value.length <= MAX_TEXT) return value;
  truncated.add(path);
  return value.substring(0, MAX_TEXT) + '…';
}

export function cap(value: unknown, path: string, truncated: { add(path: string): void }, depth: number): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return capText(value, path, truncated as Notes);
  if (Array.isArray(value)) {
    const out = value.slice(0, MAX_LIST).map((v) => cap(v, path, truncated, depth + 1));
    if (value.length > MAX_LIST) truncated.add(path);
    return out;
  }
  if (typeof value === 'object') {
    if (depth >= 4) {
      truncated.add(path);
      return '{…}';
    }
    const entries = Object.entries(value as Json);
    const out: Json = {};
    for (const [k, v] of entries.slice(0, MAX_LIST)) out[k] = cap(v, path, truncated, depth + 1);
    if (entries.length > MAX_LIST) truncated.add(path);
    return out;
  }
  if (typeof value === 'function') return null;
  return value;
}
