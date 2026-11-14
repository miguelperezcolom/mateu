/**
 * The signed-in user in the drawer header (AppDto.user), the pure part — a mirror of libs/mateu
 * `infra/ui/userMenu.ts` (keep the rules identical): what the avatar shows, whether the menu is
 * there at all, and its texts in the six chrome languages. Pure: unit-tested with node --test.
 */
import { chromeLanguageOf, type ChromeLanguage } from './chromeLanguage.ts';

/** AppDto.user: display only — absent for an anonymous caller. */
export interface SignedInUser {
  name: string;
  email?: string | null;
  picture?: string | null;
}

const LETTER_OR_DIGIT = /\p{L}|\p{N}/u;

/**
 * Up to two initials: the first letter of the first and of the last word ("Ana María López" → "AL",
 * "miguelperezcolom" → "M"). Letters of any script; an e-mail-like name uses its local part.
 */
export const initialsOf = (name: string): string => {
  const base = name.includes('@') && !name.includes(' ') ? name.split('@')[0] : name;
  const words = base.split(/[\s._-]+/u).filter((w) => LETTER_OR_DIGIT.test(w));
  if (words.length === 0) return '?';
  const first = Array.from(words[0]).find((c) => LETTER_OR_DIGIT.test(c)) ?? '';
  if (words.length === 1) return first.toLocaleUpperCase();
  const last = Array.from(words[words.length - 1]).find((c) => LETTER_OR_DIGIT.test(c)) ?? '';
  return (first + last).toLocaleUpperCase();
};

/** Only an http(s) picture is drawn; anything else falls back to the initials. */
export const pictureOf = (user: SignedInUser): string | undefined => {
  const url = user.picture?.trim();
  return url && /^https?:\/\//i.test(url) ? url : undefined;
};

/**
 * Which account control the shell draws: the user menu when the server named the signed-in user
 * (Sign out inside it when the app holds a sign-in), the bare Sign out when it did not but there is
 * a session to end, nothing otherwise.
 */
export const headerAccountControl = (
  user: SignedInUser | null | undefined,
  signOutAvailable: boolean,
): 'menu' | 'signOut' | 'none' => (user?.name ? 'menu' : signOutAvailable ? 'signOut' : 'none');

/** The wire's `user`, when it is one (a name is required; anything else = anonymous). */
export const signedInUserOf = (raw: unknown): SignedInUser | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== 'string' || !r.name.trim()) return undefined;
  return {
    name: r.name,
    email: typeof r.email === 'string' && r.email.trim() ? r.email : undefined,
    picture: typeof r.picture === 'string' ? r.picture : undefined,
  };
};

export interface UserMenuTexts {
  /** The avatar button's / menu's accessible name: "Account: {name}". */
  userMenuOf: string;
  signOut: string;
}

const TEXTS: Record<ChromeLanguage, UserMenuTexts> = {
  en: { userMenuOf: 'Account: {name}', signOut: 'Sign out' },
  es: { userMenuOf: 'Cuenta: {name}', signOut: 'Cerrar sesión' },
  fr: { userMenuOf: 'Compte : {name}', signOut: 'Se déconnecter' },
  de: { userMenuOf: 'Konto: {name}', signOut: 'Abmelden' },
  pt: { userMenuOf: 'Conta: {name}', signOut: 'Terminar sessão' },
  it: { userMenuOf: 'Account: {name}', signOut: 'Esci' },
};

/** The user menu's texts in the UI's chrome language. */
export function userMenuTexts(locale: string | null | undefined): UserMenuTexts {
  return TEXTS[chromeLanguageOf(locale)];
}

/** "Account: Ana López" in the UI's chrome language. */
export function userMenuLabel(user: SignedInUser, locale: string | null | undefined): string {
  return userMenuTexts(locale).userMenuOf.replace('{name}', user.name);
}

/** Every language has the same keys (pinned by the completeness test). */
export const USER_MENU_LANGUAGES = Object.keys(TEXTS) as ChromeLanguage[];
