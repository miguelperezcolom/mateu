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
import { chromeLanguageOf, type ChromeLanguage } from '../core/chromeLanguage.ts';
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
  if (ui.minAppVersion && app.appVersion !== '0.0.0' && compareVersionStrings(app.appVersion, ui.minAppVersion) < 0) {
    return { status: 'required', reason: 'minAppVersion' };
  }
  if (theirs && ours && theirs[1] > ours[1]) return { status: 'recommended', reason: 'newerMinor' };
  const release = compareMateuReleases(ui.mateuVersion, app.mateuVersion);
  if (release !== null && release > 0) return { status: 'recommended', reason: 'newerMateu' };
  return { status: 'compatible', reason: null };
}

interface CompatSentences {
  thisUi: string;
  newerWire: (name: string, wire: string) => string;
  olderWire: (name: string, wire: string) => string;
  minAppVersion: (name: string, min: string, have: string) => string;
  /** `uiVersion` / `appVersion` already carry their " (x)" or are ''. */
  newerMateu: (name: string, uiVersion: string, appVersion: string) => string;
}

const COMPAT: Record<ChromeLanguage, CompatSentences> = {
  en: {
    thisUi: 'This UI',
    newerWire: (n, w) => `${n} uses a newer Mateu (wire ${w}) than this version of the Mateu app understands. Update the Mateu app to open it.`,
    olderWire: (n, w) => `${n}'s server runs a Mateu (wire ${w}) too old for this version of the app. The server needs updating.`,
    minAppVersion: (n, min, have) => `${n} needs the Mateu app ${min} or later; you have ${have}.`,
    newerMateu: (n, u, a) => `${n} runs a newer Mateu${u} than this app${a}. It opens, but some screens may not display correctly until you update the app.`,
  },
  es: {
    thisUi: 'Esta UI',
    newerWire: (n, w) => `${n} usa una versión de Mateu (wire ${w}) más nueva de la que entiende esta app. Actualiza la app de Mateu para abrirla.`,
    olderWire: (n, w) => `El servidor de ${n} usa una versión de Mateu (wire ${w}) demasiado antigua para esta app. Es el servidor el que debe actualizarse.`,
    minAppVersion: (n, min, have) => `${n} necesita la app de Mateu ${min} o posterior; tienes la ${have}.`,
    newerMateu: (n, u, a) => `${n} usa una versión de Mateu más nueva${u} que esta app${a}. Se abrirá, pero alguna pantalla puede no verse bien hasta que actualices la app.`,
  },
  fr: {
    thisUi: 'Cette UI',
    newerWire: (n, w) => `${n} utilise une version de Mateu (wire ${w}) plus récente que celle que comprend cette app. Mettez à jour l'app Mateu pour l'ouvrir.`,
    olderWire: (n, w) => `Le serveur de ${n} utilise une version de Mateu (wire ${w}) trop ancienne pour cette app. C'est le serveur qui doit être mis à jour.`,
    minAppVersion: (n, min, have) => `${n} nécessite l'app Mateu ${min} ou ultérieure ; vous avez la ${have}.`,
    newerMateu: (n, u, a) => `${n} utilise une version de Mateu plus récente${u} que cette app${a}. Elle s'ouvrira, mais certains écrans peuvent mal s'afficher tant que vous n'aurez pas mis à jour l'app.`,
  },
  de: {
    thisUi: 'Diese UI',
    newerWire: (n, w) => `${n} verwendet eine neuere Mateu-Version (wire ${w}), als diese App versteht. Aktualisieren Sie die Mateu-App, um sie zu öffnen.`,
    olderWire: (n, w) => `Der Server von ${n} verwendet eine für diese App zu alte Mateu-Version (wire ${w}). Der Server muss aktualisiert werden.`,
    minAppVersion: (n, min, have) => `${n} benötigt die Mateu-App ${min} oder neuer; Sie haben ${have}.`,
    newerMateu: (n, u, a) => `${n} verwendet eine neuere Mateu-Version${u} als diese App${a}. Sie öffnet sich, aber einige Bildschirme werden möglicherweise erst nach einem Update der App richtig angezeigt.`,
  },
  pt: {
    thisUi: 'Esta UI',
    newerWire: (n, w) => `${n} usa uma versão do Mateu (wire ${w}) mais recente do que esta app entende. Atualize a app Mateu para abri-la.`,
    olderWire: (n, w) => `O servidor de ${n} usa uma versão do Mateu (wire ${w}) antiga demais para esta app. É o servidor que precisa ser atualizado.`,
    minAppVersion: (n, min, have) => `${n} precisa da app Mateu ${min} ou posterior; você tem a ${have}.`,
    newerMateu: (n, u, a) => `${n} usa uma versão do Mateu mais recente${u} que esta app${a}. Ela vai abrir, mas algumas telas podem não aparecer bem até você atualizar a app.`,
  },
  it: {
    thisUi: 'Questa UI',
    newerWire: (n, w) => `${n} usa una versione di Mateu (wire ${w}) più recente di quella che questa app comprende. Aggiorna l'app Mateu per aprirla.`,
    olderWire: (n, w) => `Il server di ${n} usa una versione di Mateu (wire ${w}) troppo vecchia per questa app. È il server che va aggiornato.`,
    minAppVersion: (n, min, have) => `${n} richiede l'app Mateu ${min} o successiva; hai la ${have}.`,
    newerMateu: (n, u, a) => `${n} usa una versione di Mateu più recente${u} di questa app${a}. Si aprirà, ma alcune schermate potrebbero non essere visualizzate correttamente finché non aggiorni l'app.`,
  },
};

/** The sentence for the person, in the device's language (chromeLanguage.ts). */
export function compatMessage(
  reason: CompatReason,
  ui: UiSide & { name?: string },
  app: AppSide,
  lang: ChromeLanguage = 'en',
): string {
  const t = COMPAT[lang] ?? COMPAT.en;
  const name = ui.name || t.thisUi;
  switch (reason) {
    case 'newerWire':
      return t.newerWire(name, String(ui.wireVersion));
    case 'olderWire':
      return t.olderWire(name, String(ui.wireVersion));
    case 'minAppVersion':
      return t.minAppVersion(name, String(ui.minAppVersion), String(app.appVersion));
    case 'newerMinor':
    case 'newerMateu':
      return t.newerMateu(name, ui.mateuVersion ? ` (${ui.mateuVersion})` : '', app.mateuVersion ? ` (${app.mateuVersion})` : '');
  }
}

/** The hub's own words around those notices. */
export const HUB_TEXTS: Record<ChromeLanguage, { updateTheApp: string; checkAgain: string; notNow: string }> = {
  en: { updateTheApp: 'Update the app', checkAgain: 'Check again', notNow: 'Not now' },
  es: { updateTheApp: 'Actualiza la app', checkAgain: 'Comprobar de nuevo', notNow: 'Ahora no' },
  fr: { updateTheApp: "Mettez à jour l'app", checkAgain: 'Vérifier à nouveau', notNow: 'Pas maintenant' },
  de: { updateTheApp: 'App aktualisieren', checkAgain: 'Erneut prüfen', notNow: 'Nicht jetzt' },
  pt: { updateTheApp: 'Atualize a app', checkAgain: 'Verificar de novo', notNow: 'Agora não' },
  it: { updateTheApp: "Aggiorna l'app", checkAgain: 'Controlla di nuovo', notNow: 'Non ora' },
};

/** The device's language as the hub speaks it. */
export function hubLang(locale: string | undefined = currentLocale()): ChromeLanguage {
  return chromeLanguageOf(locale);
}

function currentLocale(): string | undefined {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return undefined;
  }
}
