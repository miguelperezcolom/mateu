import { authHeaders, authHeadersFrom, type TokenProvider } from '../core/auth.ts';
import { handleSessionExpired } from '../core/sessionGuard.ts';
import { checkWireVersion } from '../core/wireVersion.ts';
import { parseSseChunk } from '../core/appShellExtras.ts';
import { CredentialScope, withoutCredentials } from '../core/credentialScope.ts';
import {
  BUILD_HEADER,
  RENDERER_HEADER,
  StaleScreenError,
  backendKeyOf,
  buildSkew,
  isMateuForbidden,
  rendererHeaderValue,
  skewTexts,
  type SkewNotice,
} from '../core/buildSkew.ts';
import { uiLocale } from '../core/money.ts';

/** A fetch whose response body is a readable STREAM (React Native's global fetch buffers the whole
 *  body). Registered by the app (expo/fetch); without one a stream is read once it has ended. */
let streamingFetch: typeof fetch | null = null;
export const setStreamingFetch = (f: typeof fetch | null): void => {
  streamingFetch = f;
};

export interface RunActionParams {
  route: string;
  consumedRoute: string;
  actionId: string;
  serverSideType: string | null;
  initiatorComponentId: string;
  componentState: Record<string, unknown>;
  appState: Record<string, unknown>;
  parameters: Record<string, unknown>;
}

declare const __DEV__: boolean | undefined;

/** Request/response bodies go to the console ONLY in development builds: a release build must not
 *  write the user's form contents (and the server's answers) to the device log. */
export const isDev = (): boolean => typeof __DEV__ !== 'undefined' && !!__DEV__;
const devLog = (...args: unknown[]): void => {
  if (isDev()) console.log(...args);
};

/** Answers requests with NO server behind them — a static bundle (core/staticBundle.ts). */
export interface LocalTransport {
  answer(request: { route: string; consumedRoute: string; actionId: string }): unknown;
}

export class MateuApiClient {
  readonly baseUrl: string;
  readonly sessionId: string;
  /**
   * Set when the base URL serves a STATIC BUNDLE instead of a Mateu server: every request is then
   * answered on the device from the bundle (route loads) and nothing is POSTed to `/mateu/v3/*` —
   * the host only serves files. Null = a Mateu server.
   */
  local: LocalTransport | null = null;
  /** Host hook: told ONCE when the server's wireVersion is outside what this build supports. */
  onWireMismatch: (message: string) => void = () => {};
  private wireChecked = false;
  /** Host hook: the backend was redeployed ('updated', once) or a refusal came from a screen built
   *  by an older deployment ('stale') — see core/buildSkew.ts. */
  onBuildNotice: (kind: Exclude<SkewNotice, 'none'>) => void = () => {};

  /**
   * This client's own token provider. `undefined` (the single-backend renderer) = use the global one
   * registered with setTokenProvider; a provider or `null` (a hub UI session) = use ONLY this one, so
   * one UI's token is never sent to another UI's server.
   */
  readonly auth: TokenProvider | null | undefined;

  /**
   * Whether a request to a url may carry the user's credentials (see core/credentialScope.ts).
   * Absent (a bare client) = only this client's own base url.
   */
  private readonly credentialsFor: (url: string) => boolean;

  constructor(baseUrl: string, sessionId: string, auth?: TokenProvider | null, credentialsFor?: (url: string) => boolean) {
    this.baseUrl = baseUrl;
    this.sessionId = sessionId;
    this.auth = auth;
    const own = new CredentialScope(baseUrl);
    this.credentialsFor = credentialsFor ?? ((url) => own.mayCarryCredentials(url));
  }

  /** True when a request to `url` (this client's base url by default) may carry credentials. */
  carriesCredentials(url: string = this.baseUrl): boolean {
    return this.credentialsFor(url);
  }

  /** The headers a request to `url` (this client's base url by default) carries: the per-install
   *  session id and, when a token provider is registered, the Bearer token the backend resolves
   *  identity from — both ONLY when `url` is trusted with them (the app's own backend, a remote it
   *  names); an island a remote named is called anonymously. */
  async headers(extra: Record<string, string> = {}, url: string = this.baseUrl): Promise<Record<string, string>> {
    const base: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (!this.carriesCredentials(url)) return { ...base, ...withoutCredentials(extra) };
    return {
      ...base,
      'X-Session-Id': this.sessionId,
      ...(this.auth === undefined ? await authHeaders() : await authHeadersFrom(this.auth)),
      ...extra,
    };
  }

