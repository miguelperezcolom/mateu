import { interpolate } from './expressions.ts';

type Dict = Record<string, unknown>;

/**
 * A Button carrying a `route` NAVIGATES (the button form of a menu link) instead of running its
 * action — the same contract as the web's buttonRenderer and Redwood's buttonRouteOf.
 *
 * The route is a template (`/p/${state.id}`): every `${…}` must resolve to a non-blank value, or
 * the route is NOT resolved — `/p/` with the id missing is somewhere nobody declared. Then the
 * button is drawn disabled and a press does nothing (no navigation, no fall-through to an action).
 */
export type ButtonPress =
  | { kind: 'route'; route: string }
  | { kind: 'unresolvedRoute'; template: string }
  | { kind: 'action' };

/** The button's route resolved against state/data; undefined when it has none or it is unresolved. */
export function resolvedButtonRoute(template: unknown, ctx: { state?: unknown; data?: unknown }): string | undefined {
  if (typeof template !== 'string' || !template) return undefined;
  const scope: Dict = { state: ctx.state ?? {}, data: ctx.data ?? {} };
  for (const expression of template.match(/\$\{[^}]*\}/g) ?? []) {
    const value = interpolate(expression, scope);
    if (!value || !value.trim() || value.includes('${')) return undefined;
  }
  const route = interpolate(template, scope);
  return !route || route.includes('${') ? undefined : route;
}

/** What pressing the button does. */
export function buttonPressOf(metadata: Dict, ctx: { state?: unknown; data?: unknown }): ButtonPress {
  const template = metadata['route'];
  if (typeof template !== 'string' || !template) return { kind: 'action' };
  const route = resolvedButtonRoute(template, ctx);
  return route ? { kind: 'route', route } : { kind: 'unresolvedRoute', template };
}

const warned = new Set<string>();
/** Warned once per template: the button stays disabled until the value is in the state. */
export function warnUnresolvedButtonRoute(template: string): void {
  if (warned.has(template)) return;
  warned.add(template);
  console.warn(`Mateu: the button route "${template}" has a value missing in the state; the button stays disabled until it is there.`);
}
