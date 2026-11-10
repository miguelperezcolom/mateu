// What the view controller reads off a loaded server-side component and its increments, as pure
// functions: the per-action flags, action ownership and the bubbling target, the trigger plan
// (@AutoSave, @SubscribeTo), failed validations, event payload stamping, an App shell's home
// target and a message's toast. Pure TypeScript, tested by node's runner.
import { confirmationOf, type ConfirmationDialogTexts } from './actionConfirmation.ts';
import { asArray, str } from './viewWire.ts';

type Json = Record<string, any>;

/** The flags of a component's wire actions, keyed by action id. */
export interface ActionFlags {
  ids: string[];
  validationRequired: Record<string, boolean>;
  rowsSelectedRequired: Record<string, boolean>;
  confirmation: Record<string, ConfirmationDialogTexts>;
  /** Actions answered as a STREAM of increments (`ActionDto.sse` — a LongTask). */
  sse: Record<string, boolean>;
  bubble: Record<string, boolean>;
  /** @RestAction/@RestData descriptors: the client fetches the endpoint itself. */
  restData: Record<string, Json>;
  /** `@Action(timeoutMillis)`: how long the client waits for the answer. */
  timeoutMillis: Record<string, number>;
  /** `@Action(idempotent)`: safe to repeat after a timeout / 5xx. */
  idempotent: Record<string, boolean>;
}

/** Reads the flags of the wire `actions` list; entries without an id are skipped. */
export function actionFlagsOf(actions: unknown): ActionFlags {
  const flags: ActionFlags = { ids: [], validationRequired: {}, rowsSelectedRequired: {}, confirmation: {}, sse: {}, bubble: {}, restData: {}, timeoutMillis: {}, idempotent: {} };
  for (const a of asArray(actions)) {
    const id = str(a['id']);
    if (!id) continue;
    flags.ids.push(id);
    flags.validationRequired[id] = a['validationRequired'] === true;
    flags.rowsSelectedRequired[id] = a['rowsSelectedRequired'] === true;
    const confirmation = confirmationOf(a);
    if (confirmation) flags.confirmation[id] = confirmation;
    if (a['sse'] === true) flags.sse[id] = true;
    flags.bubble[id] = a['bubble'] === true;
    if (a['restAction'] && typeof a['restAction'] === 'object') flags.restData[id] = a['restAction'] as Json;
    const timeout = Number(a['timeoutMillis']);
    if (timeout > 0) flags.timeoutMillis[id] = timeout;
    if (a['idempotent'] === true) flags.idempotent[id] = true;
  }
  return flags;
}

/** Whether the component owns `actionId`: listed as is, or under a `prefix*` wildcard. */
export function ownsAction(owned: string[], actionId: string): boolean {
  for (const o of owned) {
    if (o === actionId) return true;
    if (o.endsWith('*') && actionId.startsWith(o.slice(0, -1))) return true;
  }
  return false;
}

/** Where an action is dispatched: the view's own type, or — when it bubbles (unowned, or
 *  declared `bubble`) — the crud orchestrator it lives in, else the type it was navigated with. */
export function actionTargetOf(ctx: {
  bubbles: boolean;
  currentServerSideType: string;
  currentRoute: string;
  orchestratorServerSideType: string;
  orchestratorComponentRoute: string;
  navigationServerSideType: string;
}): string {
  if (
    ctx.bubbles &&
    ctx.orchestratorServerSideType &&
    ctx.orchestratorServerSideType !== ctx.currentServerSideType &&
    ctx.currentRoute.startsWith(ctx.orchestratorComponentRoute)
  ) {
    return ctx.orchestratorServerSideType;
  }
  if (ctx.bubbles && ctx.navigationServerSideType && ctx.navigationServerSideType !== ctx.currentServerSideType) {
    return ctx.navigationServerSideType;
  }
  return ctx.currentServerSideType;
}

/** A crud orchestrator's identity, when the component's initialData names its component route. */
export function orchestratorOf(sscNode: Json): { serverSideType: string; componentRoute: string } | null {
  const initialData = (sscNode['initialData'] as Json) ?? {};
  const componentRoute = str(initialData['componentRoute']) || str(initialData['_componentRoute']);
  const sst = str(sscNode['serverSideType']);
  return componentRoute && sst ? { serverSideType: sst, componentRoute } : null;
}

export interface EventSubscription {
  eventName: string;
  actionId: string;
  from: string;
  /** DOCUMENT | COMPONENT | SELF (upper-cased; '' when absent). */
  scope: string;
}

