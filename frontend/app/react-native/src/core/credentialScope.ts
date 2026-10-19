/**
 * WHERE this renderer may send the user's credentials — the Bearer token, the `X-Session-Id` and
 * the `@AppContext` values. The React Native twin of the web client's `credentialScope.ts`
 * (libs/mateu `infra/http/credentialScope.ts`): without it a federated island (a `MicroFrontend`
 * naming its own `baseUrl`) got them whatever that base url was, and so did a remote that an island
 * named in turn — the url comes from a server ANSWER, not from the app's configuration.
 *
 * Two kinds of trusted origins:
 *
 *  - ROOT: the app's own backend (the base url the app was configured with — the registry entry,
 *    the hub entry the user added) and whatever the host trusts explicitly ({@link trustRoot}).
 *  - DECLARED: a remote an app answered from a ROOT origin names (its MicroFrontend islands). The
 *    app's author chose it, as the server-side `mateu.remote.allowed-hosts` does for its own leg.
 *
 * A declared remote cannot extend the trust: the remotes IT names get no credentials. Everything
 * else is called anonymously (it still works for a public remote). A native app has no document
 * origin, so a RELATIVE url belongs to the root backend.
 */

/** The relative url key when the root base url is itself relative (expo web: same origin). */
const SAME_ORIGIN = 'same-origin';

const isRelative = (url: string): boolean => !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('//');

/** A url as a browser reads it: tabs/newlines removed anywhere, surrounding spaces dropped. */
const cleaned = (url: string): string => url.replace(/[\t\n\r]/g, '').trim();

/**
 * The origin `url` goes to, or undefined when it is not http(s) (or not a url at all). A relative
 * url resolves against `base` (the root backend).
 *
 * A url holding a backslash names NO origin we trust: a browser (expo web) reads `\\host`, `/\host`
 * and `\/host` as `//host` — another server — while a native loader rejects it. Taken for
 * relative, it sent the Bearer, the session id and the @AppContext to that server (R5).
 */
export function originOf(url: string | null | undefined, base?: string): string | undefined {
  if (url === undefined || url === null) return undefined;
  const u = cleaned(String(url));
  if (u.includes('\\')) return undefined;
  if (isRelative(u)) {
    if (base === undefined) return SAME_ORIGIN;
    const b = cleaned(base);
    if (b.includes('\\')) return undefined;
    if (isRelative(b)) return SAME_ORIGIN;
    try {
      const parsed = new URL(u, b.startsWith('//') ? 'https:' + b : b);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin : undefined;
    } catch {
      return undefined;
    }
  }
  try {
    const parsed = new URL(u.startsWith('//') ? 'https:' + u : u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin : undefined;
  } catch {
    return undefined;
  }
}

/** The trusted origins of ONE app (a hub runs several, each with its own scope). */
export class CredentialScope {
  private readonly rootBase: string;
  private readonly roots = new Set<string>();
  private readonly declared = new Set<string>();

  /** `rootBaseUrl`: the base url the app was configured with — trusted by definition. */
  constructor(rootBaseUrl: string) {
    this.rootBase = rootBaseUrl ?? '';
    this.trustRoot(this.rootBase);
  }

  /** An origin the HOST trusts with the user's credentials, beyond the app's own backend. */
  trustRoot(url: string): void {
    const origin = originOf(url, this.rootBase);
    if (origin) this.roots.add(origin);
  }

  /** True when `url` goes to a ROOT origin. */
  isRoot(url: string | null | undefined): boolean {
    const origin = originOf(url, this.rootBase);
    return !!origin && this.roots.has(origin);
  }

  /**
   * Remotes an app answered from `declarerBaseUrl` names (its islands). Trusted only when the
   * declarer is ROOT: a remote cannot hand out credentials.
   */
  declare(declarerBaseUrl: string, remoteBaseUrls: (string | null | undefined)[]): void {
    if (!this.isRoot(declarerBaseUrl)) return;
    for (const url of remoteBaseUrls) {
      const origin = originOf(url, this.rootBase);
      if (origin) this.declared.add(origin);
    }
  }

  /** True when a request to `url` may carry the user's credentials. */
  mayCarryCredentials(url: string | null | undefined): boolean {
    const origin = originOf(url, this.rootBase);
    if (!origin) return false;
    return this.roots.has(origin) || this.declared.has(origin);
  }
}

/** The credential headers a request carries — none of them when the target is not trusted. */
export const CREDENTIAL_HEADERS = ['Authorization', 'X-Session-Id'];

/** `headers` without the credential headers (case-insensitive). */
export function withoutCredentials(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  const banned = new Set(CREDENTIAL_HEADERS.map((h) => h.toLowerCase()));
  for (const [k, v] of Object.entries(headers)) if (!banned.has(k.toLowerCase())) out[k] = v;
  return out;
}

/**
 * The app state an island over another base url starts with: all of the host's when the island is
 * trusted; otherwise without the `@AppContext` values (`contextKeys`) — the active hotel, company…
 * are the user's context, like the token.
 */
export function appStateFor(
  appState: Record<string, unknown>,
  contextKeys: Iterable<string>,
  trusted: boolean,
): Record<string, unknown> {
  const copy = { ...appState };
  if (trusted) return copy;
  for (const key of contextKeys) delete copy[key];
  return copy;
}
