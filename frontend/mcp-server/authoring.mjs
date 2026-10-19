// The authoring plane (phase B) of the sidecar: the MCP resources, the agent-sized views of the
// schema (mateu_list_components / mateu_get_component_schema), validation and preview through the
// backend's reserved sync actions, and the development-mode mateu_save_spec path rule.
//
// Normative: same behaviour as the Java reference (core application/authoring + mcp), pinned by
// conformance/mcp/authoring.json. The resource files are COPIES of backend/shared/uidl/* kept in
// resources/ (`npm run sync-resources`), pinned byte-equal by authoring.test.mjs.

import { readFileSync, existsSync, realpathSync, lstatSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, sep } from "node:path";
import { projectIncrement } from "./projection.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(here, "resources");

/** A caller mistake: shown to the agent as written. */
export class UserFacingError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserFacingError";
  }
}

/** The resources, in the order resources/list answers them (the same in every implementation). */
export const RESOURCES = [
  {
    uri: "mateu://guide",
    file: "authoring-guide.md",
    name: "Authoring guide",
    description:
      "How to write Mateu YAML definitions with these tools: the workflow, a sample page and the " +
      "rules that keep a definition valid.",
    mimeType: "text/markdown",
  },
  {
    uri: "mateu://catalog",
    file: "uidl-catalog.json",
    name: "Component catalogue",
    description:
      "Every component type with a one-line description and its main attributes (generated from the schema).",
    mimeType: "application/json",
  },
  {
    uri: "mateu://schema/specs",
    file: "specs-schema.json",
    name: "specs/ui schema",
    description:
      "JSON Schema of every file under specs/ui: pages, app shells, mounts, routes, sources, " +
      "actions, translations, environments, field types and the project descriptor.",
    mimeType: "application/schema+json",
  },
  {
    uri: "mateu://schema/uidl",
    file: "uidl-schema.json",
    name: "Component schema",
    description: "JSON Schema of the component catalogue (UIDL).",
    mimeType: "application/schema+json",
  },
];

/** The files behind the resources (what `npm run sync-resources` copies). */
export const RESOURCE_FILES = RESOURCES.map((r) => r.file);

/** resources/list entries: {uri, name, description, mimeType}. */
export function resourceList() {
  return RESOURCES.map(({ uri, name, description, mimeType }) => ({ uri, name, description, mimeType }));
}

const texts = new Map();

/** The text of a packaged resource file. */
export function resourceText(file) {
  if (!texts.has(file)) texts.set(file, readFileSync(join(RESOURCES_DIR, file), "utf8"));
  return texts.get(file);
}

/** The resource of `uri`, or null. */
export function resourceByUri(uri) {
  return RESOURCES.find((r) => r.uri === uri) ?? null;
}

let specs = null;
let catalog = null;
const specsSchema = () => (specs ??= JSON.parse(resourceText("specs-schema.json")));
const catalogue = () => (catalog ??= JSON.parse(resourceText("uidl-catalog.json")));

// ── text helpers (UidlValidator.quote / suggest / levenshtein) ────────────────────────────────

/** A value double-quoted with `\` and `"` escaped. */
export function quote(value) {
  return '"' + String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

export function levenshtein(a, b) {
  let previous = new Array(b.length + 1);
  let current = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) previous[j] = j;
  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    [previous, current] = [current, previous];
  }
  return previous[b.length];
}

/**
 * The closest candidate (equal ignoring case first, else the smallest edit distance ≤ 2 that is
 * also smaller than the value's length; ties go to the earlier candidate), or null.
 */
export function suggest(value, candidates) {
  const lower = value.toLowerCase();
  for (const c of candidates) if (c.toLowerCase() === lower) return c;
  let best = null;
  let bestDistance = Infinity;
  for (const c of candidates) {
    const d = levenshtein(lower, c.toLowerCase());
    if (d < bestDistance) {
      bestDistance = d;
      best = c;
    }
  }
  return best !== null && bestDistance <= 2 && bestDistance < value.length ? best : null;
}

// ── ComponentSchemas ──────────────────────────────────────────────────────────────────────────

