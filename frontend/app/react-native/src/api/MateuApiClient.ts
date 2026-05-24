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

export class MateuApiClient {
  private readonly baseUrl: string;
  private readonly sessionId: string;

  constructor(baseUrl: string, sessionId: string) {
    this.baseUrl = baseUrl;
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

    // Drop null values to match web frontend behaviour
    for (const key of Object.keys(body)) {
      if (body[key] === null || body[key] === undefined) {
        delete body[key];
      }
    }

    const url = `${this.baseUrl}/mateu/v3/sync/${urlSegment}`;
    console.log('[Mateu] --> POST', url);
    console.log('[Mateu]     body:', JSON.stringify(body).slice(0, 500));

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
    console.log('[Mateu] <--', response.status, text.slice(0, 500));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return JSON.parse(text);
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
      consumedRoute: consumedRoute || '_empty',
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
