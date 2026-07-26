/**
 * Wire client for the Mateu sync protocol: POST {baseUrl}/mateu/v3/sync/{route}.
 *
 * Ported from the React Native renderer (frontend/app/react-native/src/api/MateuApiClient.ts) — a
 * plain `fetch` client with no framework dependency. The redwood renderer speaks the identical
 * protocol as every other Mateu frontend, so the backend needs zero changes.
 */

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

/** Flip to true to trace every request/response on the console. */
const DEBUG = false;

export class MateuApiClient {
  readonly baseUrl: string;
  private readonly sessionId: string;

  constructor(baseUrl: string, sessionId: string) {
    // Normalise: keep a leading slash, drop any trailing one (URLs are composed as baseUrl + '/mateu…').
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.sessionId = sessionId;
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

    // Drop null/undefined values to match the web frontend's request shape.
    for (const key of Object.keys(body)) {
      if (body[key] === null || body[key] === undefined) delete body[key];
    }

    const url = `${this.baseUrl}/mateu/v3/sync/${urlSegment}`;
    if (DEBUG) {
      console.log('[Mateu] --> POST', url);
      console.log('[Mateu]     body:', JSON.stringify(body).slice(0, 500));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Session-Id': this.sessionId,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (DEBUG) console.log('[Mateu] <--', response.status, text.slice(0, 500));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
    }

    return text ? JSON.parse(text) : {};
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
      // '' means "nothing consumed yet" (a full URL load); '_empty' would make the backend treat the
      // route as relative to the root shell and answer with the App chrome again.
      consumedRoute: consumedRoute ?? '',
      actionId: '',
      serverSideType: serverSideType || null,
      initiatorComponentId: 'ux_main',
      componentState: {},
      appState,
      parameters: {},
    });
  }
}
