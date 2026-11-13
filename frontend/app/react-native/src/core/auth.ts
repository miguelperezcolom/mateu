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
  /** Who is signed in — a stable identity (issuer + subject + tenant, outboxOwner.ts), null when
   *  nobody is or the tokens do not say. What the offline send queue is owned by and checked against. */
  owner?(): Promise<string | null>;
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
  return authHeadersFrom(provider);
}

/** The same, from an explicit provider — a hub UI session carries its own, so tokens never cross UIs. */
export async function authHeadersFrom(p: TokenProvider | null | undefined): Promise<Record<string, string>> {
  if (!p) return {};
  try {
    const token = await p.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

const signedOutListeners = new Set<() => void>();

/** Called after `signOut()` — the host shows its sign-in screen again. Returns an unsubscriber. */
export function onSignedOut(listener: () => void): () => void {
  signedOutListeners.add(listener);
  return () => signedOutListeners.delete(listener);
}

/** True when the registered provider can sign out (the shell then offers a "Sign out" entry). */
export function canSignOut(): boolean {
  return !!provider?.logout;
}

/** Drop the provider's tokens and tell the host. */
export async function signOut(): Promise<void> {
  try {
    await provider?.logout?.();
  } finally {
    for (const l of [...signedOutListeners]) l();
  }
}

/**
 * The provider's half of the 401 contract: silent refresh, then (when allowed) an interactive
 * login. Returns true when a request retried now would carry a fresh token.
 */
export async function reauthenticateWithProvider(interactive = true): Promise<boolean> {
  return reauthenticate(provider, interactive);
}

/** The 401 contract against an explicit provider (a hub UI session's own). */
export async function reauthenticate(p: TokenProvider | null | undefined, interactive = true): Promise<boolean> {
  if (!p) return false;
  try {
    if (await p.refresh()) return true;
  } catch {
    // fall through to the interactive login
  }
  if (!interactive || !p.login) return false;
  let signedIn: boolean;
  try {
    signedIn = await p.login();
  } catch {
    return false;
  }
  if (signedIn) for (const l of [...signedInListeners]) l(p);
  return signedIn;
}

const signedInListeners = new Set<(p: TokenProvider) => void>();

/**
 * Hears every INTERACTIVE sign-in a 401 opened mid-session (never a silent refresh: that is the
 * same person). Whoever signed in may be somebody else than who was signed in when the session
 * opened — a shared phone —, so a host re-reads who owns what (the offline send queue). Returns an
 * unsubscriber.
 */
export function onSignedInAgain(listener: (p: TokenProvider) => void): () => void {
  signedInListeners.add(listener);
  return () => signedInListeners.delete(listener);
}
