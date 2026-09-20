// Projection: UIIncrementDto (the Mateu wire) -> a flat, agent-friendly view of a screen.
//
// This is the *core of value* of the agent-operability plane (design/riu-agent-operability-plan.md,
// P1/P2). It is a pure function of the wire — no I/O — so it is fully unit-testable against the
// conformance corpus (../../conformance/cases/*/expected.json), and it is the same projection the
// native Java endpoint must reproduce (specified in doc/.../reference/wire-specification.md).
//
// The wire is self-describing: a component node is either a ServerSide node (carries route,
// serverSideType, pageType, initialData, actions) or a ClientSide node (carries metadata.type +
// nested content). We deep-walk the whole structure and pick out the nodes an agent needs:
// FormField (inputs), Crudl (a listing), Page (title), Button (labels for actions).

/** Visit every plain object in an arbitrary JSON structure, depth-first, in insertion order. */
function deepVisit(node, fn, seen = new Set()) {
  if (node == null || typeof node !== "object") return;
  if (seen.has(node)) return;
  seen.add(node);
  if (!Array.isArray(node)) fn(node);
  for (const value of Array.isArray(node) ? node : Object.values(node)) {
    if (value && typeof value === "object") deepVisit(value, fn, seen);
  }
}

/** metadata.type of a rendered ClientSide component, or null. */
function mdType(node) {
  return node && node.metadata && typeof node.metadata.type === "string"
    ? node.metadata.type
    : null;
}

function projectOption(o) {
  if (o == null) return null;
  if (typeof o !== "object") return { value: o, label: String(o) };
  return { value: o.value, label: o.label ?? String(o.value ?? "") };
}

function projectField(md, values) {
  const field = {
    id: md.fieldId,
    label: md.label ?? md.fieldId,
    dataType: md.dataType ?? "string",
    stereotype: md.stereotype ?? "regular",
    required: !!md.required,
    readOnly: !!md.readOnly,
  };
  if (values && Object.prototype.hasOwnProperty.call(values, md.fieldId)) {
    field.value = values[md.fieldId];
  }
  if (Array.isArray(md.options) && md.options.length) {
    field.options = md.options.map(projectOption).filter(Boolean);
  }
  if (md.placeholder) field.placeholder = md.placeholder;
  if (md.description) field.description = md.description;
  return field;
}

/**
 * Project one UIIncrementDto into a flat screen description.
 * @param {object} increment the parsed wire response
 * @returns {object} { route, serverSideType, pageType, wireVersion, title, subtitle,
 *                     fields[], actions[], listing?, messages[], commands[], state }
 */
export function projectIncrement(increment) {
  const inc = increment ?? {};
  const commands = Array.isArray(inc.commands) ? inc.commands : [];
  const messages = Array.isArray(inc.messages) ? inc.messages : [];
  const fragments = Array.isArray(inc.fragments) ? inc.fragments : [];

  let serverSide = null;
  let page = null;
  let crudl = null;
  const fieldNodes = [];
  const buttonsByAction = new Map(); // actionId -> label
  let state = null;

  for (const fragment of fragments) {
    if (fragment && fragment.state && typeof fragment.state === "object" && !state) {
      state = fragment.state;
    }
    const root = fragment && fragment.component ? fragment.component : fragment;
    deepVisit(root, (node) => {
      if (node.type === "ServerSide" && !serverSide) serverSide = node;
      const t = mdType(node);
      if (t === "FormField" && node.metadata.fieldId) fieldNodes.push(node.metadata);
      else if (t === "Page" && !page) page = node.metadata;
      else if (t === "Crudl" && !crudl) crudl = node.metadata;
      else if (t === "Button" && node.metadata.actionId) {
        if (!buttonsByAction.has(node.metadata.actionId)) {
          buttonsByAction.set(node.metadata.actionId, node.metadata.label);
        }
      }
    });
  }

  const values =
    state ?? (serverSide && serverSide.initialData && typeof serverSide.initialData === "object"
      ? serverSide.initialData
      : {});

  // Fields, de-duplicated by id, first occurrence wins (declaration order).
  const seenField = new Set();
  const fields = [];
  for (const md of fieldNodes) {
    if (seenField.has(md.fieldId)) continue;
    seenField.add(md.fieldId);
    fields.push(projectField(md, values));
  }

  // Actions: the ids the component claims (RBAC already applied server-side — only what this
  // token may run reaches the wire), enriched with a label from a matching Button when present.
  const actions = [];
  const declared = serverSide && Array.isArray(serverSide.actions) ? serverSide.actions : [];
  const seenAction = new Set();
  for (const a of declared) {
    if (!a || !a.id || seenAction.has(a.id)) continue;
    seenAction.add(a.id);
    const action = { id: a.id, label: buttonsByAction.get(a.id) ?? a.id };
    if (a.shortcut) action.shortcut = a.shortcut;
    if (a.confirmationRequired) action.confirmationRequired = true;
    if (a.href) action.href = a.href;
    actions.push(action);
  }
  // Buttons that dispatch an action not present in actions[] (e.g. toolbar-only) are still useful.
  for (const [actionId, label] of buttonsByAction) {
    if (!seenAction.has(actionId)) {
      seenAction.add(actionId);
      actions.push({ id: actionId, label: label ?? actionId });
    }
  }

  const title =
    commands.find((c) => c && c.type === "SetWindowTitle")?.data ??
    (page && (page.pageTitle || page.title)) ??
    (crudl && crudl.title) ??
    null;

  const screen = {
    route: serverSide ? serverSide.route : null,
    serverSideType: serverSide ? serverSide.serverSideType : null,
    pageType: (serverSide && serverSide.pageType) || (page && page.pageType) || null,
    wireVersion: inc.wireVersion ?? null,
    title,
    subtitle: (page && page.subtitle) || (crudl && crudl.subtitle) || null,
    fields,
    actions,
    state: values,
  };

  if (crudl) {
    screen.listing = {
      title: crudl.title ?? null,
      searchable: !!crudl.searchable,
      columns: (Array.isArray(crudl.columns) ? crudl.columns : [])
        .map((c) => {
          const md = c && c.metadata ? c.metadata : c;
          return md ? { id: md.id ?? md.fieldId ?? null, label: md.caption ?? md.label ?? null } : null;
        })
        .filter((c) => c && (c.id || c.label)),
      filters: (Array.isArray(crudl.filters) ? crudl.filters : []).map((f) => ({
        id: f.fieldId,
        label: f.label ?? f.fieldId,
        dataType: f.dataType ?? "string",
      })),
    };
  }

  if (messages.length) {
    screen.messages = messages.map((m) => ({
      text: m.text ?? m.message ?? "",
      type: m.type ?? "info",
    }));
  }
  // Navigation / side effects the agent should know about (navigateTo, dispatchEvent, ...).
  const notableCommands = commands.filter((c) => c && c.type && c.type !== "SetWindowTitle");
  if (notableCommands.length) {
    screen.commands = notableCommands.map((c) => ({ type: c.type, data: c.data ?? null }));
  }

  return screen;
}
