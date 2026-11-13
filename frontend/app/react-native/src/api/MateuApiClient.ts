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
import { classifyFailure, DEFAULT_TIMEOUT_MS, HttpStatusError, isIdempotentAction, RequestTimeoutError, retryDelayMs, shouldRetry } from '../core/requestPolicy.ts';
import { connectivity } from '../core/connectivity.ts';
import { IDEMPOTENCY_HEADER } from '../core/offlineQueue.ts';
import { isBackgroundRequest, serverActivity, type ServerActivity } from '../core/serverActivity.ts';

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
  /** The chrome of the embedded micro frontend this request comes from (MicroFrontend.chrome): the
   *  server then sends it no window commands (title, favicon, history). */
  embeddedChrome?: string;
  /** `@Action(timeoutMillis)`: give up after this long (else DEFAULT_TIMEOUT_MS). */
  timeoutMillis?: number;
  /** `@Action(idempotent)`: the action may be repeated after a timeout / 5xx, like a load or a search. */
  idempotent?: boolean;
  /** The offline send queue's key (`Idempotency-Key` header): the server runs a request carrying
   *  it once per caller + action, so it is also safe to repeat after a timeout / 5xx. */
  idempotencyKey?: string;
  /** A 401 may only refresh the CURRENT sign-in silently, never open the sign-in browser: the
   *  offline send queue's sends — a sign-in there could be someone else's, and the queued request
   *  would then be repeated as them. */
  silentReauth?: boolean;
  /** Background traffic the user is not waiting for (a polling refresh, the offline queue's drain):
   *  not counted by the "waiting for the server" indicator (core/serverActivity.ts). Never sent. */
  background?: boolean;
}

