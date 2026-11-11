/**
 * Sign-in providers (pure, unit-tested; the contract is docs `deploy/sign-in`).
 *
 * A UI names a LIST of providers in its `auth` block (`auth.providers`); this module says which of
 * them THIS app can use and how to offer them: none → no sign-in, one → straight to it, several → a
 * chooser ("Continue with Google", "Continue with Acme SSO"…).
 *
 * What a native app can use: `oidc` providers whose `platforms` include `mobile`. A `redirect`
 * provider (the host framework's own login: Spring `oauth2Login`, a SAML login page, form login) is
 * NOT offered even when it lists `mobile`: it ends with a session COOKIE in the system browser, which
 * never reaches the app — there is no token to send back as `Authorization: Bearer`.
 *
 * A manifest from a server older than the list carries only the single provider keys
 * (`auth.issuer`/`clientId`/`scopes`/`audience`): that is provider `default`. When `providers` IS
 * present it is the whole truth — the single keys repeat its first mobile provider.
 *
 * Mirrored by the IntelliJ/desktop plugin (`hub/SignInProviders.kt`); both run the corpus
 * `conformance/client/sign-in-flow-native.json`.
 */
import { oidcConfigFrom, parseStoredTokens, tokensBelongTo, type OidcConfig, type StoredTokens } from './oidcConfig.ts';
import type { KeyValueStore } from './sessionId.ts';

export type ClientPlatform = 'web' | 'mobile' | 'desktop';
export type SignInMode = 'none' | 'direct' | 'chooser';

/** The brand tokens a provider may name; anything else draws the neutral `key`. */
export const PROVIDER_ICONS = ['google', 'microsoft', 'apple', 'github', 'facebook', 'x', 'linkedin', 'gitlab', 'okta', 'auth0', 'keycloak', 'key'] as const;

const BRAND_LABELS: Record<string, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  entra: 'Microsoft Entra ID',
  apple: 'Apple',
  github: 'GitHub',
  facebook: 'Facebook',
  x: 'X',
  linkedin: 'LinkedIn',
  gitlab: 'GitLab',
  keycloak: 'Keycloak',
  okta: 'Okta',
  auth0: 'Auth0',
  cognito: 'Amazon Cognito',
  zitadel: 'ZITADEL',
};

const ALL_PLATFORMS: ClientPlatform[] = ['web', 'mobile', 'desktop'];
const MAX_LABEL = 40;

