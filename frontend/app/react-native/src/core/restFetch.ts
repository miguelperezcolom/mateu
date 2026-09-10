// Client-side consumption of arbitrary (non-Mateu) REST endpoints for widget-level surfaces
// (@RestOptions select options, @RestListing listing rows) — the RN analogue of the web's
// libs/mateu externalOptions.ts. url/headers/body are interpolated by the caller (pass a resolve
// that runs the shared `interpolate`); the endpoint is fetched directly, no Mateu server mediating.

type Json = Record<string, any>;

/** Client-side secure auth for DIRECT (non-proxy) external REST fetches: a host app registers a
 *  provider that supplies auth headers (e.g. a bearer token from a secure store) at fetch time, so
 *  the token stays on the device and never rides the Mateu wire — the client-direct counterpart of
 *  the server-side `proxy` mode. Ignored on the proxy path (secrets are injected server-side). */
export type ExternalAuthProvider = (ctx: {
  url: string;
  method: string;
}) => Record<string, string> | undefined | Promise<Record<string, string> | undefined>;

let authProvider: ExternalAuthProvider | undefined;

/** Register (or clear, with `undefined`) the direct-fetch auth-header provider. Its headers are
 *  merged LAST, so they win over any statically declared header of the same name. */
export function registerExternalAuthProvider(p: ExternalAuthProvider | undefined): void {
  authProvider = p;
}

/** Resolve the auth headers for a direct external fetch — `{}` with no provider / on error. */
export async function externalAuthHeaders(ctx: { url: string; method: string }): Promise<Record<string, string>> {
  if (!authProvider) return {};
  try {
    return (await authProvider(ctx)) ?? {};
  } catch (e) {
    console.warn('mateu: external auth provider failed', e);
    return {};
  }
}

/** Navigate a dot path (`data.items`, `name.common`) into a JSON value; an empty path is identity. */
export function getByPath(obj: unknown, path?: string): unknown {
  if (!path) return obj;
  return path.split('.').reduce<unknown>(
    (acc, key) => (acc != null && typeof acc === 'object' ? (acc as Json)[key] : undefined),
    obj,
  );
}

export interface FetchedOption {
  value: string;
  label: string;
}

/** Shape a JSON response into select options: navigate `itemsPath` to the array, then read
 *  `valuePath`/`labelPath` from each item (a primitive element becomes its own value and label). */
export function mapItemsToOptions(
  json: unknown,
  itemsPath?: string,
  valuePath = 'value',
  labelPath = 'label',
): FetchedOption[] {
  const arr = getByPath(json, itemsPath);
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (item != null && typeof item === 'object') {
      const value = getByPath(item, valuePath);
      const label = getByPath(item, labelPath);
      return { value: String(value ?? label ?? ''), label: String(label ?? value ?? '') };
    }
    return { value: String(item), label: String(item) };
  });
}

/** Shape a JSON response into listing rows: navigate `itemsPath` to the array, then read each
 *  column by its id as a dot path from each item (a row is an object keyed by column id). */
export function mapItemsToRows(json: unknown, itemsPath: string | undefined, columnIds: string[]): Json[] {
  const arr = getByPath(json, itemsPath);
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    const row: Json = {};
    for (const id of columnIds) row[id] = getByPath(item, id);
    return row;
  });
}

// ── REST source catalogue (resolution by `ref`) ─────────────────────────────
// The app ships a catalogue of named endpoints (AppDto.restSources); a surface may reference an
// entry by `ref` instead of inlining the url + mapping paths. This is the RN analogue of the web's
// libs/mateu restSourceCatalogue.ts: register the catalogue when the App metadata arrives, then
// resolve a `ref` to the entry's fields (the surface's own declared fields still win).
let catalogue: Record<string, Json> = {};

/** Store the app's REST source catalogue (`AppDto.restSources`, a list of `{name, source, …}`). */
export function registerRestSources(sources: unknown): void {
  const map: Record<string, Json> = {};
  if (Array.isArray(sources)) {
    for (const entry of sources) {
      const name = (entry as Json)?.['name'];
      if (typeof name === 'string' && name) map[name] = entry as Json;
    }
  }
  catalogue = map;
}

/** The catalogue entry for a name, or undefined. */
export function getRestSource(ref?: string): Json | undefined {
  return ref ? catalogue[ref] : undefined;
}

const blank = (s: unknown): boolean => s == null || s === '';

/** If `source` names a catalogue entry by `ref`, merge the entry's `source` fields under the
 *  surface's own (the surface wins where it declares a value). A source without a `ref` — or a ref
 *  the catalogue does not know — is returned untouched. Mirrors libs/mateu's `resolveRestSource`,
 *  including reading `proxy` off the RESOLVED source (a by-ref surface carries no proxy of its own). */
export function resolveRestSource(source: Json): Json {
  const ref = source?.['ref'];
  if (!ref) return source;
  const from = getRestSource(String(ref))?.['source'] as Json | undefined;
  if (!from) {
    console.warn(`mateu: no REST source named "${ref}" in the app's catalogue`);
    return source;
  }
  const srcHeaders = source['headers'] as Json | undefined;
  return {
    ...source,
    url: blank(source['url']) ? from['url'] : source['url'],
    method: blank(source['method']) ? from['method'] : source['method'],
    headers: srcHeaders && Object.keys(srcHeaders).length > 0 ? srcHeaders : from['headers'],
    body: blank(source['body']) ? from['body'] : source['body'],
    itemsPath: blank(source['itemsPath']) ? from['itemsPath'] : source['itemsPath'],
    valuePath: blank(source['valuePath']) ? from['valuePath'] : source['valuePath'],
    labelPath: blank(source['labelPath']) ? from['labelPath'] : source['labelPath'],
    proxy: source['proxy'] || from['proxy'],
  };
}

/** Interpolate url/headers/body of a RestDataSource and fetch it. `resolve` runs `${state.x}`
 *  interpolation. Resolves a `ref` against the catalogue first. Throws on a non-2xx response. */
export async function fetchExternalJson(declared: Json, resolve: (t: unknown) => string): Promise<unknown> {
  const source = resolveRestSource(declared);
  const url = resolve(source['url']);
  const method = String(source['method'] ?? 'GET').toUpperCase();
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries((source['headers'] as Json) ?? {})) headers[k] = resolve(v);
  // A registered client-side auth provider supplies dynamic headers (e.g. a bearer token) — merged
  // last so it wins over any declared header.
  Object.assign(headers, await externalAuthHeaders({ url, method }));
  const init: RequestInit = { method, headers };
  if (method !== 'GET' && method !== 'HEAD' && source['body']) init.body = resolve(source['body']);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`External REST fetch failed: ${res.status}`);
  return res.json();
}
