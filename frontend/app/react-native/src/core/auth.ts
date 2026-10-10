/**
 * Identity for the Mateu requests (pure: no React, no Expo — unit-tested with node --test).
 *
 * A secured Mateu backend resolves the caller (@EyesOnly, @ReadOnlyUnless, HttpRequest roles…)
 * from a JWT sent as `Authorization: Bearer <token>`, exactly like the web renderers do with the
 * token they keep in localStorage. This module is the ONE place the native renderer asks for that
 * token: a `TokenProvider` registered by the host (the built-in OIDC flow in `oidc.ts`, or the
 * app's own — e.g. a token obtained by an existing native login) supplies it, and on a 401 it gets
 * the chance to refresh / log in again before the request is retried once.
 *
 * Precedence on a 401 (mirrors the web's sessionGuard): an explicit `onSessionExpired` handler
 * wins (the app owns re-auth); otherwise the registered provider re-authenticates (silent refresh
 * first, then an interactive login when `interactive` allows it). No handler and no provider →
 * the request fails exactly as it did before.
 */

export interface TokenProvider {
  /** The current access token, or null when signed out. May refresh proactively when expiring. */
  getToken(): Promise<string | null>;
  /** Try to get a NEW token without user interaction (refresh token). True when it succeeded. */
  refresh(): Promise<boolean>;
  /** Interactive sign-in (opens the identity provider). True when the user signed in. */
  login?(): Promise<boolean>;
  /** Drop the tokens (sign out). */
  logout?(): Promise<void>;
}

let provider: TokenProvider | undefined;

/** Register (or clear, with undefined) the token provider every Mateu request uses. */
export function setTokenProvider(p: TokenProvider | undefined): void {
  provider = p;
}

export function getTokenProvider(): TokenProvider | undefined {
  return provider;
}

/** `{ Authorization: 'Bearer …' }` when a provider has a token, else `{}`. Never throws: a broken
 *  provider must not take the whole request down (the backend then answers 401 and re-auth runs). */
export async function authHeaders(): Promise<Record<string, string>> {
  if (!provider) return {};
  try {
    const token = await provider.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * The provider's half of the 401 contract: silent refresh, then (when allowed) an interactive
 * login. Returns true when a request retried now would carry a fresh token.
 */
export async function reauthenticateWithProvider(interactive = true): Promise<boolean> {
  if (!provider) return false;
  try {
    if (await provider.refresh()) return true;
  } catch {
    // fall through to the interactive login
  }
  if (!interactive || !provider.login) return false;
  try {
    return await provider.login();
  } catch {
    return false;
  }
}
