/**
 * The hub's link grammar (pure: no React, no Expo — unit-tested with node --test).
 *
 * A QR code, a deep link or a typed address all end up here, and everything that comes from a QR is
 * untrusted: a code can be printed by anyone. So this parser is deliberately strict and does its own
 * parsing with regular expressions instead of `URL`/`URLSearchParams` — React Native's URL polyfill
 * does not implement most getters (`hostname`, `searchParams`…) and differs between Hermes and the
 * web, and a security decision must not depend on which polyfill happens to be loaded.
 *
 * Accepted forms (design/mobile-app-hub.md §1, §7):
 *
 *   https://mateu.io/add?u=<urlencoded baseUrl>[&r=<route>]   add one UI (universal / app link)
 *   mateu://add?u=<urlencoded baseUrl>[&r=<route>]             the same, custom scheme
 *   https://mateu.io/add?u=<a>&u=<b>…                          import several (the export QR)
 *   mateu://import?d=<base64url JSON {"v":1,"u":[…]}>         import several, compact form
 *
 * What a link may NEVER carry: credentials. A base URL with userinfo (`https://bank.com@evil.com`)
 * is refused — it is the classic way to make a domain read as another one.
 */

/** Hosts whose `/add` path is ours (the universal-link domain). */
export const LINK_HOSTS = ['mateu.io', 'www.mateu.io'];

export const MAX_URL_LENGTH = 2048;
export const MAX_ROUTE_LENGTH = 512;
export const MAX_IMPORT = 50;

export interface ParseOptions {
  /** Accept `http://` base URLs (development builds only). */
  allowInsecure?: boolean;
  /** Extra hosts (`host[:port]`) whose `/add` path is accepted — the web build's own origin. */
  extraLinkHosts?: string[];
}

export type HubLink =
  | { kind: 'add'; baseUrl: string; route?: string }
  | { kind: 'import'; baseUrls: string[]; rejected: number }
  | { kind: 'invalid'; reason: string };

export type BaseUrlResult = { ok: true; baseUrl: string; host: string; secure: boolean } | { ok: false; reason: string };

// scheme://authority path ?query #fragment — RFC 3986 appendix B, minus the optional parts we refuse
const URL_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/;
// eslint-disable-next-line no-control-regex
const CONTROL_OR_SPACE = new RegExp('[\\u0000-\\u0020\\u007f-\\u009f\\u2028\\u2029\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]');
const HOST_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
const IPV6_RE = /^\[[0-9a-f:.]+\]$/;

/**
 * Normalises what the user typed (or a link carried) into a Mateu base URL: scheme + host[:port] +
 * path, no trailing slash, no query, no fragment. A missing scheme means https. Refuses anything
 * that is not http(s), carries credentials, has a non-ASCII host (homograph attacks — the user has to
 * see the punycode they are trusting), or hides characters a reader would not see.
 */
export function normalizeBaseUrl(input: string, options: ParseOptions = {}): BaseUrlResult {
  if (typeof input !== 'string') return { ok: false, reason: 'Not an address.' };
  let raw = input.trim();
  if (!raw) return { ok: false, reason: 'Enter an address.' };
  if (raw.length > MAX_URL_LENGTH) return { ok: false, reason: 'The address is too long.' };
  if (CONTROL_OR_SPACE.test(raw)) return { ok: false, reason: 'The address contains spaces or hidden characters.' };
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
    // "acme.com/crm" → https; but "javascript:alert(1)" / "data:…" have a scheme without "//": refuse
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\d)/.test(raw)) return { ok: false, reason: 'Only https addresses can be added.' };
    raw = `https://${raw}`;
  }
  const m = URL_RE.exec(raw);
  if (!m) return { ok: false, reason: 'That does not look like a web address.' };
  const scheme = m[1].toLowerCase();
  const authority = m[2];
  const path = m[3] ?? '';
  if (scheme !== 'https' && scheme !== 'http') return { ok: false, reason: 'Only https addresses can be added.' };
  if (scheme === 'http' && !options.allowInsecure) {
    return { ok: false, reason: 'Only secure (https) addresses can be added.' };
  }
  if (authority.includes('@')) return { ok: false, reason: 'Addresses with a user name or password are not accepted.' };
  const hp = /^(\[[^\]]*\]|[^:]*)(?::(\d{1,5}))?$/.exec(authority);
  if (!hp) return { ok: false, reason: 'The address has an invalid host.' };
  const host = hp[1].toLowerCase().replace(/\.$/, '');
  const port = hp[2];
  if (!host) return { ok: false, reason: 'The address has no host.' };
  // eslint-disable-next-line no-control-regex
  if (/[^\x00-\x7f]/.test(host)) {
    return { ok: false, reason: 'International domain names must be entered in their xn-- form.' };
  }
  if (!HOST_RE.test(host) && !IPV6_RE.test(host)) return { ok: false, reason: 'The address has an invalid host.' };
  if (port !== undefined) {
    const n = Number(port);
    if (!(n >= 1 && n <= 65535)) return { ok: false, reason: 'The address has an invalid port.' };
  }
  if (path.includes('\\')) return { ok: false, reason: 'The address has an invalid path.' };
  const segments = path.split('/');
  if (segments.some((s) => s === '..' || s === '.')) return { ok: false, reason: 'The address has an invalid path.' };
  const defaultPort = (scheme === 'https' && port === '443') || (scheme === 'http' && port === '80');
  const hostPort = port && !defaultPort ? `${host}:${port}` : host;
  const cleanPath = path.replace(/\/+$/, '');
  return { ok: true, baseUrl: `${scheme}://${hostPort}${cleanPath}`, host: hostPort, secure: scheme === 'https' };
}