/** The component's @AutoSave and @SubscribeTo/OnCustomEvent triggers (others are ignored here). */
export function triggerPlanOf(triggers: unknown): {
  autoSave: { actionId: string; debounceMillis: number } | null;
  subscriptions: EventSubscription[];
} {
  let autoSave: { actionId: string; debounceMillis: number } | null = null;
  const subscriptions: EventSubscription[] = [];
  for (const trigger of asArray(triggers)) {
    const type = String(trigger['type']).toLowerCase();
    if (type === 'autosave') {
      autoSave = { actionId: str(trigger['actionId']) || 'save', debounceMillis: Number(trigger['debounceMillis']) || 800 };
      continue;
    }
    if (type !== 'oncustomevent') continue;
    const eventName = str(trigger['eventName']);
    const actionId = str(trigger['actionId']);
    if (!eventName || !actionId) continue;
    subscriptions.push({ eventName, actionId, from: str(trigger['from']), scope: str(trigger['source']).toUpperCase() });
  }
  return { autoSave, subscriptions };
}

/** The action parameters an event delivers to a subscription, or null when a COMPONENT-scoped
 *  subscription filters it out (the emitter's __source is not the one it listens to). */
export function subscriptionParameters(sub: EventSubscription, payload: unknown): Json | null {
  const params = payload && typeof payload === 'object' ? (payload as Json) : {};
  if (sub.scope === 'COMPONENT' && sub.from && str(params['__source']) !== sub.from) return null;
  return params;
}

/** Failed validations as fieldId → message (first failure per field; default "Invalid value"). */
export function fieldErrorsOf(validations: Json[], holds: (condition: string) => boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const v of validations) {
    const condition = str(v['condition']);
    if (condition && !holds(condition)) {
      const fieldId = str(v['fieldId']);
      if (!(fieldId in errors)) errors[fieldId] = str(v['message']) || 'Invalid value';
    }
  }
  return errors;
}

/** A DispatchEvent/CloseModal command's event: its name and payload, an object payload stamped
 *  with the emitter's __source (legacy non-object payloads keep their shape). Null without a name. */
export function namedEventOf(cmdData: Json | null | undefined, emitsName: string): { eventName: string; payload: unknown } | null {
  const eventName = str(cmdData?.['eventName']);
  if (!eventName) return null;
  let payload = cmdData?.['payload'] ?? cmdData?.['detail'] ?? null;
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && emitsName) {
    payload = { ...(payload as Json), __source: emitsName };
  }
  return { eventName, payload };
}

/** An App shell's home: route, consumed route and type (the app's own type when none is named). */
export function appHomeOf(meta: Json): { route: string; consumedRoute: string; serverSideType: string } {
  return {
    route: str(meta['homeRoute']),
    consumedRoute: str(meta['homeConsumedRoute']),
    serverSideType: str(meta['homeServerSideType']) || str(meta['serverSideType']),
  };
}

/** A listing search's default paging state, seeded where the state has none. */
/**
 * A route's query (`reservas?vista=LLEGADAS_HOY`) as values: what a shared link, or a menu entry
 * pointing at one view of a listing, says about it. `page` is a number; anything that does not
 * decode is left out.
 */
export function routeQueryOf(route: string | null | undefined): Json {
  const at = (route ?? '').indexOf('?');
  if (at < 0) return {};
  const out: Json = {};
  for (const pair of (route ?? '').slice(at + 1).split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    try {
      const key = decodeURIComponent((eq < 0 ? pair : pair.slice(0, eq)).replace(/\+/g, ' '));
      const value = eq < 0 ? '' : decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '));
      if (!key) continue;
      if (key === 'page') {
        const n = Number(value);
        if (Number.isInteger(n) && n >= 0) out['page'] = n;
      } else if (key === 'q') {
        out['searchText'] = value;
      } else {
        out[key] = value;
      }
    } catch {
      // a malformed escape: that pair says nothing
    }
  }
  return out;
}

/**
 * A listing's search state before it asks: the route's query first, under what the user already set
 * (the web's precedence: client state > query > defaults), then the defaults.
 */
export function seedSearchFromRoute(s: Json, route: string | null | undefined): void {
  for (const [k, v] of Object.entries(routeQueryOf(route))) if (s[k] === undefined) s[k] = v;
  seedSearchDefaults(s);
}

export function seedSearchDefaults(s: Json): void {
  if (s['page'] === undefined) s['page'] = 0;
  if (s['size'] === undefined) s['size'] = 10;
  if (s['sort'] === undefined) s['sort'] = [];
  if (s['searchText'] === undefined) s['searchText'] = '';
}

