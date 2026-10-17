import { authHeaders, authHeadersFrom, type TokenProvider } from '../core/auth.ts';
import { handleSessionExpired } from '../core/sessionGuard.ts';
import { checkWireVersion } from '../core/wireVersion.ts';
import { parseSseChunk } from '../core/appShellExtras.ts';

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

export class MateuApiClient {
  readonly baseUrl: string;
  readonly sessionId: string;
  /** Host hook: told ONCE when the server's wireVersion is outside what this build supports. */
  onWireMismatch: (message: string) => void = () => {};
  private wireChecked = false;

  /**
   * This client's own token provider. `undefined` (the single-backend renderer) = use the global one
   * registered with setTokenProvider; a provider or `null` (a hub UI session) = use ONLY this one, so
   * one UI's token is never sent to another UI's server.
   */
  readonly auth: TokenProvider | null | undefined;

  constructor(baseUrl: string, sessionId: string, auth?: TokenProvider | null) {
    this.baseUrl = baseUrl;
    this.sessionId = sessionId;
    this.auth = auth;
  }

  /** The headers every Mateu request carries: the per-install session id and, when a token
   *  provider is registered, the Bearer token the backend resolves identity from. */
  async headers(extra: Record<string, string> = {}): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Session-Id': this.sessionId,
      ...(this.auth === undefined ? await authHeaders() : await authHeadersFrom(this.auth)),
      ...extra,
    };
  }

  /**
   * An `sse` action (a LongTask): POST to the stream endpoint and apply each increment AS IT
   * ARRIVES — the progress dialog moves while the task runs, as on the web. Same body as a sync call.
   */
  async runActionStream(params: RunActionParams, onIncrement: (increment: unknown) => void): Promise<void> {
    const { urlSegment, payload } = this.requestOf(params);
    const url = `${this.baseUrl}/mateu/v3/sse/${urlSegment}`;
    devLog('[Mateu] --> POST (stream)', url);
    const doFetch = streamingFetch ?? fetch;
    const response = await doFetch(url, { method: 'POST', headers: await this.headers({ Accept: 'text/event-stream' }), body: payload });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    let buffer = '';
    const deliver = (final: boolean) => {
      const { increments, rest } = parseSseChunk(final ? buffer + '\n\n' : buffer);
      buffer = final ? '' : rest;
      for (const increment of increments) {
        this.checkWire(increment);
        onIncrement(increment);
      }
    };
    const reader = (response.body as ReadableStream<Uint8Array> | null)?.getReader?.();
    if (!reader) {
      buffer = await response.text();
      deliver(true);
      return;
    }
    const decoder = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      deliver(false);
    }
    deliver(true);
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
    const doFetch = async () => fetch(url, { method: 'POST', headers: await this.headers(), body: payload });

    let response = await doFetch();
    // Session expiry: a 401 gives the app one chance to re-authenticate, then we retry once.
    if (response.status === 401 && (await handleSessionExpired(this.auth))) {
      response = await doFetch();
    }
    const text = await response.text();
    devLog('[Mateu] <--', response.status, text.slice(0, 500));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const json = JSON.parse(text);
    this.checkWire(json);
    return json;
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
