/**
 * The UI manifest (pure, unit-tested): `GET <baseUrl>/mateu/v3/manifest`, served by every Mateu
 * backend (design/mobile-app-hub.md §2):
 *
 *   { "name": "Acme CRM", "shortName": "CRM", "icon": "<url or data uri>", "themeColor": "#1f6feb",
 *     "wireVersion": "3", "minAppVersion": "1.0.0",
 *     "auth": { "type": "oidc", "issuer": "…", "clientId": "…", "scopes": ["openid", "profile"] } }
 *
 * Everything in it is shown to the user or acted on, and it comes from a server the user has not
 * trusted yet (the confirm screen is where they decide), so every field is validated and anything
 * odd is dropped rather than rendered: a name is plain text with a length cap, an icon is an https
 * URL (or http on a dev build) or a raster `data:image/…` URI, a colour is a hex literal.
 *
 * A UI with NO server — a static bundle (`mateu-bundle:bundle`), served by any static host — is
 * opened too. Its build writes the same manifest as a file (`<bundle>/mateu/v3/manifest`, computed by
 * the servers' own code) with one more member, `"bundle": "manifest.json"`: the bundle the app runs
 * from instead of calling `/mateu/v3/sync`. A bundle built before that file existed is recognised by
 * its `manifest.json` when the manifest path does not answer JSON, and named from its app shell.
 */
import { compareVersionStrings } from './version.ts';
import { MIN_WIRE_VERSION } from '../core/wireVersion.ts';
import { oidcConfigFrom, type OidcConfig } from '../core/oidcConfig.ts';
import { domainOf, normalizeBaseUrl } from './links.ts';
import { BUNDLE_MANIFEST, bundlePath, fetchStaticBundle, type StaticBundle } from '../core/staticBundle.ts';

export const MANIFEST_PATH = '/mateu/v3/manifest';
export const MAX_NAME = 60;
export const MAX_SHORT_NAME = 20;
export const MAX_ICON_DATA_URI = 200_000;

export interface UiManifest {
  name: string;
  shortName?: string;
  icon?: string;
  themeColor?: string;
  wireVersion?: string;
  minAppVersion?: string;
  auth?: OidcConfig;
  /** A STATIC UI: the bundle manifest it runs from, relative to its base URL (core/staticBundle.ts). */
  bundle?: string;
}

export type ManifestFetch =
  /** `bundle`: the static bundle already fetched while recognising a static UI. */
  | { ok: true; manifest: UiManifest; bundle?: StaticBundle }
  /** The server answered but publishes no manifest (an older Mateu): usable, named after its domain. */
  | { ok: true; manifest: UiManifest; missing: true }
  | { ok: false; reason: string; offline?: boolean };