/** A wire message as a toast: null without text; an undoable one carries its reverse action. */
export function toastOf(msg: Json): {
  title: string | null;
  text: string;
  variant: 'info' | 'warning' | 'error';
  duration: number | undefined;
  undo: { label: string; actionId: string; parameters: Json } | undefined;
  /** Every action the message offers (Undo is one of them, style `undo`); the legacy `undo*`
   *  fields only when the server sent no `actions` (an older server). */
  actions: ToastAction[];
  /** toast (goes away) | sticky (until dismissed) | inbox (a toast that also lands in the inbox). */
  persistence: 'toast' | 'sticky' | 'inbox';
  /** A message with the same key replaces the one on screen (and the inbox entry). */
  key: string | null;
} | null {
  const text = str(msg['text']);
  if (!text) return null;
  const undoActionId = str(msg['undoActionId']);
  const duration = Number(msg['duration']) || 0;
  const variant = (str(msg['variant']) || 'info') as 'info' | 'warning' | 'error';
  const declared = Array.isArray(msg['actions']) ? (msg['actions'] as Json[]).filter((a) => a && typeof a === 'object') : [];
  const actions: ToastAction[] = declared.length
    ? declared
        .map((a) => ({
          label: str(a['label']) || (str(a['style']) === 'undo' ? 'Undo' : ''),
          actionId: str(a['actionId']) || null,
          parameters: (a['parameters'] as Json) ?? {},
          route: str(a['route']) || null,
          style: str(a['style']) || null,
        }))
        .filter((a) => a.label && (a.actionId || a.route))
    : undoActionId
      ? [{ label: str(msg['undoLabel']) || 'Undo', actionId: undoActionId, parameters: (msg['undoParameters'] as Json) ?? {}, route: null, style: 'undo' }]
      : [];
  const undoAction = actions.find((a) => a.style === 'undo' && a.actionId);
  const wirePersistence = str(msg['persistence']);
  const persistence: 'toast' | 'sticky' | 'inbox' =
    wirePersistence === 'sticky' || wirePersistence === 'inbox' || wirePersistence === 'toast'
      ? wirePersistence
      // an older server: an error, or a duration of 0, stays
      : variant === 'error' ? 'sticky' : 'toast';
  return {
    title: str(msg['title']) || null,
    text,
    variant,
    duration: duration > 0 ? duration : undefined,
    undo: undoAction ? { label: undoAction.label, actionId: undoAction.actionId!, parameters: undoAction.parameters } : undefined,
    actions,
    persistence,
    key: str(msg['key']) || null,
  };
}

/** An action of a message: `route` navigates, else `actionId` runs on the screen that got it. */
export interface ToastAction {
  label: string;
  actionId: string | null;
  parameters: Json;
  route: string | null;
  style: string | null;
}

/**
 * What a fragment carrying a FLOATING component does. On the web a returned Notification, Dialog,
 * ConfirmDialog or Drawer floats above the component that returned it (a vaadin-notification /
 * dialog element opens over the page): the island keeps its own content. Drawn in place here, it
 * REPLACED the island's content (the Notify button vanished; a ConfirmDialog took the buttons' place
 * and never went). So: a Notification is a toast, the others open as overlays — Add fragments of a
 * Drawer/Dialog always did; any fragment does when something is already on screen.
 */
export function floatingIntentOf(fragmentAction: string, component: Json | null | undefined, hasContent: boolean): 'toast' | 'overlay' | null {
  if (!component || component['type'] === 'ServerSide') return null;
  const type = str((component['metadata'] as Json)?.['type']);
  const add = fragmentAction.toLowerCase() === 'add';
  if (type === 'Notification') return add || hasContent ? 'toast' : null;
  if (type === 'Drawer' || type === 'Dialog' || type === 'ConfirmDialog') return add || hasContent ? 'overlay' : null;
  return null;
}

/** A Notification component as a toast. */
export function notificationToastOf(metadata: Json): { title: string | null; text: string; variant: 'info' | 'warning' | 'error'; duration: number | undefined } {
  const theme = str(metadata['theme'] ?? metadata['variant']).toLowerCase();
  const variant: 'info' | 'warning' | 'error' = /error|danger/.test(theme) ? 'error' : /warning/.test(theme) ? 'warning' : 'info';
  const title = str(metadata['title']);
  const text = str(metadata['text']) || str(metadata['message']) || title;
  const duration = Number(metadata['duration']) || undefined;
  return { title: title && text !== title ? title : null, text, variant, duration };
}
