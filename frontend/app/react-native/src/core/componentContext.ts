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
}

/** Reads the flags of the wire `actions` list; entries without an id are skipped. */
export function actionFlagsOf(actions: unknown): ActionFlags {
  const flags: ActionFlags = { ids: [], validationRequired: {}, rowsSelectedRequired: {}, confirmation: {}, sse: {}, bubble: {}, restData: {} };
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

/** The validation toast's summary: "field: message; …". */
export const errorSummary = (errors: Record<string, string>): string =>
  Object.entries(errors).map(([f, m]) => `${f}: ${m}`).join('; ');

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
} | null {
  const text = str(msg['text']);
  if (!text) return null;
  const undoActionId = str(msg['undoActionId']);
  const duration = Number(msg['duration']) || 0;
  return {
    title: str(msg['title']) || null,
    text,
    variant: (str(msg['variant']) || 'info') as 'info' | 'warning' | 'error',
    duration: duration > 0 ? duration : undefined,
    undo: undoActionId
      ? { label: str(msg['undoLabel']) || 'Undo', actionId: undoActionId, parameters: (msg['undoParameters'] as Json) ?? {} }
      : undefined,
  };
}
