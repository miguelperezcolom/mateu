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

/** Interpolate url/headers/body of a RestDataSource and fetch it. `resolve` runs `${state.x}`
 *  interpolation. Throws on a non-2xx response. */
export async function fetchExternalJson(source: Json, resolve: (t: unknown) => string): Promise<unknown> {
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
