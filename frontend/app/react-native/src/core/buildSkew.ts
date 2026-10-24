/**
 * Version skew between this app and the backends it talks to (pure, unit-tested) — the contract
 * every Mateu renderer shares:
 *
 * - every Mateu request (sync / sse) says who is calling: `X-Mateu-Renderer: react-native/<v> wire/<w>`
 *   (third-party REST sources never get it);
 * - every Mateu response carries `X-Mateu-Build`, an opaque fingerprint of the deployed UI. The
 *   first one seen per backend (origin + base url, up to the `/mateu/` segment) is that backend's
 *   BASELINE for this app session (memory only). A later success with another build = the app was
 *   redeployed → one sticky "updated" notice with Reload; a Mateu 403 refusal with another build =
 *   the screen is STALE, not forbidden → a "changed" error with Reload instead of the generic text.
 * - no header (a static bundle, an older server) → nothing.
 */

import { MIN_WIRE_VERSION } from './wireVersion.ts';

export const RENDERER_HEADER = 'X-Mateu-Renderer';
export const BUILD_HEADER = 'X-Mateu-Build';

let rendererVersion = 'unknown';

/** The app's own version (app.json `version`, via expo-constants); blank → `unknown`. */
export function setRendererVersion(version: string | null | undefined): void {
  rendererVersion = version && version.trim() ? version.trim() : 'unknown';
}

/** `react-native/<version> wire/<major>.<minor>` — the wire this build was made for. */
export function rendererHeaderValue(version: string = rendererVersion, wire: string = MIN_WIRE_VERSION): string {
  return `react-native/${version} wire/${wire}`;
}

/** The backend a request url belongs to: the url up to (excluding) its `/mateu/` segment. */
export function backendKeyOf(url: string): string {
  const at = url.indexOf('/mateu/');
  return at < 0 ? url : url.slice(0, at);
}

export type SkewNotice = 'none' | 'updated' | 'stale';

/** One response as the skew decision sees it. */
export interface ObservedResponse {
  /** The response's `X-Mateu-Build`, null/undefined when absent. */
  build: string | null | undefined;
  /** 2xx. */
  ok: boolean;
  /** A 403 that is MATEU's own refusal (not a proxy's / the host's). */
  mateuForbidden?: boolean;
}

/** Per-backend baselines + which backends were already told — one per app session. */
export class BuildSkew {
  private readonly baselines = new Map<string, string>();
  private readonly told = new Set<string>();

  /** What to show for `response` from backend `key`; records the baseline on first sight. */
  observe(key: string, response: ObservedResponse): SkewNotice {
    const build = response.build?.trim();
    if (!build) return 'none';
    const baseline = this.baselines.get(key);
    if (baseline === undefined) {
      this.baselines.set(key, build);
      return 'none';
    }
    if (build === baseline) return 'none';
    if (response.mateuForbidden) {
      // shown INSTEAD of the generic refusal, every time; the "updated" notice is then redundant
      this.told.add(key);
      return 'stale';
    }
    if (!response.ok || this.told.has(key)) return 'none';
    this.told.add(key);
    return 'updated';
  }

  clear(): void {
    this.baselines.clear();
    this.told.clear();
  }
}

/** The app session's tracker (every client of this process shares it: keys are absolute urls). */
export const buildSkew = new BuildSkew();

/**
 * Whether a 403's body is Mateu's own refusal: Java answers the text `Forbidden`; .NET/Python an
 * increment carrying `messages`.
 */
export function isMateuForbidden(status: number, body: string): boolean {
  if (status !== 403) return false;
  const text = body.trim();
  if (text === 'Forbidden') return true;
  if (!text.startsWith('{')) return false;
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    return Array.isArray(json['messages']) && json['messages'].length > 0;
  } catch {
    return false;
  }
}

export interface SkewTexts {
  updated: string;
  stale: string;
  reload: string;
}

const EN: SkewTexts = {
  updated: 'This app has been updated. Reload to use the latest version.',
  stale: 'This screen has changed since you opened it. Reload to continue.',
  reload: 'Reload',
};

const ES: SkewTexts = {
  updated: 'Esta aplicación se ha actualizado. Recarga para usar la última versión.',
  stale: 'Esta pantalla ha cambiado desde que la abriste. Recarga para continuar.',
  reload: 'Recargar',
};

/** The notice texts in `locale` (Spanish for `es*`, English otherwise). */
export function skewTexts(locale: string | null | undefined): SkewTexts {
  return (locale ?? '').toLowerCase().startsWith('es') ? ES : EN;
}

/** Thrown for a stale-screen 403: the notice was already shown, callers must not add another. */
export class StaleScreenError extends Error {
  readonly staleScreen = true;
}

export const isStaleScreenError = (e: unknown): boolean =>
  !!e && typeof e === 'object' && (e as { staleScreen?: unknown }).staleScreen === true;