/** Counts `call` on `activity` as a request the UI is waiting for — unless it is background traffic. */
const countedOn = <T>(activity: ServerActivity, params: { actionId?: string; background?: boolean }, call: () => Promise<T>): Promise<T> =>
  isBackgroundRequest(params.actionId, params.background) ? call() : activity.track(call);

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

  /** What the "waiting for the server" bar of THIS client's UI counts (core/serverActivity.ts): its
   *  session's own (MateuSession sets it — a hub keeps several UIs open), the app's one otherwise. */
  activity: ServerActivity = serverActivity;

  /** Whether a 401 may open the sign-in browser: a hub UI that is not on screen may not. */
  mayPrompt: () => boolean = () => true;

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
    // the same hybrid rule as runAction: a static bundle answers the LOADS; an ACTION goes on to the
    // server behind it (a hybrid deployment proxies /mateu/** to a backend), and only a host with
    // nothing at /mateu (404/405, no answer) ends in "This UI has no server"
    if (this.local) {
      if (!params.actionId) {
        onIncrement(this.local.answer(params));
        return;
      }
      let delivered = false;
      try {
        await this.streamAction(params, (increment) => {
          delivered = true;
          onIncrement(increment);
        }, signal);
      } catch (e) {
        if (delivered || e instanceof StaleScreenError || signal?.aborted || !isNoServer(e)) throw e;
        onIncrement(this.local.answer(params)); // throws "This UI has no server: …"
      }
      return;
    }
    return this.streamAction(params, onIncrement, signal);
  }

  /** The stream, counted by the server-activity bar: a LongTask counts as long as its stream is open;
   *  the app's own long-lived streams (`_live-updates`, `_agent-channel`, `_progress-resume`) never do. */
  private streamAction(params: RunActionParams, onIncrement: (increment: unknown) => void, signal?: AbortSignal): Promise<void> {
    return countedOn(this.activity, params, () => this.openActionStream(params, onIncrement, signal));
  }

  private async openActionStream(params: RunActionParams, onIncrement: (increment: unknown) => void, signal?: AbortSignal): Promise<void> {
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
    return this.activity.track(() => this.sendForm(url, form));
  }

  private async sendForm(url: string, form: FormData): Promise<unknown> {
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
    if (response.status === 401 && this.carriesCredentials(url) && (await handleSessionExpired(this.auth, this.mayPrompt()))) {
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
      embeddedChrome: params.embeddedChrome,
    };
    for (const key of Object.keys(body)) {
      if (body[key] === null || body[key] === undefined) delete body[key];
    }
    return { urlSegment, payload: JSON.stringify(body) };
  }

  async runAction(params: RunActionParams): Promise<unknown> {
    // a static bundle answers the LOADS. An ACTION goes on to the server: a hybrid deployment (the
    // bundle + its /mateu/** proxied to a backend, e.g. a secret-carrying write) has one, as the web
    // and Redwood renderers assume; a purely static host answers 404/405 → "no server".
    if (this.local) {
      if (!params.actionId) return this.local.answer(params);
      try {
        return await countedOn(this.activity, params, () => this.postAction(params));
      } catch (e) {
        if (e instanceof StaleScreenError || !isNoServer(e)) throw e;
        return this.local.answer(params); // throws "This UI has no server: …"
      }
    }
    // counted from the first attempt to the last retry: one wait, however many tries it takes
    return countedOn(this.activity, params, () => this.postAction(params));
  }

  private async postAction(params: RunActionParams): Promise<unknown> {
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
      embeddedChrome: params.embeddedChrome,
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

    const timeoutMillis = params.timeoutMillis && params.timeoutMillis > 0 ? params.timeoutMillis : DEFAULT_TIMEOUT_MS;
    // a route load, a search or an @Action(idempotent) is repeated after a timeout / 5xx (twice, with
    // backoff); anything else is sent EXACTLY once — a save that timed out may still have happened
    const idempotent = isIdempotentAction(params.actionId ?? '', params.idempotent) || !!params.idempotencyKey;
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.postOnce(url, payload, timeoutMillis, params.idempotencyKey, !params.silentReauth);
      } catch (e) {
        if (e instanceof StaleScreenError) throw e;
        if (!shouldRetry(classifyFailure(e, connectivity.isOnline), attempt, idempotent)) throw e;
        devLog('[Mateu] retrying', params.actionId || '(load)', 'attempt', attempt + 1);
        await new Promise((r) => setTimeout(r, retryDelayMs(attempt)));
      }
    }
  }

  /** One POST, bounded by `timeoutMillis` (fetch has no timeout of its own: an answer that never
   *  came left the screen waiting forever). Reports reachability to `connectivity`. */
  private async postOnce(url: string, payload: string, timeoutMillis: number, idempotencyKey?: string, mayPrompt = true): Promise<unknown> {
    const abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timedOut = false;
    const timer = abort ? setTimeout(() => { timedOut = true; abort.abort(); }, timeoutMillis) : undefined;
    try {
      // headers are rebuilt per attempt: the retry after a re-auth must carry the NEW token
      const doFetch = async () =>
        fetch(url, { method: 'POST', headers: { ...(await this.headers()), [RENDERER_HEADER]: rendererHeaderValue(), ...(idempotencyKey ? { [IDEMPOTENCY_HEADER]: idempotencyKey } : {}) }, body: payload, ...(abort ? { signal: abort.signal } : {}) });
      let response: Response;
      try {
        // a silent re-auth may join a sign-in another request opened: it is repeated only if the
        // SAME person is signed in afterwards (the offline queue's sends, R1)
        const ownerBefore = !mayPrompt ? await this.auth?.owner?.().catch(() => null) : undefined;
        response = await doFetch();
        // Session expiry: a 401 gives the app one chance to re-authenticate, then we retry once.
        // (only against a backend trusted with the credentials: an anonymous island's 401 is not ours to fix)
        if (response.status === 401 && this.carriesCredentials() && (await handleSessionExpired(this.auth, mayPrompt && this.mayPrompt()))) {
          const sameOwner = mayPrompt || (await this.auth?.owner?.().catch(() => null)) === ownerBefore;
          if (sameOwner) response = await doFetch();
        }
      } catch (e) {
        if (timedOut) throw new RequestTimeoutError(timeoutMillis);
        // the request never reached the network
        if (e instanceof TypeError) connectivity.noteUnreachable();
        throw e;
      }
      connectivity.noteReachable();
      const text = await response.text();
      devLog('[Mateu] <--', response.status, text.slice(0, 500));
      this.observeBuild(url, response, text);

      if (!response.ok) {
        throw new HttpStatusError(response.status, text);
      }

      const json = JSON.parse(text);
      this.checkWire(json);
      return json;
    } catch (e) {
      if (timedOut && !(e instanceof RequestTimeoutError)) throw new RequestTimeoutError(timeoutMillis);
      throw e;
    } finally {
      if (timer) clearTimeout(timer);
    }
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
    componentState: Record<string, unknown> = {},
    embeddedChrome?: string,
  ): Promise<unknown> {
    return this.runAction({
      embeddedChrome,
      route,
      // '' means "nothing consumed yet" (a full URL load); '_empty' would make the backend
      // treat the route as relative to the root shell and answer with the App chrome again.
      consumedRoute: consumedRoute ?? '',
      actionId: '',
      serverSideType: serverSideType || null,
      initiatorComponentId: 'ux_main',
      componentState,
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

/** A host with no Mateu server behind it: it ANSWERS, and nothing listens at /mateu (404/405/501).
 *  A request that got no answer at all (a network failure: offline, the server down) is NOT that —
 *  a hybrid deployment has a server, and the user is told about the connection (GA-5.9). */
function isNoServer(e: unknown): boolean {
  const text = e instanceof Error ? e.message : String(e);
  return /^HTTP (404|405|501)\b/.test(text);
}