/** {components: [{type, description, attributes}], count}, filtered by `query` (ignoring case). */
export function listComponents(query) {
  const needle = (query ?? "").trim().toLowerCase();
  const components = [];
  for (const c of catalogue().components ?? []) {
    const type = typeof c.type === "string" ? c.type : "";
    const description = typeof c.description === "string" ? c.description : "";
    if (needle && !type.toLowerCase().includes(needle) && !description.toLowerCase().includes(needle)) {
      continue;
    }
    components.push({
      type,
      description,
      attributes: (c.attributes ?? []).map((a) => (typeof a?.name === "string" ? a.name : "")),
    });
  }
  return { components, count: components.length };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function refs(node, into) {
  if (Array.isArray(node)) {
    for (const child of node) refs(child, into);
  } else if (isObject(node)) {
    const ref = node.$ref;
    if (typeof ref === "string" && ref.startsWith("#/$defs/")) into.push(ref.substring("#/$defs/".length));
    for (const child of Object.values(node)) refs(child, into);
  }
}

/**
 * {type, schema, definitions}: the $def of `type` with every def it references transitively,
 * sorted by name; a family (a def with oneOf) is included but not walked into.
 */
export function componentSchema(type) {
  const defs = specsSchema().$defs ?? {};
  const def = Object.prototype.hasOwnProperty.call(defs, type) ? defs[type] : undefined;
  if (def === undefined) {
    const suggestion = suggest(type, Object.keys(defs));
    throw new UserFacingError(
      "Unknown type " +
        quote(type) +
        "." +
        (suggestion !== null ? " Did you mean " + quote(suggestion) + "?" : "") +
        " See mateu_list_components.",
    );
  }
  const included = new Set();
  // Java's ArrayDeque used as a stack (push/pop at the head) fed by add (at the tail): the walk
  // order does not matter for the result (a set, sorted), only the closure does.
  const pending = [];
  if (!(isObject(def) && "oneOf" in def)) refs(def, pending);
  while (pending.length) {
    const name = pending.shift();
    if (name === type || included.has(name)) continue;
    included.add(name);
    const referenced = defs[name];
    if (referenced !== undefined && !(isObject(referenced) && "oneOf" in referenced)) refs(referenced, pending);
  }
  const definitions = {};
  for (const name of [...included].sort()) {
    if (Object.prototype.hasOwnProperty.call(defs, name)) definitions[name] = defs[name];
    else definitions[name] = null;
  }
  return { type, schema: def, definitions };
}

// ── validation / preview through the backend ──────────────────────────────────────────────────

export const VALIDATE_ACTION = "__validate__";
export const PREVIEW_ACTION = "__preview__";
export const YAML_KEY = "_yaml";
export const VALIDATION_KEY = "_validation";

/** The backend's __validate__ report for `yaml` at `route`. */
export async function validation(wire, route, yaml) {
  const increment = await wire.sync({
    route: route ?? "",
    actionId: VALIDATE_ACTION,
    parameters: { [YAML_KEY]: yaml ?? "" },
  });
  const report = increment?.appData?.[VALIDATION_KEY];
  if (!isObject(report)) {
    // refused, or failed: the answer's message says why
    const text = increment?.messages?.[0]?.text;
    throw new UserFacingError(typeof text === "string" ? text : "validation failed");
  }
  return report;
}

/** mateu_validate_uidl */
export function validate(wire, yaml) {
  return validation(wire, "", yaml);
}

/** mateu_preview_uidl: {rendered, screen | reason, validation}. */
export async function preview(wire, yaml, route = "") {
  const report = await validation(wire, route, yaml);
  const kind = typeof report.kind === "string" ? report.kind : "";
  if (report.valid !== true) {
    return { rendered: false, reason: "The definition has errors; fix them first.", validation: report };
  }
  if (kind !== "component" && kind !== "envelope") {
    return {
      rendered: false,
      reason: "Only a page (a component, or a layout: envelope) can be previewed.",
      validation: report,
    };
  }
  const increment = await wire.sync({
    route: route ?? "",
    actionId: PREVIEW_ACTION,
    parameters: { [YAML_KEY]: yaml },
  });
  return { rendered: true, screen: projectIncrement(increment), validation: report };
}

// ── mateu_save_spec (SpecWriter) ──────────────────────────────────────────────────────────────

const DRIVE = /^[A-Za-z]:/;

/** Whether `path` is acceptable before touching the disk. */
export function isAcceptablePath(path) {
  if (typeof path !== "string" || path.trim() === "" || path.length > 255) return false;
  if (path.includes("\0") || path.includes("\\") || path.startsWith("/") || DRIVE.test(path)) return false;
  if (!(path.endsWith(".yaml") || path.endsWith(".yml"))) return false;
  for (const segment of path.split("/")) {
    if (segment === "" || segment === "." || segment === "..") return false;
  }
  return true;
}

/** The message of a refused path (shown as written). */
export function refusal(path) {
  return (
    "Invalid path " +
    quote(path ?? "") +
    ': give a relative .yaml or .yml path inside the specs directory (no "..", no absolute path).'
  );
}

const inside = (child, parent) => child === parent || child.startsWith(parent.endsWith(sep) ? parent : parent + sep);

function isSymlink(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

/** Writes `yaml` at `path` under `root`, creating folders; returns the UTF-8 byte count. */
export function writeSpec(root, path, yaml) {
  if (!isAcceptablePath(path)) throw new UserFacingError(refusal(path));
  const base = resolve(root);
  const target = resolve(base, path);
  if (!inside(target, base)) throw new UserFacingError(refusal(path));
  const realBase = realpathSync(base);
  let existing = dirname(target);
  while (!existsSync(existing)) {
    const parent = dirname(existing);
    if (parent === existing) {
      existing = null;
      break;
    }
    existing = parent;
  }
  if (existing === null || !inside(realpathSync(existing), realBase)) throw new UserFacingError(refusal(path));
  if (isSymlink(target)) {
    let real;
    try {
      real = realpathSync(target);
    } catch {
      throw new UserFacingError(refusal(path)); // a dangling link: nowhere we can vouch for
    }
    if (!inside(real, realBase)) throw new UserFacingError(refusal(path));
  }
  mkdirSync(dirname(target), { recursive: true });
  const bytes = Buffer.from(yaml, "utf8");
  writeFileSync(target, bytes);
  return bytes.length;
}

/** The specs directory: MATEU_SPECS_DIR, else src/main/resources/specs/ui under cwd; null when absent. */
export function specsDir(env = process.env, cwd = process.cwd()) {
  const dir = resolve(cwd, env.MATEU_SPECS_DIR || join("src", "main", "resources", "specs", "ui"));
  return existsSync(dir) ? dir : null;
}

// ── what an agent may save (NM3) ──────────────────────────────────────────────────────────────
// An agent saves what a screen is made of — a page, a layout envelope, a partial, a business-component
// catalogue — and nothing that decides where a request goes or what it carries, or in dev mode it
// could re-point a proxied source at its own server and have the backend send it the source's
// secret. The messages are normative (Java/.NET/Python SpecWriter). The sidecar has no YAML parser,
// so its request rule reads the TEXT, conservatively: it refuses whatever the backends refuse (and,
// rarely, a page they would accept — e.g. one naming a source by `ref` beside an unrelated inline url).

const SAVABLE_KINDS = new Set(["component", "envelope", "partial", "components"]);
const CATALOGUE_NAMES = new Set(["sources", "routes", "actions", "types", "project"]);
const CATALOGUE_FOLDERS = new Set(["environments", "translations"]);

export const REQUEST_REFUSAL =
  "A definition saved by an agent may not reference a secret, proxy a request through the server or " +
  "override the request of a catalogue source; declare those in sources.yaml by hand.";

/** Whether `path` names a catalogue file (sources.yaml, environments/…): an agent never writes those. */
export function isCatalogueFile(path) {
  if (typeof path !== "string") return false;
  const segments = path.split("/");
  if (segments.length > 1 && CATALOGUE_FOLDERS.has(segments[0])) return true;
  const name = segments[segments.length - 1];
  const dot = name.lastIndexOf(".");
  return CATALOGUE_NAMES.has(dot >= 0 ? name.slice(0, dot) : name);
}

/** The message of a refused catalogue file (shown as written). */
export function catalogueRefusal(path) {
  return (
    "Refused path " +
    quote(path ?? "") +
    ": catalogue files (sources, routes, actions, types, project, environments, translations) are written by hand."
  );
}

const key = (name) => new RegExp(`(^|[\\s{,\\-])["']?${name}["']?\\s*:`, "m");
const REQUEST_KEYS = ["url", "baseUrl", "method", "headers", "body", "proxy"].map(key);

/** Why an agent may not save this definition, or null when it may. */
export function agentRefusal(kind, yaml) {
  if (typeof kind === "string" && !SAVABLE_KINDS.has(kind)) {
    return `Only a page, a partial or a business-component catalogue can be saved by an agent; a ${quote(kind)} definition is written by hand.`;
  }
  const text = typeof yaml === "string" ? yaml : "";
  // a secret, also spelled through a YAML escape of "$" (\u0024, \U00000024, \x24)
  if (/\$\{\s*secret\./.test(text) || /\\(u0024|U00000024|x24)/.test(text)) return REQUEST_REFUSAL;
  // any `proxy:` key (a value of false proxies nothing, but reading values needs a parser)
  if (key("proxy").test(text)) return REQUEST_REFUSAL;
  // a `ref:` beside any request key, anywhere in the text
  if (key("ref").test(text) && REQUEST_KEYS.some((k) => k.test(text))) return REQUEST_REFUSAL;
  return null;
}

/** mateu_save_spec: {saved:false, reason, validation} | {saved:true, path, bytes, validation}. */
export async function saveSpec(wire, path, yaml, dir) {
  if (!isAcceptablePath(path)) throw new UserFacingError(refusal(path));
  if (isCatalogueFile(path)) throw new UserFacingError(catalogueRefusal(path));
  const report = await validation(wire, "", yaml);
  const refused = agentRefusal(report.kind, yaml);
  if (refused !== null) {
    console.error(`mateu_save_spec refused ${JSON.stringify(String(path).slice(0, 256))}: ${refused}`);
    return { saved: false, reason: refused, validation: report };
  }
  if (report.valid !== true) {
    return { saved: false, reason: "The definition has errors; nothing was written.", validation: report };
  }
  const bytes = writeSpec(dir, path, yaml);
  return { saved: true, path, bytes, validation: report };
}
