import Constants from 'expo-constants';

/**
 * App registry: the INSTALLABLE only carries a registry URL and an app id; a public registry
 * maps the app id to the Mateu base URL, the launch parameters (seeded into appState) and the
 * renderer version the app requires. Retargeting a backend or raising the required version is
 * then a registry edit — no republishing.
 *
 * Registry contract (renderer-agnostic): a GET on the entry URL returns
 *
 *   {
 *     "appId": "demo-admin-panel",
 *     "baseUrl": "https://apps.example.com/admin",
 *     "parameters": { "tenantId": "1111" },
 *     "requiredRendererVersion": "1.2.0",
 *     "storeUrl": { "android": "https://play.google.com/…", "ios": "https://apps.apple.com/…" }
 *   }
 *
 * The entry URL is `{registryUrl}/{appId}.json` (so any static hosting works), or the registry
 * URL itself with the `{appId}` placeholder substituted (for dynamic registries).
 */

export interface RegistryEntry {
  appId?: string;
  baseUrl: string;
  /** Seeded into the appState sent with every request (like @AppContext values). */
  parameters?: Record<string, unknown>;
  /** Minimum renderer (installable) version able to run this app. */
  requiredRendererVersion?: string;
  /** Store fallback when the renderer cannot self-update over the air. */
  storeUrl?: { android?: string; ios?: string };
}

export interface RegistryConfig {
  registryUrl: string;
  appId: string;
}

/** The installable's registry coordinates: `expo.extra` in app.json (production builds) or the
 *  EXPO_PUBLIC_MATEU_REGISTRY_URL / EXPO_PUBLIC_MATEU_APP_ID env vars (dev). Null → no registry,
 *  the renderer boots against its dev config. */
export function readRegistryConfig(): RegistryConfig | null {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const registryUrl =
    (extra['mateuRegistryUrl'] as string) || process.env.EXPO_PUBLIC_MATEU_REGISTRY_URL || '';
  const appId = (extra['mateuAppId'] as string) || process.env.EXPO_PUBLIC_MATEU_APP_ID || '';
  return registryUrl && appId ? { registryUrl, appId } : null;
}

export function registryEntryUrl({ registryUrl, appId }: RegistryConfig): string {
  if (registryUrl.includes('{appId}')) return registryUrl.replace('{appId}', encodeURIComponent(appId));
  return `${registryUrl.replace(/\/+$/, '')}/${encodeURIComponent(appId)}.json`;
}

export async function fetchRegistryEntry(config: RegistryConfig): Promise<RegistryEntry> {
  const url = registryEntryUrl(config);
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Registry answered HTTP ${response.status} for ${url}`);
  const entry = (await response.json()) as RegistryEntry;
  if (!entry || typeof entry.baseUrl !== 'string' || !entry.baseUrl) {
    throw new Error(`Registry entry for '${config.appId}' has no baseUrl`);
  }
  return entry;
}

/** Numeric dotted-version compare: negative when a < b, 0 when equal, positive when a > b.
 *  Non-numeric segments compare as 0, missing segments as 0 ("1.2" == "1.2.0"). */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.');
  const pb = b.split('.');
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = parseInt(pa[i] ?? '0', 10) || 0;
    const nb = parseInt(pb[i] ?? '0', 10) || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

/** The installed renderer version — the installable's `expo.version`. */
export function installedRendererVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

export function updateRequired(entry: RegistryEntry): boolean {
  const required = entry.requiredRendererVersion;
  if (!required) return false;
  return compareVersions(installedRendererVersion(), required) < 0;
}
