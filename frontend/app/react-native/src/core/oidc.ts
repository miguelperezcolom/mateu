import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { TokenProvider } from './auth';
import { isExpiring, parseStoredTokens, tokensFromResponse, type OidcConfig, type StoredTokens } from './oidcConfig';
import type { KeyValueStore } from './sessionId';

// On web the identity provider redirects back into a popup; this closes it and hands the result
// to the opener. A no-op on iOS/Android.
WebBrowser.maybeCompleteAuthSession();

const TOKENS_KEY = 'mateu.oidc.tokens';

/** The app's deep-link scheme (app.json `expo.scheme`) — the redirect target registered at the IdP:
 *  `mateu://auth` on devices, `<origin>/auth` on web. */
export const OIDC_REDIRECT_SCHEME = 'mateu';

export function oidcRedirectUri(): string {
  return AuthSession.makeRedirectUri({ scheme: OIDC_REDIRECT_SCHEME, path: 'auth' });
}

/**
 * The built-in OIDC TokenProvider: Authorization Code + PKCE through the system browser
 * (expo-auth-session), tokens kept in the keychain/keystore (secureStore.ts), proactive refresh
 * when the access token is about to expire, and the refresh-token grant on a 401 before falling
 * back to an interactive login. Works against any standards-compliant provider (Keycloak, Entra
 * ID, Auth0, Okta, Cognito…) — it only needs the issuer's discovery document.
 */
export class OidcTokenProvider implements TokenProvider {
  private tokens: StoredTokens | null = null;
  private loaded = false;
  private discovery: AuthSession.DiscoveryDocument | null = null;

  constructor(
    readonly config: OidcConfig,
    private readonly store: KeyValueStore,
  ) {}

  private async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      this.tokens = parseStoredTokens(await this.store.get(TOKENS_KEY));
    } catch {
      this.tokens = null;
    }
  }

  private async save(tokens: StoredTokens | null): Promise<void> {
    this.tokens = tokens;
    try {
      if (tokens) await this.store.set(TOKENS_KEY, JSON.stringify(tokens));
      else await this.store.remove(TOKENS_KEY);
    } catch {
      // kept in memory for this launch
    }
  }

  private async discover(): Promise<AuthSession.DiscoveryDocument> {
    if (!this.discovery) this.discovery = await AuthSession.fetchDiscoveryAsync(this.config.issuer);
    return this.discovery;
  }

  private extraParams(): Record<string, string> {
    return this.config.audience ? { audience: this.config.audience } : {};
  }

  /** True when a usable (or refreshable) session exists — the boot gate's question. */
  async isSignedIn(): Promise<boolean> {
    return (await this.getToken()) !== null;
  }

  async getToken(): Promise<string | null> {
    await this.load();
    if (!this.tokens) return null;
    if (isExpiring(this.tokens)) {
      if (!(await this.refresh())) return null;
    }
    return this.tokens?.accessToken ?? null;
  }

  async refresh(): Promise<boolean> {
    await this.load();
    const refreshToken = this.tokens?.refreshToken;
    if (!refreshToken) return false;
    try {
      const discovery = await this.discover();
      const res = await AuthSession.refreshAsync(
        { clientId: this.config.clientId, refreshToken, extraParams: this.extraParams() },
        discovery,
      );
      await this.save(tokensFromResponse(res, this.tokens));
      return true;
    } catch {
      // refresh token expired or revoked: the session is over
      await this.save(null);
      return false;
    }
  }

  async login(): Promise<boolean> {
    const discovery = await this.discover();
    const redirectUri = oidcRedirectUri();
    const request = new AuthSession.AuthRequest({
      clientId: this.config.clientId,
      scopes: this.config.scopes,
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
      extraParams: this.extraParams(),
    });
    const result = await request.promptAsync(discovery);
    if (result.type !== 'success' || !result.params['code']) return false;
    const res = await AuthSession.exchangeCodeAsync(
      {
        clientId: this.config.clientId,
        code: result.params['code'],
        redirectUri,
        extraParams: { ...this.extraParams(), ...(request.codeVerifier ? { code_verifier: request.codeVerifier } : {}) },
      },
      discovery,
    );
    await this.save(tokensFromResponse(res, null));
    return true;
  }

  async logout(): Promise<void> {
    const token = this.tokens?.refreshToken ?? this.tokens?.accessToken;
    await this.save(null);
    if (!token) return;
    try {
      const discovery = await this.discover();
      if (discovery.revocationEndpoint) {
        await AuthSession.revokeAsync({ clientId: this.config.clientId, token }, discovery);
      }
    } catch {
      // best effort: the local session is gone either way
    }
  }
}