const cleanLabel = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const t = v
    .replace(new RegExp('[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]', 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();
  return t ? t.slice(0, MAX_LABEL) : undefined;
};

const hostOf = (url: string): string => /^[a-z]+:\/\/([^/:?#]+)/i.exec(url)?.[1] ?? url;

const platformsOf = (raw: unknown, type: string): ClientPlatform[] => {
  if (!Array.isArray(raw)) return type === 'redirect' ? ['web'] : ALL_PLATFORMS;
  return raw.filter((p): p is ClientPlatform => typeof p === 'string' && (ALL_PLATFORMS as string[]).includes(p));
};

const iconOf = (raw: unknown): string => (typeof raw === 'string' && (PROVIDER_ICONS as readonly string[]).includes(raw) ? raw : 'key');

/** One entry of `auth.providers`, as this app can use it; null when it is not for this platform. */
function providerFrom(raw: unknown, index: number, platform: ClientPlatform, loginOnStart: boolean): OidcConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const type = typeof r['type'] === 'string' ? r['type'] : 'oidc';
  if (type !== 'oidc') return null; // redirect: a browser cookie, never a token (see above)
  if (!platformsOf(r['platforms'], type).includes(platform)) return null;
  const base = oidcConfigFrom({ ...r, type: 'oidc', loginOnStart });
  if (!base) return null;
  const id = typeof r['id'] === 'string' && r['id'].trim() ? r['id'].trim() : `provider${index + 1}`;
  return {
    ...base,
    id,
    label: cleanLabel(r['label']) ?? BRAND_LABELS[id] ?? hostOf(base.issuer),
    icon: iconOf(r['icon']),
  };
}

/**
 * The providers of an `auth` block this platform can sign in with, in the UI's order (duplicate ids:
 * the first wins). Empty → the UI does not ask for a sign-in here.
 */
export function signInProvidersFrom(raw: unknown, platform: ClientPlatform = 'mobile'): OidcConfig[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const r = raw as Record<string, unknown>;
  const loginOnStart = r['loginOnStart'] !== false;
  if (Array.isArray(r['providers'])) {
    const seen = new Set<string>();
    const out: OidcConfig[] = [];
    (r['providers'] as unknown[]).forEach((p, i) => {
      const c = providerFrom(p, i, platform, loginOnStart);
      if (c && !seen.has(c.id!)) {
        seen.add(c.id!);
        out.push(c);
      }
    });
    return out;
  }
  // a server from before the list: its single provider, which only ever meant the native apps
  if (platform === 'web') return [];
  const legacy = oidcConfigFrom(r);
  return legacy ? [{ ...legacy, id: 'default', label: hostOf(legacy.issuer), icon: 'key' }] : [];
}

export function signInModeOf(providers: readonly unknown[]): SignInMode {
  return providers.length === 0 ? 'none' : providers.length === 1 ? 'direct' : 'chooser';
}

/** The provider whose tokens are stored (one signed-in provider per UI at a time), if any. */
export function signedInProviderOf(tokens: StoredTokens | null, providers: readonly OidcConfig[]): OidcConfig | undefined {
  return tokens ? providers.find((p) => tokensBelongTo(tokens, p)) : undefined;
}

export interface SignInPlan {
  mode: SignInMode;
  /** The provider to use without asking: the one already signed in, or the only one. */
  provider?: OidcConfig;
  /** The order the chooser lists them in: the one used last first, then the UI's order. */
  ordered: OidcConfig[];
  /** The id of the provider used last on this device, when it is still offered. */
  lastUsed?: string;
}

/**
 * What to show: a session already held (its tokens name the provider) skips the question; one
 * provider goes straight to it; several ask, the last one used first.
 */
export function signInPlanOf(providers: readonly OidcConfig[], signedIn: OidcConfig | undefined, rememberedId: string | null | undefined): SignInPlan {
  const mode = signInModeOf(providers);
  const last = rememberedId ? providers.find((p) => p.id === rememberedId) : undefined;
  const ordered = last ? [last, ...providers.filter((p) => p !== last)] : [...providers];
  if (signedIn) return { mode, provider: signedIn, ordered, lastUsed: last?.id };
  if (mode === 'direct') return { mode, provider: providers[0], ordered, lastUsed: last?.id };
  return { mode, ordered, lastUsed: last?.id };
}

/** Where the single-backend app (no hub) keeps its tokens and the provider it signed in with last. */
export const SIGN_IN_PROVIDER_KEY = 'mateu.oidc.provider';

/**
 * The plan from what the device holds: the stored tokens name the provider that signed in (one UI has
 * one signed-in provider at a time; each provider only ever reads tokens stamped with its own issuer
 * and client — `tokensBelongTo`), `rememberKey` the provider chosen last. Never throws.
 */
export async function signInPlanFrom(
  providers: readonly OidcConfig[],
  store: KeyValueStore,
  tokensKey: string,
  rememberKey: string,
): Promise<SignInPlan> {
  const read = async (key: string) => {
    try {
      return await store.get(key);
    } catch {
      return null;
    }
  };
  const held = providers.length ? signedInProviderOf(parseStoredTokens(await read(tokensKey)), providers) : undefined;
  return signInPlanOf(providers, held, providers.length > 1 ? await read(rememberKey) : null);
}

/** Remembers the provider just used, so the chooser lists it first next time. Best effort. */
export async function rememberProvider(store: KeyValueStore, rememberKey: string, provider: Pick<OidcConfig, 'id'>): Promise<void> {
  if (provider.id) await store.set(rememberKey, provider.id).catch(() => {});
}

/** The neutral glyph a provider button draws: never a brand's artwork — its initial, or a key. */
export function providerGlyph(provider: Pick<OidcConfig, 'icon' | 'label' | 'id'>): { kind: 'key' } | { kind: 'initial'; text: string } {
  if (!provider.icon || provider.icon === 'key') return { kind: 'key' };
  const text = (provider.label ?? provider.id ?? '').trim().charAt(0).toUpperCase();
  return text ? { kind: 'initial', text } : { kind: 'key' };
}

export interface SignInTexts {
  title: (uiName: string) => string;
  intro: string;
  /** Where a single provider is named: "You sign in with id.acme.com." */
  single: (provider: string) => string;
  continueWith: (provider: string) => string;
  lastUsed: string;
  signIn: string;
  cancelled: string;
  noPassword: string;
}

export function signInTexts(lang: 'en' | 'es'): SignInTexts {
  return lang === 'es'
    ? {
        title: (n) => `Inicia sesión en ${n}`,
        intro: 'Elige cómo quieres iniciar sesión.',
        single: (p) => `Inicias sesión con ${p}.`,
        continueWith: (p) => `Continuar con ${p}`,
        lastUsed: 'Usado la última vez',
        signIn: 'Iniciar sesión',
        cancelled: 'Se canceló el inicio de sesión.',
        noPassword: 'Mateu nunca ve tu contraseña.',
      }
    : {
        title: (n) => `Sign in to ${n}`,
        intro: 'Choose how to sign in.',
        single: (p) => `You sign in with ${p}.`,
        continueWith: (p) => `Continue with ${p}`,
        lastUsed: 'Last used',
        signIn: 'Sign in',
        cancelled: 'Sign-in was cancelled.',
        noPassword: 'Mateu never sees your password.',
      };
}

/** What a provider is called on screen: its label, else the identity provider's host. */
export const providerName = (p: Pick<OidcConfig, 'label' | 'issuer'>): string => p.label ?? hostOf(p.issuer);

