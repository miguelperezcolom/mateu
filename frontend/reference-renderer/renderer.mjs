// Mateu reference renderer — Core level, zero dependencies.
//
// This is a teaching / proof-of-portability artifact (workstream R2 of the reference-architecture
// materials): it renders the Mateu wire to plain DOM using NOTHING but the wire itself — no Mateu
// frontend library, no framework, no build step. It demonstrates that a Mateu UI definition is a
// portable asset any engine can render.
//
// Scope: the CORE conformance level (forms, field types, validation, actions, CRUD listings, text).
// Anything it does not know it renders as an explicit <mateu-unsupported> placeholder — the same
// contract the first-party renderers honour, and what conformance measures. See
// doc/.../reference/wire-specification.md and doc/.../design-systems/renderer-contract.md.

// The component types this renderer claims to support (Core). The harness reads this to tell
// "unsupported" apart from "broke".
export const SUPPORTED_TYPES = [
  'ServerSide', 'Page', 'Div', 'VerticalLayout', 'HorizontalLayout',
  'Card', 'FormLayout', 'FormRow', 'FormField', 'Text', 'Button', 'Crudl',
];
if (typeof window !== 'undefined') window.__mateuRendererInfo = { supportedTypes: SUPPORTED_TYPES };

// The wire endpoint: the route lives in the PATH ('_no_route' when empty); the body carries the
// action + state. This mirrors the production client (libs/mateu AxiosMateuApiClient).
const syncUrl = (baseUrl, route) => {
  const seg = (route || '').replace(/^\//, '');
  return `${baseUrl.replace(/\/$/, '')}/mateu/v3/sync/${seg || '_no_route'}`;
};

/** POST one action and return the UIIncrementDto. The whole client protocol is this one call. */
export async function postAction(baseUrl, route, actionId, componentState) {
  const seg = (route || '').replace(/^\//, '');
  const res = await fetch(syncUrl(baseUrl, route), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      route: seg ? '/' + seg : '',
      actionId: actionId ?? '',
      componentState: componentState ?? {},
      appState: {},
      parameters: {},
      consumedRoute: '',
      initiatorComponentId: null,
      serverSideType: null,
    }),
  });
  if (!res.ok) throw new Error(`Mateu backend ${res.status} ${res.statusText}`);
  return res.json();
}

/** Load a route (the route load is dispatched as actionId ""), render it into `mount`. */
export async function load(ctx, route) {
  ctx.route = route;
  const inc = await postAction(ctx.baseUrl, route, '', {});
  if (inc.wireVersion && !inc.wireVersion.startsWith('3.')) {
    console.warn(`wire version ${inc.wireVersion} — this renderer targets 3.x`);
  }
  applyIncrement(ctx, inc);
}

/** Apply an increment: run commands, then paint the (Replace) fragments. */
export function applyIncrement(ctx, inc) {
  for (const c of inc.commands ?? []) applyCommand(ctx, c);
  for (const m of inc.messages ?? []) toast(ctx, m);
  for (const f of inc.fragments ?? []) {
    if (f.action && f.action !== 'Replace') continue; // Core: Replace only (Add = overlays = Standard+)
    const state = f.state ?? f.component?.initialData ?? {};
    ctx.state = { ...state };
    ctx.mount.replaceChildren(renderNode(ctx, f.component));
  }
}

function applyCommand(ctx, cmd) {
  switch (cmd.type) {
    case 'SetWindowTitle': document.title = String(cmd.data ?? ''); break;
    case 'navigateTo': load(ctx, String(cmd.data ?? '')); break;
    default: /* other commands (CloseModal, DispatchEvent, MarkAs*) are Standard+ */ break;
  }
}

function toast(ctx, m) {
  const t = el('div', 'mateu-toast');
  t.textContent = m.text ?? m.message ?? '';
  ctx.mount.prepend(t);
  setTimeout(() => t.remove(), 4000);
}

// ── Component dispatch ─────────────────────────────────────────────────────────
function typeOf(node) {
  if (!node) return null;
  if (node.type === 'ServerSide') return 'ServerSide';
  return node.metadata?.type ?? node.type; // ClientSide nodes carry the real type in metadata.type
}

function renderNode(ctx, node) {
  const t = typeOf(node);
  const md = node?.metadata ?? {};
  switch (t) {
    case 'ServerSide': {
      const box = el('div', 'mateu-view');
      for (const ch of node.children ?? []) box.append(renderNode(ctx, ch));
      return box;
    }
    case 'Page': return renderPage(ctx, node, md);
    case 'Div':
    case 'VerticalLayout': return renderContainer(ctx, node, 'mateu-col');
    case 'HorizontalLayout': return renderContainer(ctx, node, 'mateu-row');
    case 'Card': {
      const card = el('div', 'mateu-card');
      if (md.content) card.append(renderNode(ctx, md.content)); // Card content lives in metadata.content
      for (const ch of node.children ?? []) card.append(renderNode(ctx, ch));
      return card;
    }
    case 'FormLayout': return renderContainer(ctx, node, 'mateu-form');
    case 'FormRow': return renderContainer(ctx, node, 'mateu-formrow');
    case 'FormField': return renderField(ctx, md);
    case 'Text': { const p = el('div', 'mateu-text'); p.textContent = md.text ?? node.text ?? ''; return p; }
    case 'Button': return renderButton(ctx, md);
    case 'Crudl': return renderListing(ctx, node, md);
    default: return unsupported(t);
  }
}

