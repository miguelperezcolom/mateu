/**
 * App-shell FLOWS (`actions:` with `steps:` on a `type: AppShell`, or `AppShell.actions` in code).
 * The wire App carries every declared action with its steps already lowered to `commands`; a menu
 * leaf whose `RunAction` rule names one runs those commands HERE, with no server round-trip. An id
 * the shell does not declare (or declares without steps) keeps the app-level server dispatch — the
 * same path as an app FAB.
 *
 * Pure: it only decides WHAT to do (a list of effects); AppRenderer performs them. Mirrors the web's
 * libs/mateu shellFlows.ts.
 */

type Json = Record<string, unknown>;

export interface ShellAction {
  id?: string;
  commands?: { type?: string; data?: unknown }[] | null;
}

export interface FlowMenuItem {
  rules?: { action?: string; actionId?: string | null }[] | null;
}

export type ShellEffect =
  /** In-app navigation to a mount-relative route, like a menu route click. */
  | { kind: 'navigate'; route: string }
  /** A URL (scheme or //host): leaves the app. */
  | { kind: 'url'; url: string }
  /** Dispatch an app-level action to the server (today's behaviour of a menu RunAction rule). */
  | { kind: 'runAction'; actionId: string }
  /** Emit a named event on the app event bus. */
  | { kind: 'event'; eventName: string; payload: unknown }
  /** Close the top overlay (optionally emitting the event it carries). */
  | { kind: 'closeOverlay'; eventName?: string; payload?: unknown };

/** The RunAction rule ids of a menu leaf, in order; empty for a navigating leaf. */
export function menuRuleActionIds(item: FlowMenuItem | null | undefined): string[] {
  const rules = item?.rules;
  if (!Array.isArray(rules)) return [];
  return rules
    .filter((r) => r && r.action === 'RunAction' && typeof r.actionId === 'string' && r.actionId)
    .map((r) => r.actionId as string);
}

/** Whether the leaf RUNS something instead of navigating. */
export function isRuleLeaf(item: FlowMenuItem | null | undefined): boolean {
  return Array.isArray(item?.rules) && (item!.rules as unknown[]).length > 0;
}

/** The lowered commands of a declared shell flow, or undefined when the shell declares none. */
export function shellFlowFor(actions: ShellAction[] | null | undefined, actionId: string): ShellAction['commands'] | undefined {
  if (!Array.isArray(actions)) return undefined;
  const action = actions.find((a) => a && a.id === actionId);
  return action?.commands && action.commands.length ? action.commands : undefined;
}

/** A Navigate destination that is a route of the app (no scheme, no host), without leading slash. */
export function inAppRoute(destination: unknown): string | undefined {
  if (typeof destination !== 'string') return undefined;
  const d = destination.trim();
  if (d.startsWith('//')) return undefined;
  if (/^[a-z][a-z0-9+.-]*:/i.test(d)) return undefined;
  return d.replace(/^\/+/, '');
}

function eventOf(data: unknown): { eventName?: string; payload?: unknown } {
  if (!data || typeof data !== 'object') return {};
  const d = data as Json;
  const eventName = typeof d['eventName'] === 'string' ? (d['eventName'] as string) : undefined;
  return { eventName, payload: d['payload'] ?? d['detail'] ?? null };
}

/** What clicking a rule leaf does, given the shell's declared actions. */
export function menuLeafEffects(item: FlowMenuItem, actions: ShellAction[] | null | undefined): ShellEffect[] {
  const effects: ShellEffect[] = [];
  for (const actionId of menuRuleActionIds(item)) {
    const commands = shellFlowFor(actions, actionId);
    if (!commands) {
      effects.push({ kind: 'runAction', actionId });
      continue;
    }
    for (const command of commands) {
      switch (command?.type) {
        case 'NavigateTo': {
          const route = inAppRoute(command.data);
          if (route !== undefined) effects.push({ kind: 'navigate', route });
          else if (typeof command.data === 'string' && command.data) effects.push({ kind: 'url', url: command.data });
          break;
        }
        case 'RunAction': {
          const id = (command.data as Json | null)?.['actionId'];
          if (typeof id === 'string' && id) effects.push({ kind: 'runAction', actionId: id });
          break;
        }
        case 'DispatchEvent': {
          const { eventName, payload } = eventOf(command.data);
          if (eventName) effects.push({ kind: 'event', eventName, payload });
          break;
        }
        case 'CloseModal': {
          const { eventName, payload } = eventOf(command.data);
          effects.push(eventName ? { kind: 'closeOverlay', eventName, payload } : { kind: 'closeOverlay' });
          break;
        }
        // MarkAsClean / MarkAsDirty: the dirty flag lives on each screen's controller; the
        // shell's navigation remounts the screen, so at app scope there is nothing to mark.
        default:
          break;
      }
    }
  }
  return effects;
}