/** The host[:port] of an already-normalised base URL — what the confirm screen shows big. */
export function domainOf(baseUrl: string): string {
  const m = URL_RE.exec(baseUrl);
  return m ? m[2].toLowerCase() : baseUrl;
}

/** A route to open inside the UI: relative to its mount, never an absolute or protocol-relative URL. */
export function sanitizeRoute(route: string | undefined | null): string | undefined {
  if (route == null) return undefined;
  const r = route.trim();
  if (!r || r.length > MAX_ROUTE_LENGTH) return undefined;
  if (CONTROL_OR_SPACE.test(r)) return undefined;
  if (r.startsWith('//') || r.includes('\\') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(r)) return undefined;
  if (r.split(/[/?#]/).some((s) => s === '..')) return undefined;
  return r.startsWith('/') ? r : `/${r}`;
}

/** Repeated query keys preserved in order; malformed escapes make the value null (refused later). */
export function parseQuery(query: string): [string, string | null][] {
  const q = query.startsWith('?') ? query.slice(1) : query;
  if (!q) return [];
  return q.split('&').filter(Boolean).map((pair) => {
    const i = pair.indexOf('=');
    const k = i < 0 ? pair : pair.slice(0, i);
    const v = i < 0 ? '' : pair.slice(i + 1);
    return [safeDecode(k) ?? '', safeDecode(v)];
  });
}

function safeDecode(s: string): string | null {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** base64url (RFC 4648 §5, padding optional) of a UTF-8 string. Own implementation: no Buffer/atob
 *  assumptions across Hermes, the web and Node. */
export function base64UrlEncode(text: string): string {
  const bytes = utf8Encode(text);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64URL[(n >> 18) & 63] + B64URL[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += B64URL[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += B64URL[n & 63];
  }
  return out;
}

export function base64UrlDecode(input: string): string | null {
  const s = input.replace(/=+$/, '');
  if (!/^[A-Za-z0-9_-]*$/.test(s) || s.length % 4 === 1) return null;
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    const c = [0, 1, 2, 3].map((k) => (i + k < s.length ? B64URL.indexOf(s[i + k]) : 0));
    const n = (c[0] << 18) | (c[1] << 12) | (c[2] << 6) | c[3];
    bytes.push((n >> 16) & 255);
    if (i + 2 < s.length) bytes.push((n >> 8) & 255);
    if (i + 3 < s.length) bytes.push(n & 255);
  }
  return utf8Decode(bytes);
}

function utf8Encode(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else {
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    }
  }
  return out;
}

function utf8Decode(bytes: number[]): string | null {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    let cp: number;
    let extra: number;
    if (b < 0x80) [cp, extra] = [b, 0];
    else if (b >= 0xc2 && b < 0xe0) [cp, extra] = [b & 0x1f, 1];
    else if (b >= 0xe0 && b < 0xf0) [cp, extra] = [b & 0x0f, 2];
    else if (b >= 0xf0 && b < 0xf5) [cp, extra] = [b & 0x07, 3];
    else return null;
    if (i + extra >= bytes.length + (extra ? 0 : 1)) return null;
    for (let k = 1; k <= extra; k++) {
      const c = bytes[i + k];
      if (c === undefined || (c & 0xc0) !== 0x80) return null;
      cp = (cp << 6) | (c & 63);
    }
    out += String.fromCodePoint(cp);
    i += extra + 1;
  }
  return out;
}

/** The export payload of `mateu://import?d=…`. */
export function encodeImportPayload(baseUrls: string[]): string {
  return base64UrlEncode(JSON.stringify({ v: 1, u: baseUrls }));
}

/**
 * Classifies a scanned / opened link. Anything that is not one of the accepted forms is `invalid`
 * with a sentence the user can read — a QR for something else (a menu, a wifi network) is the
 * common case, not an attack.
 */
export function parseHubLink(raw: string, options: ParseOptions = {}): HubLink {
  if (typeof raw !== 'string' || !raw.trim()) return { kind: 'invalid', reason: 'The code is empty.' };
  const text = raw.trim();
  if (text.length > 8192) return { kind: 'invalid', reason: 'The code is too long.' };
  const m = URL_RE.exec(text);
  if (!m) return { kind: 'invalid', reason: 'This code is not a Mateu link.' };
  const scheme = m[1].toLowerCase();
  const authority = m[2].toLowerCase();
  const path = (m[3] ?? '').replace(/\/+$/, '');
  const query = parseQuery(m[4] ?? '');

  let action: 'add' | 'import' | null = null;
  if (scheme === 'mateu') {
    // mateu://add?… — the "host" is the action; tolerate mateu:///add too
    const verb = authority || path.replace(/^\//, '');
    if (verb === 'add' || verb === 'import') action = verb;
  } else if (scheme === 'https' || (scheme === 'http' && options.allowInsecure)) {
    const hosts = [...LINK_HOSTS, ...(options.extraLinkHosts ?? []).map((h) => h.toLowerCase())];
    if (hosts.includes(authority) && (path === '/add' || path === '/import')) action = path === '/add' ? 'add' : 'import';
  }
  if (!action) return { kind: 'invalid', reason: 'This code is not a Mateu link.' };

  const values = (key: string) => query.filter(([k]) => k === key).map(([, v]) => v);

  if (action === 'import' || values('d').length) {
    const d = values('d')[0];
    if (d == null) return { kind: 'invalid', reason: 'The import code is damaged.' };
    const json = base64UrlDecode(d);
    let list: unknown;
    try {
      const parsed = json == null ? null : (JSON.parse(json) as { v?: unknown; u?: unknown });
      list = parsed && parsed.v === 1 ? parsed.u : null;
    } catch {
      list = null;
    }
    if (!Array.isArray(list)) return { kind: 'invalid', reason: 'The import code is damaged.' };
    return importOf(list, options);
  }

  const us = values('u');
  if (us.length === 0) return { kind: 'invalid', reason: 'The link does not say which app to add.' };
  if (us.length > 1) return importOf(us, options);
  const u = us[0];
  if (u == null) return { kind: 'invalid', reason: 'The link is damaged.' };
  const base = normalizeBaseUrl(u, options);
  if (!base.ok) return { kind: 'invalid', reason: base.reason };
  const r = values('r');
  const route = r.length === 1 ? sanitizeRoute(r[0]) : undefined;
  return route ? { kind: 'add', baseUrl: base.baseUrl, route } : { kind: 'add', baseUrl: base.baseUrl };
}

function importOf(list: unknown[], options: ParseOptions): HubLink {
  const seen = new Set<string>();
  const baseUrls: string[] = [];
  let rejected = 0;
  for (const item of list.slice(0, MAX_IMPORT)) {
    const n = typeof item === 'string' ? normalizeBaseUrl(item, options) : null;
    if (!n || !n.ok) {
      rejected++;
      continue;
    }
    if (!seen.has(n.baseUrl)) {
      seen.add(n.baseUrl);
      baseUrls.push(n.baseUrl);
    }
  }
  rejected += Math.max(0, list.length - MAX_IMPORT);
  if (baseUrls.length === 0) return { kind: 'invalid', reason: 'The import code has no usable addresses.' };
  return { kind: 'import', baseUrls, rejected };
}

/** The "Export my UIs" link: base URLs only — never tokens, names or anything else. The universal-link
 *  form so the system camera on another phone opens the app directly. */
export function exportLink(baseUrls: string[]): string {
  return `https://mateu.io/add?${baseUrls.map((u) => `u=${encodeURIComponent(u)}`).join('&')}`;
}

/** The share/QR link for ONE UI (what the web's "Open on mobile" dialog encodes). */
export function addLink(baseUrl: string, route?: string): string {
  const r = sanitizeRoute(route);
  return `https://mateu.io/add?u=${encodeURIComponent(baseUrl)}${r ? `&r=${encodeURIComponent(r)}` : ''}`;
}
