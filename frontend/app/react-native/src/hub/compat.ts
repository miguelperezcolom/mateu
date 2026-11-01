/**
 * Can THIS app render that UI? (pure; the rule is conformance/client/app-compat.json, which the
 * IntelliJ desktop app runs too — AppCompat.kt).
 *
 * The UI's manifest says which wire and which Mateu release serve it (`wireVersion`,
 * `mateuVersion` — the server sends both by itself) and, optionally, the oldest app it accepts
 * (`minAppVersion`, the author's own floor). The app knows the wire it was built for, the Mateu
 * release its renderer comes from (unknown for a local build) and its own version:
 *
 * - required: another wire major (the app — or, for an older one, the server — must be updated),
 *   or an app older than minAppVersion → the UI is neither added nor opened; the update is offered.
 * - recommended: a newer wire minor, or a newer Mateu release than the app's renderer → it opens,
 *   but it may send components this app predates: the update is suggested.
 * - compatible: anything else, including whatever cannot be compared (a missing or unparseable
 *   version never blocks).
 */
import { compareVersionStrings } from './version.ts';

export type CompatStatus = 'compatible' | 'recommended' | 'required';
export type CompatReason = 'newerWire' | 'olderWire' | 'minAppVersion' | 'newerMinor' | 'newerMateu';

export interface AppSide {
  /** The wire this app was built for ("3.0"). */
  wire: string;
  /** The Mateu release its renderer comes from, null when unknown. */
  mateuVersion: string | null | undefined;
  /** The app's own version (what minAppVersion speaks of). */
  appVersion: string;
}

export interface UiSide {
  wireVersion?: string;
  minAppVersion?: string;
  mateuVersion?: string;
}

export interface Compat {
  status: CompatStatus;
  reason: CompatReason | null;
}

const wireOf = (v: string | undefined): [number, number] | null => {
  const m = /^(\d+)(?:\.(\d+))?/.exec(String(v ?? '').trim());
  return m ? [Number(m[1]), Number(m[2] ?? 0)] : null;
};

const STAGES: Record<string, number> = { alpha: 0, a: 0, beta: 1, b: 1, rc: 2 };
const RELEASE = /^(\d+)\.(\d+)(?:\.(\d+))?(?:[-.]?(alpha|beta|rc|a|b)\.?(\d+))?$/;

/** A Mateu release as comparable numbers ([major, minor, patch, stage, n]; GA ranks above rc), or
 *  null when the text names no release (a dev build, junk). Java (3.0-beta.33), .NET (3.0.0-beta.33)
 *  and Python (3.0.0b33) spellings of one release compare equal. */
export function mateuRelease(v: string | null | undefined): number[] | null {
  const text = String(v ?? '').trim();
  if (!text || text.startsWith('0.')) return null;
  const m = RELEASE.exec(text);
  if (!m) return null;
  const stage = m[4] ? STAGES[m[4]] : 3;
  return [Number(m[1]), Number(m[2]), Number(m[3] ?? 0), stage, m[5] ? Number(m[5]) : 0];
}

/** Negative when a is older than b, null when either names no release. */
export function compareMateuReleases(a: string | null | undefined, b: string | null | undefined): number | null {
  const ra = mateuRelease(a);
  const rb = mateuRelease(b);
  if (!ra || !rb) return null;
  for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
  return 0;
}

export function appCompatibility(ui: UiSide, app: AppSide): Compat {
  const theirs = wireOf(ui.wireVersion);
  const ours = wireOf(app.wire);
  if (theirs && ours && theirs[0] > ours[0]) return { status: 'required', reason: 'newerWire' };
  if (theirs && ours && theirs[0] < ours[0]) return { status: 'required', reason: 'olderWire' };
  if (ui.minAppVersion && compareVersionStrings(app.appVersion, ui.minAppVersion) < 0) {
    return { status: 'required', reason: 'minAppVersion' };
  }
  if (theirs && ours && theirs[1] > ours[1]) return { status: 'recommended', reason: 'newerMinor' };
  const release = compareMateuReleases(ui.mateuVersion, app.mateuVersion);
  if (release !== null && release > 0) return { status: 'recommended', reason: 'newerMateu' };
  return { status: 'compatible', reason: null };
}

/** The sentence for the person, in English or Spanish (the device's language). */
export function compatMessage(
  reason: CompatReason,
  ui: UiSide & { name?: string },
  app: AppSide,
  lang: 'en' | 'es' = 'en',
): string {
  const name = ui.name || (lang === 'es' ? 'Esta UI' : 'This UI');
  const es = lang === 'es';
  switch (reason) {
    case 'newerWire':
      return es
        ? `${name} usa una versión de Mateu (wire ${ui.wireVersion}) más nueva de la que entiende esta app. Actualiza la app de Mateu para abrirla.`
        : `${name} uses a newer Mateu (wire ${ui.wireVersion}) than this version of the Mateu app understands. Update the Mateu app to open it.`;
    case 'olderWire':
      return es
        ? `El servidor de ${name} usa una versión de Mateu (wire ${ui.wireVersion}) demasiado antigua para esta app. Es el servidor el que debe actualizarse.`
        : `${name}'s server runs a Mateu (wire ${ui.wireVersion}) too old for this version of the app. The server needs updating.`;
    case 'minAppVersion':
      return es
        ? `${name} necesita la app de Mateu ${ui.minAppVersion} o posterior; tienes la ${app.appVersion}.`
        : `${name} needs the Mateu app ${ui.minAppVersion} or later; you have ${app.appVersion}.`;
    case 'newerMinor':
    case 'newerMateu':
      return es
        ? `${name} usa una versión de Mateu más nueva${ui.mateuVersion ? ` (${ui.mateuVersion})` : ''} que esta app${app.mateuVersion ? ` (${app.mateuVersion})` : ''}. Se abrirá, pero alguna pantalla puede no verse bien hasta que actualices la app.`
        : `${name} runs a newer Mateu${ui.mateuVersion ? ` (${ui.mateuVersion})` : ''} than this app${app.mateuVersion ? ` (${app.mateuVersion})` : ''}. It opens, but some screens may not display correctly until you update the app.`;
  }
}

/** The device's language as the hub speaks it. */
export function hubLang(locale: string | undefined = currentLocale()): 'en' | 'es' {
  return /^es\b/i.test(locale ?? '') ? 'es' : 'en';
}

function currentLocale(): string | undefined {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return undefined;
  }
}
