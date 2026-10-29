/**
 * A UI with NO backend: a static bundle (`mateu-bundle:bundle` → `<base>/manifest.json` + the web
 * renderer's files) opened natively. The web renderers boot from that manifest and answer every
 * route LOAD from it instead of POSTing `/mateu/v3/sync`; this is the same for the native renderer.
 *
 * The rules are NOT re-implemented here: which load answers a route (pre-rendered entry, :param
 * template, or a raw definition expanded on the device by the client-side expander — whatever web
 * renderer the project picked), the shell-vs-content rule (#557) and the route-parameter precedence
 * all come from the web's own resolver (libs/mateu http/bundleResolver.ts, via src/shared/mateuLib.ts).
 * What this file adds is what a native client has to decide itself:
 *  - the bundle is DATA: it is fetched as JSON, checked for the bundle's shape, and only ever read —
 *    nothing in it is executed, downloaded as code or evaluated (definitions are expanded by the
 *    app's own expander, exactly as a server's answer would be rendered);
 *  - one bundle per running UI (the hub runs several): the expander's process-wide catalogues are
 *    primed with THIS bundle's before each expansion;
 *  - the app shell is handed the manifest's source catalogue (with its sample data when the bundle
 *    was built with the mock flag), so `rowsSource: {ref: …}` and `restAction`s resolve on the device.
 *
 * Server ACTIONS do not exist in a static bundle (the build's staticOnly check refuses them): one
 * that reaches the transport fails with a plain message instead of POSTing to a host that serves
 * files.
 */
import {
  appShellOf,
  isBundleManifest,
  mentionsI18n,
  parseBundleManifest,
  pickLocale,
  resolveLoad,
  rootIncrement,
  setActionCatalogue,
  setComponentCatalogue,
  setFieldTypeCatalogue,
  toSyncPath,
  translateDeep,
  type BundleManifest,
  type BundleState,
  type Localize,
} from '../shared/mateuLib.ts';
import { uiLocale } from './money.ts';
import { withoutTrailingSlashes } from './trailingSlashes.ts';

type Json = Record<string, unknown>;

/** Where `mateu-bundle:bundle` writes the manifest, relative to the bundle's base URL. */
export const BUNDLE_MANIFEST = 'manifest.json';

/** A bundle manifest larger than this is refused (a hostile URL must not exhaust the device). */
export const MAX_BUNDLE_BYTES = 20_000_000;

/** What a route load sends — the subset of MateuApiClient's RunActionParams the bundle reads. */
export interface BundleRequest {
  route: string;
  consumedRoute: string;
  actionId: string;
}

/**
 * The path of a bundle manifest relative to the UI's base URL: `manifest.json` unless the UI's own
 * manifest names another. Only a plain relative `.json` path is accepted — no scheme, no host, no
 * `..`, no query: what a UI manifest says must never point the app at another server.
 */