  /**
   * An `sse` action (a LongTask): POST to the stream endpoint and apply each increment AS IT
   * ARRIVES — the progress dialog moves while the task runs, as on the web. Same body as a sync call.
   */
  async runActionStream(params: RunActionParams, onIncrement: (increment: unknown) => void, signal?: AbortSignal): Promise<void> {
    if (this.local) {
      onIncrement(this.local.answer(params));
      return;
    }
    const { urlSegment, payload } = this.requestOf(params);
    const url = `${this.baseUrl}/mateu/v3/sse/${urlSegment}`;
    devLog('[Mateu] --> POST (stream)', url);
    let buffer = '';
    const deliver = (final: boolean) => {
      const { increments, rest } = parseSseChunk(final ? buffer + '\n\n' : buffer);
      buffer = final ? '' : rest;
      for (const increment of increments) {
        this.checkWire(increment);
        onIncrement(increment);
      }
    };
    await this.postStream(
      url,
      payload,
      (text) => {
        buffer += text;
        deliver(false);
      },
      signal,
      true,
    );
    deliver(true);
  }

  /**
   * POSTs `body` to `url` (an SSE endpoint: a LongTask, the assistant chat) and hands the response
   * text to `onText` AS IT ARRIVES — through the registered streaming fetch; without one the whole
   * text arrives once the stream has ended. Credentials only when `url` is trusted with them.
   * Session expiry, exactly as runAction: a 401 gives the app (or this client's own provider) one
   * chance to re-authenticate, then the request is retried once — nothing has been streamed yet.
   */
  async postStream(
    url: string,
    body: string,
    onText: (text: string) => void,
    signal?: AbortSignal,
    mateuEndpoint = false,
  ): Promise<void> {
    const send = streamingFetch ?? fetch;
    const extra: Record<string, string> = { Accept: 'text/event-stream' };
    if (mateuEndpoint) extra[RENDERER_HEADER] = rendererHeaderValue();
    // headers are rebuilt per attempt: the retry after a re-auth must carry the NEW token
    const doFetch = async () =>
      send(url, { method: 'POST', headers: { ...(await this.headers({}, url)), ...extra }, body, ...(signal ? { signal } : {}) });
    const response = await this.withReauth(url, doFetch);
    if (!response.ok) {
      const text = await response.text();
      if (mateuEndpoint) this.observeBuild(url, response, text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    if (mateuEndpoint) this.observeBuild(url, response, '');
    const reader = (response.body as ReadableStream<Uint8Array> | null)?.getReader?.();
    if (!reader) {
      onText(await response.text());
      return;
    }
    const decoder = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      onText(decoder.decode(value, { stream: true }));
    }
    const tail = decoder.decode();
    if (tail) onText(tail);
  }

  /**
   * A multipart POST (the assistant's attachments): the credential headers when `url` is trusted
   * with them, but NO Content-Type — the runtime writes the multipart boundary. Answers the JSON.
   */
  async postForm(url: string, form: FormData): Promise<unknown> {
    const doFetch = async () => {
      const headers = await this.headers({}, url);
      delete headers['Content-Type'];
      return fetch(url, { method: 'POST', headers, body: form });
    };
    const response = await this.withReauth(url, doFetch);
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : {};
  }

  /** One re-authentication + retry on a 401 — only against a url trusted with the credentials. */
  private async withReauth(url: string, doFetch: () => Promise<Response>): Promise<Response> {
    const response = await doFetch();
    if (response.status === 401 && this.carriesCredentials(url) && (await handleSessionExpired(this.auth))) {
      await response.text().catch(() => '');
      return doFetch();
    }
    return response;
  }

  private requestOf(params: RunActionParams): { urlSegment: string; payload: string } {
    const routeStripped = params.route.startsWith('/') ? params.route.slice(1) : params.route;
    const urlSegment = routeStripped === '' ? '_no_route' : routeStripped;
    const bodyRoute = routeStripped === '' ? '' : '/' + routeStripped;
    const body: Record<string, unknown> = {
      route: bodyRoute,
      consumedRoute: params.consumedRoute ?? '',
      actionId: params.actionId ?? '',
      serverSideType: params.serverSideType,
      initiatorComponentId: params.initiatorComponentId,
      componentState: params.componentState ?? {},
      appState: params.appState ?? {},
      parameters: params.parameters ?? {},
    };
    for (const key of Object.keys(body)) {
      if (body[key] === null || body[key] === undefined) delete body[key];
    }
    return { urlSegment, payload: JSON.stringify(body) };
  }

  async runAction(params: RunActionParams): Promise<unknown> {
    // a static bundle: answered here, from the bundle — there is no server to POST to
    if (this.local) return this.local.answer(params);
    const routeStripped = params.route.startsWith('/') ? params.route.slice(1) : params.route;
    const urlSegment = routeStripped === '' ? '_no_route' : routeStripped;
    const bodyRoute = routeStripped === '' ? '' : '/' + routeStripped;

    const body: Record<string, unknown> = {
      route: bodyRoute,
      consumedRoute: params.consumedRoute ?? '',
      actionId: params.actionId ?? '',
      serverSideType: params.serverSideType,
      initiatorComponentId: params.initiatorComponentId,
      componentState: params.componentState ?? {},
      appState: params.appState ?? {},
      parameters: params.parameters ?? {},
    };

    // Drop null values to match web frontend behaviour
    for (const key of Object.keys(body)) {
      if (body[key] === null || body[key] === undefined) {
        delete body[key];
      }
    }

    const url = `${this.baseUrl}/mateu/v3/sync/${urlSegment}`;
    const payload = JSON.stringify(body);
    devLog('[Mateu] --> POST', url);
    devLog('[Mateu]     body:', payload.slice(0, 500));

    // headers are rebuilt per attempt: the retry after a re-auth must carry the NEW token
    const doFetch = async () =>
      fetch(url, { method: 'POST', headers: { ...(await this.headers()), [RENDERER_HEADER]: rendererHeaderValue() }, body: payload });

    let response = await doFetch();
    // Session expiry: a 401 gives the app one chance to re-authenticate, then we retry once.
    // (only against a backend trusted with the credentials: an anonymous island's 401 is not ours to fix)
    if (response.status === 401 && this.carriesCredentials() && (await handleSessionExpired(this.auth))) {
      response = await doFetch();
    }
    const text = await response.text();
    devLog('[Mateu] <--', response.status, text.slice(0, 500));
    this.observeBuild(url, response, text);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const json = JSON.parse(text);
    this.checkWire(json);
    return json;
  }

  /**
   * The deployment skew check of one Mateu response: the first `X-Mateu-Build` per backend is its
   * baseline; a success with another build tells the host once ('updated'); a Mateu 403 with
   * another build is a stale screen — told to the host and thrown as a StaleScreenError so the
   * generic "forbidden" text is not shown as well.
   */
  private observeBuild(url: string, response: Response, body: string): void {
    const build = response.headers?.get?.(BUILD_HEADER) ?? null;
    const notice = buildSkew.observe(backendKeyOf(url), {
      build,
      ok: response.ok,
      mateuForbidden: isMateuForbidden(response.status, body),
    });
    if (notice === 'none') return;
    this.onBuildNotice(notice);
    if (notice === 'stale') throw new StaleScreenError(skewTexts(uiLocale()).stale);
  }

  /** The first response that carries `wireVersion` decides; a mismatch is reported once. */
  private checkWire(json: unknown): void {
    if (this.wireChecked || !json || typeof json !== 'object') return;
    const received = (json as Record<string, unknown>)['wireVersion'];
    if (received === undefined) return;
    this.wireChecked = true;
    const check = checkWireVersion(received);
    if (!check.ok) {
      console.warn('[Mateu]', check.message);
      this.onWireMismatch(check.message);
    } else if (check.note) {
      devLog('[Mateu]', check.note);
    }
  }

  async initialLoad(route: string, appState: Record<string, unknown>): Promise<unknown> {
    return this.runAction({
      route,
      consumedRoute: '_empty',
      actionId: '',
      serverSideType: null,
      initiatorComponentId: 'ux_main',
      componentState: {},
      appState,
      parameters: {},
    });
  }

  async navigate(
    route: string,
    consumedRoute: string,
    serverSideType: string,
    appState: Record<string, unknown>,
  ): Promise<unknown> {
    return this.runAction({
      route,
      // '' means "nothing consumed yet" (a full URL load); '_empty' would make the backend
      // treat the route as relative to the root shell and answer with the App chrome again.
      consumedRoute: consumedRoute ?? '',
      actionId: '',
      serverSideType: serverSideType || null,
      initiatorComponentId: 'ux_main',
      componentState: {},
      appState,
      parameters: {},
    });
  }

  async runFormAction(
    route: string,
    consumedRoute: string,
    actionId: string,
    serverSideType: string,
    componentId: string,
    componentState: Record<string, unknown>,
    appState: Record<string, unknown>,
  ): Promise<unknown> {
    return this.runAction({
      route,
      consumedRoute: consumedRoute || '_empty',
      actionId,
      serverSideType: serverSideType || null,
      initiatorComponentId: componentId,
      componentState,
      appState,
      parameters: {},
    });
  }
}
