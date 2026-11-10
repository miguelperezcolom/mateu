/**
 * OIDC configuration + token bookkeeping (pure, unit-tested). The interactive half lives in
 * `oidc.ts` (expo-auth-session); everything that can be decided without a browser is here.
 *
 * Where the configuration comes from, first wins:
 *  1. the app-registry entry's `auth` block — so a production installable needs no rebuild to
 *     point at another identity provider:
 *       "auth": { "type": "oidc", "issuer": "https://login.example.com/realms/acme",
 *                 "clientId": "mateu-mobile", "scopes": ["openid", "profile", "offline_access"] }
 *  2. the EXPO_PUBLIC_MATEU_OIDC_ISSUER / _CLIENT_ID / _SCOPES / _AUDIENCE env vars (dev builds).
 * Neither → no OIDC: requests go out without Authorization, as before.
 */

export interface OidcConfig {
  type: 'oidc';
  issuer: string;
  clientId: string;
  scopes: string[];
  /** Extra `audience` parameter some providers (Auth0) need to mint a JWT access token. */
  audience?: string;
  /** Sign in before the first screen (default true); false = sign in only when a 401 asks. */
  loginOnStart?: boolean;
}

export const DEFAULT_SCOPES = ['openid', 'profile', 'email', 'offline_access'];

/** Normalises the registry `auth` block; null when absent or not usable. */
export function oidcConfigFrom(raw: unknown): OidcConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if ((r['type'] ?? 'oidc') !== 'oidc') return null;
  const issuer = typeof r['issuer'] === 'string' ? r['issuer'].replace(/\/+$/, '') : '';
  const clientId = typeof r['clientId'] === 'string' ? r['clientId'] : '';
  if (!issuer || !clientId) return null;
  const scopes = Array.isArray(r['scopes'])
    ? (r['scopes'] as unknown[]).filter((s): s is string => typeof s === 'string')
    : typeof r['scopes'] === 'string'
      ? (r['scopes'] as string).split(/[\s,]+/).filter(Boolean)
      : DEFAULT_SCOPES;
  return {
    type: 'oidc',
    issuer,
    clientId,
    scopes: scopes.length ? scopes : DEFAULT_SCOPES,
    audience: typeof r['audience'] === 'string' && r['audience'] ? r['audience'] : undefined,
    loginOnStart: r['loginOnStart'] !== false,
  };
}

/** The env-var flavour (dev). */
export function oidcConfigFromEnv(env: Record<string, string | undefined>): OidcConfig | null {
  return oidcConfigFrom({
    type: 'oidc',
    issuer: env['EXPO_PUBLIC_MATEU_OIDC_ISSUER'],
    clientId: env['EXPO_PUBLIC_MATEU_OIDC_CLIENT_ID'],
    scopes: env['EXPO_PUBLIC_MATEU_OIDC_SCOPES'] || undefined,
    audience: env['EXPO_PUBLIC_MATEU_OIDC_AUDIENCE'],
    loginOnStart: env['EXPO_PUBLIC_MATEU_OIDC_LOGIN_ON_START'] !== 'false',
  });
}

/** What is persisted between launches. `expiresAt` is epoch millis (null = unknown, treat as valid). */
export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number | null;
  /** Who minted them: a token is only ever sent back to that issuer and client (see `oidc.ts`). */
  issuer?: string;
  clientId?: string;
}

/** Whether `tokens` were minted by this configuration's identity provider and client. */
export function tokensBelongTo(tokens: StoredTokens, config: Pick<OidcConfig, 'issuer' | 'clientId'>): boolean {
  const issuerOf = (url: string | undefined) => (url ?? '').trim().replace(/\/+$/, '');
  return !!tokens.issuer && issuerOf(tokens.issuer) === issuerOf(config.issuer) && tokens.clientId === config.clientId;
}

/** From a token-endpoint answer (`expires_in` in seconds; expo-auth-session's `expiresIn`). */
/**
 * Where to send the browser so the identity provider ends its own session too (OpenID Connect
 * RP-initiated logout). Without it the system browser keeps the provider's cookie, and "sign in" on a
 * shared phone comes back as the previous person, with no password asked. Undefined when the provider
 * offers no such endpoint or there is no id token to name the session.
 */
export function endSessionUrl(endpoint: string | undefined, clientId: string, idToken: string | undefined, redirectUri: string): string | undefined {
  if (!endpoint || !idToken) return undefined;
  const separator = endpoint.includes('?') ? '&' : '?';
  const query = [['id_token_hint', idToken], ['client_id', clientId], ['post_logout_redirect_uri', redirectUri]]
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');
  return `${endpoint}${separator}${query}`;
}

export function tokensFromResponse(
  r: { accessToken: string; refreshToken?: string; idToken?: string; expiresIn?: number; issuedAt?: number },
  previous?: StoredTokens | null,
  now: number = Date.now(),
): StoredTokens {
  const issued = r.issuedAt ? r.issuedAt * 1000 : now;
  return {
    accessToken: r.accessToken,
    // a refresh answer often omits the refresh token: keep the one we had
    refreshToken: r.refreshToken ?? previous?.refreshToken,
    idToken: r.idToken ?? previous?.idToken,
    expiresAt: typeof r.expiresIn === 'number' ? issued + r.expiresIn * 1000 : null,
  };
}

/** Expired, or expiring within `skewMs` (default 30 s) — refresh before using it. */
export function isExpiring(tokens: StoredTokens | null, now: number = Date.now(), skewMs = 30_000): boolean {
  if (!tokens) return true;
  if (tokens.expiresAt == null) return false;
  return tokens.expiresAt - skewMs <= now;
}

export function parseStoredTokens(raw: string | null): StoredTokens | null {
  if (!raw) return null;
  try {
    const t = JSON.parse(raw) as StoredTokens;
    return t && typeof t.accessToken === 'string' && t.accessToken ? t : null;
  } catch {
    return null;
  }
}