const cleanText = (v: unknown, max: number): string | undefined => {
  if (typeof v !== 'string') return undefined;
  // strip control + bidi-override characters; collapse whitespace
  const t = v
    .replace(new RegExp('[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]', 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();
  return t ? t.slice(0, max) : undefined;
};

/** An icon the app may load: https (http on dev), resolved against the base URL when relative, or a
 *  raster data URI (svg is excluded — it can carry script on the web build). */
export function resolveIcon(icon: unknown, baseUrl: string, allowInsecure = false): string | undefined {
  if (typeof icon !== 'string' || !icon.trim()) return undefined;
  const v = icon.trim();
  if (v.startsWith('data:')) {
    return /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= MAX_ICON_DATA_URI ? v : undefined;
  }
  let absolute: string;
  if (/^https?:\/\//i.test(v)) absolute = v;
  else if (v.startsWith('//') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) return undefined;
  else {
    const origin = /^(https?:\/\/[^/]+)/i.exec(baseUrl)?.[1];
    if (!origin) return undefined;
    absolute = v.startsWith('/') ? `${origin}${v}` : `${baseUrl.replace(/\/+$/, '')}/${v}`;
  }
  // validate scheme/host/path like a base URL (no userinfo, no hidden characters), keep the query
  if (!normalizeBaseUrl(absolute.split(/[?#]/)[0], { allowInsecure }).ok || /\s/.test(absolute)) return undefined;
  return absolute.split('#')[0];
}

/** Validates a manifest answer. Never throws; a missing name falls back to the domain. */
export function parseManifest(raw: unknown, baseUrl: string, allowInsecure = false): UiManifest {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const name = cleanText(r['name'], MAX_NAME) ?? domainOf(baseUrl);
  const manifest: UiManifest = { name };
  const shortName = cleanText(r['shortName'], MAX_SHORT_NAME);
  if (shortName) manifest.shortName = shortName;
  const icon = resolveIcon(r['icon'], baseUrl, allowInsecure);
  if (icon) manifest.icon = icon;
  if (typeof r['themeColor'] === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(r['themeColor'])) {
    manifest.themeColor = r['themeColor'].toLowerCase();
  }
  const wire = r['wireVersion'];
  if (typeof wire === 'string' || typeof wire === 'number') manifest.wireVersion = String(wire);
  if (typeof r['minAppVersion'] === 'string' && /^\d+(\.\d+){0,3}$/.test(r['minAppVersion'])) {
    manifest.minAppVersion = r['minAppVersion'];
  }
  const auth = authOf(r['auth'], allowInsecure);
  if (auth) manifest.auth = auth;
  const bundle = bundleOf(r['bundle']);
  if (bundle) manifest.bundle = bundle;
  return manifest;
}

/** The manifest's sign-in, when its identity provider is https too: the user's password goes there. */
function authOf(raw: unknown, allowInsecure: boolean): UiManifest['auth'] {
  const auth = oidcConfigFrom(raw);
  if (!auth) return undefined;
  const secure = /^https:\/\//i.test(auth.issuer) || (allowInsecure && /^http:\/\//i.test(auth.issuer));
  return secure ? auth : undefined;
}

/** A static UI's bundle: only a plain relative .json path — never another host (core/staticBundle.ts). */
function bundleOf(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw ? bundlePath(raw) : undefined;
}

export type VersionGate = { ok: true } | { ok: false; reason: string };

/** Can THIS app render that UI? A different wire major, or a minAppVersion above ours → "Update the app". */
export function versionGate(manifest: UiManifest, appVersion: string): VersionGate {
  if (manifest.wireVersion) {
    const major = parseInt(manifest.wireVersion, 10);
    const ours = parseInt(MIN_WIRE_VERSION, 10);
    if (Number.isFinite(major) && major > ours) {
      return { ok: false, reason: `This app uses a newer Mateu (wire ${manifest.wireVersion}) than this version of the Mateu app understands.` };
    }
    if (Number.isFinite(major) && major < ours) {
      return { ok: false, reason: `This app's server is too old for this version of the Mateu app (wire ${manifest.wireVersion}).` };
    }
  }
  if (manifest.minAppVersion && compareVersionStrings(appVersion, manifest.minAppVersion) < 0) {
    return { ok: false, reason: `This app needs Mateu ${manifest.minAppVersion} or later; you have ${appVersion}.` };
  }
  return { ok: true };
}

type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text?(): Promise<string>;
}>;

/**
 * Is there a static bundle at `baseUrl`? Asked only when the manifest path did not answer a manifest
 * (no such endpoint, or a static host's SPA fallback answering its index.html): a bundle is then
 * named from its own app shell, validated like a manifest.
 */
async function recogniseBundle(baseUrl: string, fetchImpl: FetchLike, allowInsecure?: boolean): Promise<ManifestFetch | undefined> {
  const found = await fetchStaticBundle(baseUrl, BUNDLE_MANIFEST, {
    fetchImpl: async (url, init) => {
      const res = await fetchImpl(url, init);
      return { ok: res.ok, status: res.status, text: async () => (res.text ? res.text() : JSON.stringify(await res.json())) };
    },
  });
  if (!found.ok) return undefined;
  const manifest = parseManifest(found.bundle.uiManifestSource(), baseUrl, allowInsecure);
  manifest.bundle = BUNDLE_MANIFEST;
  return { ok: true, manifest, bundle: found.bundle };
}

/** Fetches + validates the manifest. Network errors are `offline` (the cached copy is then used). */
export async function fetchManifest(
  baseUrl: string,
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
  options: { allowInsecure?: boolean; timeoutMs?: number } = {},
): Promise<ManifestFetch> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timer = controller ? setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000) : undefined;
  try {
    const res = await fetchImpl(`${baseUrl}${MANIFEST_PATH}`, { headers: { Accept: 'application/json' }, signal: controller?.signal });
    if (res.status === 404 || res.status === 405) {
      return (await recogniseBundle(baseUrl, fetchImpl, options.allowInsecure)) ?? { ok: true, manifest: { name: domainOf(baseUrl) }, missing: true };
    }
    if (!res.ok) return { ok: false, reason: `The server answered with an error (HTTP ${res.status}).` };
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return (await recogniseBundle(baseUrl, fetchImpl, options.allowInsecure)) ?? { ok: false, reason: 'The server is not a Mateu app (its manifest is not JSON).' };
    }
    return { ok: true, manifest: parseManifest(body, baseUrl, options.allowInsecure) };
  } catch {
    return { ok: false, reason: "Can't reach the server. Check the address and your connection.", offline: true };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