export function bundlePath(path: unknown): string | undefined {
  if (path === undefined || path === null || path === '') return BUNDLE_MANIFEST;
  if (typeof path !== 'string' || path.length > 200) return undefined;
  const p = path.trim();
  if (!/^[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*\.json$/.test(p)) return undefined;
  if (p.split('/').some((s) => s === '..' || s === '.')) return undefined;
  return p;
}

/** The URL of a bundle manifest: `<baseUrl>/<path>`. */
export const bundleUrl = (baseUrl: string, path: string = BUNDLE_MANIFEST): string =>
  `${withoutTrailingSlashes(baseUrl)}/${path}`;

const deepCopy = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export class StaticBundle {
  readonly baseUrl: string;
  readonly manifest: BundleManifest;
  readonly state: BundleState;
  /** The device's preferred locales, most preferred first (for `${i18n.…}`). */
  private readonly locales: () => string[];

  constructor(manifest: BundleManifest, baseUrl: string, locales: () => string[] = () => [uiLocale()]) {
    this.manifest = manifest;
    this.baseUrl = withoutTrailingSlashes(baseUrl);
    this.state = parseBundleManifest(manifest);
    this.locales = locales;
  }

  /** The REST source catalogue the bundle ships (with sample data in a mock build). */
  get sources(): unknown[] {
    return (this.manifest.sources?.sources ?? []) as unknown[];
  }

  /** A bundle built with `-Dmateu.bundle.mock=true`: sources answer with their samples. */
  get mockSources(): boolean {
    return this.manifest.mockSources === true;
  }

  /** The action catalogue (already lowered) the bundle ships. */
  get actions(): unknown[] {
    return (this.manifest.actions ?? []) as unknown[];
  }

  /** The root app shell's metadata, pre-rendered or expanded — undefined when the mount has none. */
  rootShell(): Json | undefined {
    this.prime();
    return appShellOf(rootIncrement(this.state, this.localize)) as Json | undefined;
  }

  /**
   * What the hub shows for this UI when its host publishes no UI manifest (`/mateu/v3/manifest`):
   * the app shell's title, logo and accent colour — raw, to go through the hub's own validation
   * (hub/manifest.ts parseManifest) like any server's answer.
   */
  uiManifestSource(): Json {
    const shell = this.rootShell() ?? {};
    const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
    const fromDefinition = Object.values(this.state.definitions ?? {}).find(
      (d) => (d as Json)?.['type'] === 'AppShell',
    ) as Json | undefined;
    return {
      name: text(shell['title']) ?? text(shell['pageTitle']) ?? text(fromDefinition?.['title']),
      icon: text(shell['logo']) ?? text(shell['favicon']),
      themeColor: text(shell['accentColor']),
    };
  }

  /**
   * The bundle's answer to a request — what the server would have answered. A LOAD (no action id)
   * is resolved from the bundle; anything else is a server action, which a static UI cannot run.
   */
  answer(request: BundleRequest): Json {
    if (request.actionId) {
      throw new Error(`This UI has no server: "${request.actionId}" cannot run here.`);
    }
    this.prime();
    const syncPath = toSyncPath(request.route);
    const increment = resolveLoad(this.state, syncPath, request.consumedRoute, this.localize);
    if (!increment) throw new Error(`Not found: ${request.route || '/'}`);
    return this.withCatalogue(deepCopy(increment) as unknown as Json);
  }

  /** `${i18n.…}` resolved for the app's locale, else the device's (the web's order). */
  private readonly localize: Localize = <T,>(value: T): T => {
    const translations = this.state.translations ?? {};
    if (value === undefined || !Object.keys(translations).length || !mentionsI18n(value)) return value;
    const own = appShellOf(this.state.increments.get('_no_route'))?.['locale'];
    const locale = pickLocale(translations, [typeof own === 'string' ? own : undefined, ...this.locales()]);
    const fallback = pickLocale(translations, []);
    return translateDeep(value, locale ? translations[locale] : undefined,
      fallback && fallback !== locale ? translations[fallback] : undefined);
  };

  /** The expander reads process-wide catalogues: aim them at THIS bundle before expanding. */
  private prime(): void {
    setActionCatalogue(this.manifest.actions as never);
    setFieldTypeCatalogue(this.manifest.types?.types);
    setComponentCatalogue(undefined);
  }

  /** The app shell carries the manifest's catalogue (and the mock flag): re-pointing a deployment is
   *  an edit of manifest.json's `sources`, so the bundle's table wins over what was pre-rendered. */
  private withCatalogue(increment: Json): Json {
    const fragments = increment['fragments'];
    if (!Array.isArray(fragments)) return increment;
    for (const fragment of fragments as Json[]) {
      const metadata = (fragment?.['component'] as Json | undefined)?.['metadata'] as Json | undefined;
      if (metadata?.['type'] !== 'App') continue;
      metadata['restSources'] = deepCopy(this.sources);
      if (this.mockSources) metadata['mockSources'] = true;
      if (Array.isArray(this.manifest.actions)) metadata['actionCatalogue'] = deepCopy(this.manifest.actions);
    }
    return increment;
  }
}

export type BundleFetch =
  /** `text`/`etag`: what a cache keeps to revalidate it later (If-None-Match). */
  | { ok: true; bundle: StaticBundle; text?: string; etag?: string }
  /** Revalidation: the cached copy (its ETag was sent) is still the current one (HTTP 304). */
  | { ok: false; reason: string; notModified: true }
  /** The address answered, but not with a bundle manifest (a server, an ordinary site). */
  | { ok: false; reason: string; notABundle: true }
  | { ok: false; reason: string; offline?: boolean };

type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
  headers?: { get(name: string): string | null };
}>;

/** A bundle from manifest text already at hand (a cached copy); null when it is not one. */
export function bundleFromText(text: string, baseUrl: string, locales?: () => string[]): StaticBundle | null {
  try {
    const raw: unknown = JSON.parse(text);
    return isBundleManifest(raw) ? new StaticBundle(raw, baseUrl, locales) : null;
  } catch {
    return null;
  }
}

/** Fetches and checks a bundle manifest. Never throws. */
export async function fetchStaticBundle(
  baseUrl: string,
  path: string = BUNDLE_MANIFEST,
  options: { fetchImpl?: FetchLike; timeoutMs?: number; locales?: () => string[]; ifNoneMatch?: string } = {},
): Promise<BundleFetch> {
  const safe = bundlePath(path);
  if (!safe) return { ok: false, reason: 'The UI names an invalid bundle.', notABundle: true };
  const fetchImpl = options.fetchImpl ?? (fetch as unknown as FetchLike);
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timer = controller ? setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000) : undefined;
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.ifNoneMatch) headers['If-None-Match'] = options.ifNoneMatch;
    const res = await fetchImpl(bundleUrl(baseUrl, safe), { headers, signal: controller?.signal });
    if (res.status === 304 && options.ifNoneMatch) return { ok: false, reason: 'Not modified.', notModified: true };
    if (!res.ok) return { ok: false, reason: `No static UI at this address (HTTP ${res.status}).`, notABundle: true };
    const text = await res.text();
    if (text.length > MAX_BUNDLE_BYTES) return { ok: false, reason: 'The UI is too large to open.', notABundle: true };
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return { ok: false, reason: 'The server is not a Mateu app.', notABundle: true };
    }
    if (!isBundleManifest(raw)) return { ok: false, reason: 'The server is not a Mateu app.', notABundle: true };
    const etag = res.headers?.get?.('etag') ?? undefined;
    return { ok: true, bundle: new StaticBundle(raw, baseUrl, options.locales), text, ...(etag ? { etag } : {}) };
  } catch {
    return { ok: false, reason: "Can't reach the server. Check the address and your connection.", offline: true };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
