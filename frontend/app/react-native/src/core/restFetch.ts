// Client-side consumption of arbitrary (non-Mateu) REST endpoints for widget-level surfaces
// (@RestOptions select options, @RestListing listing rows) — the RN analogue of the web's
// libs/mateu externalOptions.ts. url/headers/body are interpolated by the caller (pass a resolve
// that runs the shared `interpolate`); the endpoint is fetched directly, no Mateu server mediating.

import { withoutTrailingSlashes } from './trailingSlashes.ts';

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
//
// The catalogue belongs to ONE app: the hub runs several in one process, so each hub session owns
// a `RestSourceCatalogue` (MateuSession.sources). The module-level functions below act on the
// process-wide one, which the single-backend app (and its sessions) use.

const blank = (s: unknown): boolean => s == null || s === '';

const deepCopy = (v: unknown): unknown =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));

export class RestSourceCatalogue {
  private catalogue: Record<string, Json> = {};
  // The entries a RESPONSE named (`UIIncrementDto.restSources`): a page served with no app shell
  // never receives the App's catalogue, so each response carries the entries its components
  // reference. Merged by name and consulted only after the App's catalogue.
  private referenced: Record<string, Json> = {};
  // A source may carry SAMPLE data (`sample:` / `sampleFile:` in sources.yaml, or `sample:` inline):
  // the response the endpoint would return. It is answered INSTEAD of calling the endpoint only in
  // sample mode — the same rule as libs/mateu restSourceCatalogue.ts and the server's SampleSources:
  // RN has no editor and loads no bundles, so the ONLY switch is the app metadata (`AppDto.mockSources:
  // true`, sent when the server opted in with mateu.sources.mock=true). It is only ever switched ON by
  // the app; an app without the flag leaves it as it is. Never silently in production.
  private sampleMode = false;

  /**
   * The base a RELATIVE source url (`/api/products`) is resolved against. On the web it is the page;
   * a static bundle opened natively has no page, so its sources are relative to the bundle's base
   * URL (set by the session that opens one). Undefined = urls are used as declared.
   */
  relativeBase: string | undefined;

  /** The url a fetch goes to: a relative one made absolute against {@link relativeBase}. */
  absolute(url: string): string {
    const base = this.relativeBase;
    if (!base || !url || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) || url.startsWith('//')) return url;
    const origin = /^(https?:\/\/[^/?#]+)/i.exec(base)?.[1];
    if (!origin) return url;
    return url.startsWith('/') ? `${origin}${url}` : `${withoutTrailingSlashes(base)}/${url}`;
  }

  /** Store the app's REST source catalogue (`AppDto.restSources`, a list of `{name, source, …}`). */
  register(sources: unknown): void {
    const map: Record<string, Json> = {};
    if (Array.isArray(sources)) {
      for (const entry of sources) {
        const name = (entry as Json)?.['name'];
        if (typeof name === 'string' && name) map[name] = entry as Json;
      }
    }
    this.catalogue = map;
  }

  /** Add the catalogue entries a response references (its `restSources`). */
  addReferenced(sources: unknown): void {
    if (!Array.isArray(sources)) return;
    for (const entry of sources) {
      const name = (entry as Json)?.['name'];
      if (typeof name === 'string' && name) this.referenced = { ...this.referenced, [name]: entry as Json };
    }
  }

  /** Forget what responses named. */
  clearReferenced(): void {
    this.referenced = {};
  }

  /** The catalogue entry for a name — the App's first, then what responses named — or undefined. */
  get(ref?: string): Json | undefined {
    return ref ? this.catalogue[ref] ?? this.referenced[ref] : undefined;
  }

  /** If `source` names a catalogue entry by `ref`, merge the entry's `source` fields under the
   *  surface's own (the surface wins where it declares a value). A source without a `ref` — or a ref
   *  the catalogue does not know — is returned untouched. Mirrors libs/mateu's `resolveRestSource`,
   *  including reading `proxy` off the RESOLVED source (a by-ref surface carries no proxy of its own). */
  resolve(source: Json): Json {
    const ref = source?.['ref'];
    if (!ref) return source;
    const from = this.get(String(ref))?.['source'] as Json | undefined;
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
      // the entry's sample (or the one its own source carries) unless the surface declares one
      sample: source['sample'] !== undefined && source['sample'] !== null
        ? source['sample']
        : (this.get(String(ref))?.['sample'] ?? from['sample']),
    };
  }

