/**
 * Build variants of the installable (pure: no Expo, no React — app.config.ts imports it and node
 * --test runs it).
 *
 *  - `hub` (default): the generic "Mateu" app — the user's own list of UIs, added by QR / address /
 *    deep link (src/hub). It owns the `mateu://add`, `mateu://import` and `https://mateu.io/add` links.
 *  - `fixed`: a white-label installable bound to ONE UI — a base URL baked in at build time
 *    (`MATEU_FIXED_URL`, optional `MATEU_FIXED_ROUTE`) or app-registry coordinates
 *    (`MATEU_REGISTRY_URL` + `MATEU_APP_ID`). No hub, no QR scanner, and it claims NONE of the hub's
 *    links: a branded app must not answer for every Mateu UI a QR points at. Its own scheme
 *    (`MATEU_APP_SCHEME`) only carries the sign-in redirect.
 *
 * Name / ids: `MATEU_APP_NAME`, `MATEU_BUNDLE_ID` (iOS bundle identifier AND Android package).
 */

export type Variant = 'hub' | 'fixed';

export interface VariantEnv {
  MATEU_VARIANT?: string;
  MATEU_FIXED_URL?: string;
  MATEU_FIXED_ROUTE?: string;
  MATEU_REGISTRY_URL?: string;
  MATEU_APP_ID?: string;
  MATEU_APP_NAME?: string;
  MATEU_BUNDLE_ID?: string;
  MATEU_APP_SCHEME?: string;
}

/** The slice of the Expo config a variant touches (structural, so this file needs no Expo types). */
export interface VariantConfig {
  name?: string;
  scheme?: string | string[];
  extra?: Record<string, unknown>;
  ios?: { bundleIdentifier?: string; associatedDomains?: string[]; infoPlist?: Record<string, unknown>; [k: string]: unknown };
  android?: { package?: string; intentFilters?: unknown[]; [k: string]: unknown };
  plugins?: unknown[];
  [k: string]: unknown;
}

/** The sign-in redirect scheme of the hub (app.json `expo.scheme`). */
export const HUB_SCHEME = 'mateu';

const SCHEME = /^[a-z][a-z0-9+.-]*$/;
const BUNDLE_ID = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

export function variantOf(env: VariantEnv): Variant {
  const v = (env.MATEU_VARIANT ?? '').trim().toLowerCase();
  if (v === '' || v === 'hub') return 'hub';
  if (v === 'fixed') return 'fixed';
  throw new Error(`MATEU_VARIANT must be hub or fixed, not '${env.MATEU_VARIANT}'`);
}

/** Applies the variant to the Expo config (app.json's values are the hub's). */
export function applyVariant<C extends object>(input: C, env: VariantEnv): C {
  const config = input as VariantConfig;
  const variant = variantOf(env);
  const extra = { ...(config.extra ?? {}), mateuVariant: variant };
  if (variant === 'hub') return { ...config, extra } as unknown as C;

  const fixedUrl = (env.MATEU_FIXED_URL ?? '').trim();
  const registryUrl = (env.MATEU_REGISTRY_URL ?? '').trim();
  const appId = (env.MATEU_APP_ID ?? '').trim();
  if (!fixedUrl && !(registryUrl && appId)) {
    throw new Error('a fixed build needs its UI: MATEU_FIXED_URL, or MATEU_REGISTRY_URL + MATEU_APP_ID');
  }
  if (fixedUrl && !/^https?:\/\/[^/?#\s]+/i.test(fixedUrl)) {
    throw new Error(`MATEU_FIXED_URL must be an http(s) URL, not '${fixedUrl}'`);
  }
  const bundleId = (env.MATEU_BUNDLE_ID ?? '').trim();
  if (bundleId && !BUNDLE_ID.test(bundleId)) throw new Error(`MATEU_BUNDLE_ID is not a bundle id: '${bundleId}'`);
  const scheme = (env.MATEU_APP_SCHEME ?? '').trim() || (bundleId ? bundleId.toLowerCase().replace(/[^a-z0-9+.-]/g, '-') : 'mateu-app');
  if (!SCHEME.test(scheme) || scheme === HUB_SCHEME) {
    throw new Error(`MATEU_APP_SCHEME must be a URL scheme other than '${HUB_SCHEME}', not '${scheme}'`);
  }

  const name = (env.MATEU_APP_NAME ?? '').trim() || config.name;
  const iosPlist = { ...(config.ios?.infoPlist ?? {}) };
  if ('NSCameraUsageDescription' in iosPlist) {
    // the camera stays (photo fields), but there is no QR to scan
    iosPlist.NSCameraUsageDescription = `${name} uses the camera for the photo fields of its screens.`;
  }
  const { associatedDomains: _domains, ...ios } = config.ios ?? {};
  const { intentFilters: _filters, ...android } = config.android ?? {};
  const plugins = (config.plugins ?? []).map((p) =>
    Array.isArray(p) && p[0] === 'expo-camera'
      ? ['expo-camera', { ...(p[1] ?? {}), cameraPermission: `${name} uses the camera for the photo fields of its screens.` }]
      : p,
  );

  return {
    ...config,
    name,
    scheme,
    plugins,
    ios: { ...ios, infoPlist: iosPlist, ...(bundleId ? { bundleIdentifier: bundleId } : {}) },
    android: { ...android, ...(bundleId ? { package: bundleId } : {}) },
    extra: {
      ...extra,
      mateuFixedUrl: fixedUrl,
      mateuFixedRoute: (env.MATEU_FIXED_ROUTE ?? '').trim(),
      mateuRegistryUrl: registryUrl || (config.extra?.mateuRegistryUrl ?? ''),
      mateuAppId: appId || (config.extra?.mateuAppId ?? ''),
    },
  } as unknown as C;
}

/** What the app boots into, from the config's `extra` (+ the dev overrides of a developer run). */
export type BootMode =
  | { kind: 'hub' }
  | { kind: 'registry'; registryUrl: string; appId: string }
  | { kind: 'fixed'; baseUrl: string; route: string }
  | { kind: 'direct' };

export function bootModeOf(extra: Record<string, unknown>, direct: boolean, envRegistry?: { registryUrl?: string; appId?: string }): BootMode {
  const str = (k: string) => (typeof extra[k] === 'string' ? (extra[k] as string).trim() : '');
  const registryUrl = str('mateuRegistryUrl') || (envRegistry?.registryUrl ?? '');
  const appId = str('mateuAppId') || (envRegistry?.appId ?? '');
  // a developer pointing the renderer at one backend wins over everything baked in
  if (direct) return { kind: 'direct' };
  if (str('mateuFixedUrl')) return { kind: 'fixed', baseUrl: str('mateuFixedUrl').replace(/\/+$/, ''), route: str('mateuFixedRoute') };
  if (registryUrl && appId) return { kind: 'registry', registryUrl, appId };
  return { kind: 'hub' };
}

/** Whether the hub (and with it the QR scanner and the add/import links) exists in this build. */
export function hubEnabled(extra: Record<string, unknown>): boolean {
  return extra['mateuVariant'] !== 'fixed';
}