function renderContainer(ctx, node, cls) {
  const box = el('div', cls);
  for (const ch of node.children ?? []) box.append(renderNode(ctx, ch));
  return box;
}

function renderPage(ctx, node, md) {
  const page = el('div', 'mateu-page');
  const title = md.title ?? md.pageTitle;
  if (title) { const h = el('h1', 'mateu-page-title'); h.textContent = title; page.append(h); }
  if (md.subtitle) { const s = el('div', 'mateu-page-subtitle'); s.textContent = md.subtitle; page.append(s); }
  for (const ch of node.children ?? []) page.append(renderNode(ctx, ch));
  return page;
}

// ── Fields (Core: bind to state, coerce on the way back) ────────────────────────
function renderField(ctx, md) {
  const wrap = el('div', 'mateu-field');
  const id = md.fieldId;
  const label = el('label', 'mateu-label');
  label.textContent = md.label ?? id ?? '';
  wrap.append(label);

  const value = ctx.state?.[id];
  const stereotype = md.stereotype ?? 'regular';
  const dataType = md.dataType ?? 'string';
  let input;

  if (stereotype === 'select' || Array.isArray(md.options)) {
    input = el('select', 'mateu-input');
    for (const opt of md.options ?? []) {
      const o = el('option'); o.value = opt.value; o.textContent = opt.label ?? opt.value;
      if (String(opt.value) === String(value)) o.selected = true;
      input.append(o);
    }
    input.onchange = () => set(ctx, id, input.value);
  } else if (dataType === 'bool') {
    input = el('input', 'mateu-checkbox'); input.type = 'checkbox'; input.checked = !!value;
    input.onchange = () => set(ctx, id, input.checked);
  } else if (dataType === 'integer' || dataType === 'number' || dataType === 'money') {
    input = el('input', 'mateu-input'); input.type = 'number';
    if (value != null) input.value = value;
    input.onchange = () => set(ctx, id, input.value === '' ? null : Number(input.value));
  } else if (dataType === 'date') {
    input = el('input', 'mateu-input'); input.type = 'date';
    if (value != null) input.value = value;
    input.onchange = () => set(ctx, id, input.value);
  } else if (stereotype === 'textarea') {
    input = el('textarea', 'mateu-input'); input.value = value ?? '';
    input.onchange = () => set(ctx, id, input.value);
  } else {
    input = el('input', 'mateu-input'); input.type = 'text'; input.value = value ?? '';
    input.onchange = () => set(ctx, id, input.value);
  }
  if (md.readOnly) input.disabled = true;
  wrap.append(input);
  return wrap;
}

function set(ctx, id, v) { ctx.state = { ...ctx.state, [id]: v }; }

function renderButton(ctx, md) {
  const b = el('button', 'mateu-button');
  b.textContent = md.label ?? md.caption ?? md.actionId ?? 'Action';
  b.onclick = async () => {
    try {
      const inc = await postAction(ctx.baseUrl, ctx.route, md.actionId, ctx.state);
      applyIncrement(ctx, inc);
    } catch (e) { toast(ctx, { text: String(e.message ?? e) }); }
  };
  return b;
}

// ── CRUD listing (Core: columns from metadata, rows from data) ──────────────────
function renderListing(ctx, node, md) {
  const cols = md.columns ?? md.gridColumns ?? node.metadata?.columns ?? [];
  const rows = node.data?.rows ?? node.data ?? md.rows ?? [];
  const table = el('table', 'mateu-table');
  const thead = el('thead'); const htr = el('tr');
  for (const c of cols) { const th = el('th'); th.textContent = c.label ?? c.header ?? c.id ?? ''; htr.append(th); }
  thead.append(htr); table.append(thead);
  const tbody = el('tbody');
  for (const row of Array.isArray(rows) ? rows : []) {
    const tr = el('tr');
    for (const c of cols) { const td = el('td'); td.textContent = fmt(row[c.id ?? c.field]); tr.append(td); }
    tbody.append(tr);
  }
  table.append(tbody);
  if (!cols.length) return unsupported('Crudl (no column metadata — needs a live rows fetch)');
  return table;
}

// ── helpers ─────────────────────────────────────────────────────────────────────
function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function fmt(v) { return v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); }
function unsupported(type) {
  const u = document.createElement('mateu-unsupported');
  u.setAttribute('data-type', String(type));
  u.textContent = `⚠ unsupported: ${type}`;
  return u;
}

/** Boot: render the given route from the given backend into `mount`. */
export function boot({ mount, baseUrl, route = '' }) {
  const ctx = { mount, baseUrl, route, state: {} };
  load(ctx, route).catch((e) => { mount.textContent = `Failed to load: ${e.message ?? e}`; });
  return ctx;
}
