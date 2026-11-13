// Who an offline send queue belongs to (pure; tested by outboxOwner.test.ts).
//
// A queued request is sent later with the credentials of whoever is signed in THEN — so a queue
// must never be sent, shown or counted for anyone but the person who filled it. Each queue belongs
// to an OWNER: the signed-in identity (issuer + subject + tenant when the token names one), or the
// anonymous owner on a UI with no sign-in. A renewed or refreshed token of the same person (same
// `iss` + `sub`) is the same owner; another person — or nobody signed in — is not, and that queue
// stays suspended, untouched, until its owner signs in again.
//
// The claims are read from the tokens the app's own sign-in obtained (the id token, else a JWT
// access token) WITHOUT verifying them: they only partition what this device keeps, they authorise
// nothing — the server checks every request it is sent.
import { parseStoredTokens, type StoredTokens } from './oidcConfig.ts';
import type { KeyValueStore } from './sessionId.ts';

/** The owner of the queue of a UI with no sign-in. */
export const ANONYMOUS_OWNER = 'anonymous';

/** The claims of a JWT (its payload), or null when the token is not one. Not verified. */
export function jwtClaims(token: string | undefined | null): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const parsed = JSON.parse(utf8(base64UrlBytes(parts[1]))) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const issuerOf = (url: string): string => url.trim().replace(/\/+$/, '');

/** The tenant a token names, when it names one (Entra `tid`, or a `tenant` / `tenant_id` claim). */
function tenantOf(claims: Record<string, unknown>): string {
  for (const name of ['tid', 'tenant_id', 'tenant']) {
    const v = claims[name];
    if (typeof v === 'string' && v) return v;
  }
  return '';
}

/** The canonical owner of an identity — unambiguous whatever characters the parts hold. */
export function ownerOf(issuer: string, subject: string, tenant = ''): string {
  return JSON.stringify(['oidc', issuerOf(issuer), subject, tenant]);
}

/**
 * The owner the stored tokens sign in as: `iss` + `sub` (+ tenant) of the id token, else of a JWT
 * access token; `fallbackIssuer` (the provider's configured issuer) when the token carries no `iss`.
 * Null when there are no tokens or none of them says who it is — then nothing is queued for that
 * session (a queue nobody can be matched against could be sent as somebody else).
 */
export function ownerOfTokens(tokens: StoredTokens | null | undefined, fallbackIssuer?: string): string | null {
  if (!tokens) return null;
  for (const token of [tokens.idToken, tokens.accessToken]) {
    const claims = jwtClaims(token);
    const sub = claims?.['sub'];
    if (!claims || typeof sub !== 'string' || !sub) continue;
    const iss = typeof claims['iss'] === 'string' && claims['iss'] ? (claims['iss'] as string) : (tokens.issuer ?? fallbackIssuer ?? '');
    if (!iss) continue;
    return ownerOf(iss, sub, tenantOf(claims));
  }
  // opaque tokens: the owner resolved from userinfo when they were obtained (withResolvedOwner)
  return typeof tokens.owner === 'string' && tokens.owner ? tokens.owner : null;
}

/** The owner a userinfo answer names: its `sub` (+ tenant) at `issuer`; null when it names nobody. */
export function ownerFromUserinfo(body: unknown, issuer: string): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !issuer) return null;
  const claims = body as Record<string, unknown>;
  const sub = claims['sub'];
  return typeof sub === 'string' && sub ? ownerOf(issuer, sub, tenantOf(claims)) : null;
}

/** Fetches userinfo (fetch's shape, injectable for tests). */
export type UserinfoFetch = (url: string, init: { headers: Record<string, string> }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

/**
 * Tokens just obtained (sign-in or refresh), with the owner they sign in as recorded when NO token
 * says it (opaque tokens): asked ONLINE of the provider's `userinfo_endpoint` with the access token —
 * its `sub` (+ tenant) at the configured issuer. Token claims win, so then nothing is asked and no
 * stored owner is kept. When userinfo is not offered, fails or names nobody: a refresh keeps the
 * owner of the same grant it refreshed (`previous`); a sign-in records none (→ no offline queue).
 * Never guesses, never logs the token. A refresh that resolves ANOTHER sub records that other owner.
 */
export async function withResolvedOwner(
  tokens: StoredTokens,
  issuer: string,
  userinfoEndpoint: string | undefined,
  previous: StoredTokens | null,
  fetchFn: UserinfoFetch = globalThis.fetch as unknown as UserinfoFetch,
): Promise<StoredTokens> {
  const { owner: _ignored, ...bare } = tokens;
  if (ownerOfTokens(bare, issuer)) return bare;
  const resolved = await userinfoOwner(bare.accessToken, issuer, userinfoEndpoint, fetchFn);
  const owner = resolved ?? (previous ? ownerOfTokens(previous, issuer) : null);
  return owner ? { ...bare, owner } : bare;
}

async function userinfoOwner(accessToken: string, issuer: string, endpoint: string | undefined, fetchFn: UserinfoFetch): Promise<string | null> {
  // https only (a loopback dev provider excepted): the access token goes in the request
  const secure = /^https:\/\//i.test(endpoint ?? '') || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])[:/]/i.test(endpoint ?? '');
  if (!endpoint || !accessToken || !secure) return null;
  try {
    const res = await fetchFn(endpoint, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
    if (!res.ok) return null;
    return ownerFromUserinfo(await res.json(), issuer);
  } catch {
    return null;
  }
}

/**
 * Who owns a hub UI's queue right now, from what the device keeps (the hub list's badge, with no
 * session open): the identity of the UI's stored tokens; nobody (null) when it signs in and nobody is
 * signed in; the anonymous owner when it does not sign in at all.
 */
export async function storedOwnerOf(store: KeyValueStore, tokensKey: string, signsIn: boolean): Promise<string | null> {
  let tokens: StoredTokens | null = null;
  try {
    tokens = parseStoredTokens(await store.get(tokensKey));
  } catch {
    tokens = null;
  }
  if (tokens) return ownerOfTokens(tokens);
  return signsIn ? null : ANONYMOUS_OWNER;
}

/** A short, store-key-safe digest (two FNV-1a 32-bit lanes → 16 hex chars). Not cryptographic: it
 *  names keys and checks integrity; the owner itself is stored and compared in full. */
export function digest(text: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c ^ (i & 0xff), 0x5bd1e995);
    b ^= b >>> 15;
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlBytes(text: string): number[] {
  const clean = text.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of clean) {
    const v = B64.indexOf(ch);
    if (v < 0) throw new Error('not base64');
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return out;
}

function utf8(bytes: number[]): string {
  return decodeURIComponent(bytes.map((b) => '%' + b.toString(16).padStart(2, '0')).join(''));
}
