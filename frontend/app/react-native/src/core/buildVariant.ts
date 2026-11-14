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
 * Face (a `fixed` build only — the hub keeps Mateu's): `MATEU_APP_ICON` (iOS, 1024 px PNG),
 * `MATEU_ADAPTIVE_ICON` (+ `MATEU_ADAPTIVE_ICON_BACKGROUND` colour, `MATEU_MONOCHROME_ICON`) for
 * Android, `MATEU_SPLASH_IMAGE` (+ `MATEU_SPLASH_BACKGROUND`). Paths are relative to this project or
 * absolute; whatever is not given keeps app.json's.
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
  MATEU_APP_ICON?: string;
  MATEU_ADAPTIVE_ICON?: string;
  MATEU_ADAPTIVE_ICON_BACKGROUND?: string;
  MATEU_MONOCHROME_ICON?: string;
  MATEU_SPLASH_IMAGE?: string;
  MATEU_SPLASH_BACKGROUND?: string;
}

const COLOUR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** A white-label build's own icons and splash, over app.json's (pure: the paths are not opened here). */
export function faceOf(env: VariantEnv): {
  icon?: string; adaptiveIcon: Record<string, string>; splash: Record<string, string>;
} {
  const v = (k: keyof VariantEnv) => (env[k] ?? '').trim();
  const colour = (k: keyof VariantEnv) => {
    const c = v(k);
    if (c && !COLOUR.test(c)) throw new Error(`${k} must be a #rrggbb colour, not '${c}'`);
    return c;
  };
  const image = (k: keyof VariantEnv) => {
    const p = v(k);
    if (p && !/\.png$/i.test(p)) throw new Error(`${k} must be a .png image, not '${p}'`);
    return p;
  };
  const adaptiveIcon: Record<string, string> = {};
  if (image('MATEU_ADAPTIVE_ICON')) adaptiveIcon.foregroundImage = v('MATEU_ADAPTIVE_ICON');
  if (image('MATEU_MONOCHROME_ICON')) adaptiveIcon.monochromeImage = v('MATEU_MONOCHROME_ICON');
  if (colour('MATEU_ADAPTIVE_ICON_BACKGROUND')) adaptiveIcon.backgroundColor = v('MATEU_ADAPTIVE_ICON_BACKGROUND');
  const splash: Record<string, string> = {};
  if (image('MATEU_SPLASH_IMAGE')) splash.image = v('MATEU_SPLASH_IMAGE');
  if (colour('MATEU_SPLASH_BACKGROUND')) splash.backgroundColor = v('MATEU_SPLASH_BACKGROUND');
  return { ...(image('MATEU_APP_ICON') ? { icon: v('MATEU_APP_ICON') } : {}), adaptiveIcon, splash };
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
  const face = faceOf(env);
  const plugins = (config.plugins ?? []).map((p) =>
    Array.isArray(p) && p[0] === 'expo-camera'
      ? ['expo-camera', { ...(p[1] ?? {}), cameraPermission: `${name} uses the camera for the photo fields of its screens.` }]
      : Array.isArray(p) && p[0] === 'expo-splash-screen'
        ? ['expo-splash-screen', { ...(p[1] ?? {}), ...face.splash }]
        : p,
  );
  const adaptiveIcon = { ...((android as { adaptiveIcon?: Record<string, unknown> }).adaptiveIcon ?? {}), ...face.adaptiveIcon };

  return {
    ...config,
    name,
    scheme,
    plugins,
    ...(face.icon ? { icon: face.icon } : {}),
    ios: { ...ios, infoPlist: iosPlist, ...(bundleId ? { bundleIdentifier: bundleId } : {}) },
    android: { ...android, adaptiveIcon, ...(bundleId ? { package: bundleId } : {}) },
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