  /** Turns sample mode on (or off — only tests do that). */
  setSampleMode(on: boolean): void {
    this.sampleMode = !!on;
  }

  /** Whether sources carrying sample data answer with it. */
  isSampleMode(): boolean {
    return this.sampleMode;
  }

  /** The sample a source answers with in sample mode (resolving its `ref`); undefined when it is
   *  not answered from a sample (sample mode off, or the source carries none). */
  sampleOf(source: Json | undefined): unknown {
    if (!this.sampleMode || !source) return undefined;
    const resolved = this.resolve(source);
    return resolved?.['sample'] === null ? undefined : resolved?.['sample'];
  }

  /** True when this source is answered from its sample — neither fetched nor proxied, and a
   *  listing over it searches, filters, sorts and pages in memory. */
  isSampled(source: Json | undefined): boolean {
    return this.sampleOf(source) !== undefined;
  }

  /** Whether the fetch of this source goes through the Mateu server: the RESOLVED `proxy`, unless
   *  sample mode answers it on the device. */
  viaProxy(source: Json | undefined): boolean {
    return !!source && !!this.resolve(source)?.['proxy'] && !this.isSampled(source);
  }

  /** The sample-mode answer for a call: a READ gets a deep copy of the sample, a WRITE succeeds
   *  with null (nothing persisted, nothing to merge). `undefined` = not sampled, do the real call. */
  sampledResponse(source: Json | undefined, method?: string): unknown {
    if (!this.isSampled(source)) return undefined;
    const m = String(method ?? 'GET').toUpperCase();
    if (m !== 'GET' && m !== 'HEAD') return null;
    return deepCopy(this.sampleOf(source));
  }
}

/** The process-wide catalogue: the single-backend app's (hub sessions own theirs). */
export const sharedRestSources = new RestSourceCatalogue();

/** Store the app's REST source catalogue (`AppDto.restSources`, a list of `{name, source, …}`). */
export function registerRestSources(sources: unknown): void {
  sharedRestSources.register(sources);
}

/** Add the catalogue entries a response references (its `restSources`). */
export function addReferencedRestSources(sources: unknown): void {
  sharedRestSources.addReferenced(sources);
}

/** Test hook: forget what responses named. */
export function clearReferencedRestSources(): void {
  sharedRestSources.clearReferenced();
}

/** The catalogue entry for a name — the App's first, then what responses named — or undefined. */
export function getRestSource(ref?: string): Json | undefined {
  return sharedRestSources.get(ref);
}

/** See `RestSourceCatalogue.resolve` (on the process-wide catalogue). */
export function resolveRestSource(source: Json): Json {
  return sharedRestSources.resolve(source);
}

/** Turns sample mode on (or off — only tests do that). */
export function setSampleMode(on: boolean): void {
  sharedRestSources.setSampleMode(on);
}

/** Whether sources carrying sample data answer with it. */
export function isSampleMode(): boolean {
  return sharedRestSources.isSampleMode();
}

/** See `RestSourceCatalogue.sampleOf`. */
export function sampleOf(source: Json | undefined): unknown {
  return sharedRestSources.sampleOf(source);
}

/** See `RestSourceCatalogue.isSampled`. */
export function isSampled(source: Json | undefined): boolean {
  return sharedRestSources.isSampled(source);
}

/** See `RestSourceCatalogue.viaProxy`. */
export function viaProxy(source: Json | undefined): boolean {
  return sharedRestSources.viaProxy(source);
}

/** See `RestSourceCatalogue.sampledResponse`. */
export function sampledResponse(source: Json | undefined, method?: string): unknown {
  return sharedRestSources.sampledResponse(source, method);
}

/** Interpolate url/headers/body of a RestDataSource and fetch it. `resolve` runs `${state.x}`
 *  interpolation. Resolves a `ref` against the catalogue first (the app's own: pass its session's
 *  `sources`; the process-wide one by default). Throws on a non-2xx response. */
export async function fetchExternalJson(
  declared: Json,
  resolve: (t: unknown) => string,
  resolveUrl: (t: unknown) => string = resolve,
  sources: RestSourceCatalogue = sharedRestSources,
): Promise<unknown> {
  const source = sources.resolve(declared);
  // SAMPLE mode: a sampled source is not fetched — a read gets a copy of the sample, a write null.
  if (sources.isSampled(declared)) return sources.sampledResponse(declared, String(source['method'] ?? 'GET'));
  // the url resolves with its values percent-encoded by position (interpolateUrl), like the proxy
  const url = sources.absolute(resolveUrl(source['url']));
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
