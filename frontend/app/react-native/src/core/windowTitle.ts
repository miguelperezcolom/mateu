import { interpolate } from './expressions.ts';

/**
 * The screen's title once a YAML record page's data is in — the React Native twin of libs/mateu
 * `infra/ui/windowTitle.ts`.
 *
 * The server names the window (SetWindowTitle) while it builds the screen. A record page defined in
 * YAML (`title: ${state.name}`, its record loaded by the route's `data:` source) is named before its
 * record exists, so the server can only fall back to the route ("28"); the page header then shows
 * "Voyager 1" while the title bar kept saying "28". The title FOLLOWS the routed page's own title
 * template once it resolves. Re-titling is silent: SetWindowTitle already announced the screen.
 */

type Json = Record<string, unknown>;

const PAGE_TYPES = new Set(['Form', 'Page']);

/** The routed page's title template: the first Form/Page title that is a template, depth-first. */
export function pageTitleTemplate(component: unknown, depth = 0): string | undefined {
  if (!component || typeof component !== 'object' || depth > 4) return undefined;
  const node = component as Json;
  const md = (node['metadata'] as Json | undefined) ?? undefined;
  const title = md?.['title'];
  if (md && PAGE_TYPES.has(String(md['type'])) && typeof title === 'string' && title.includes('${')) return title;
  for (const child of (node['children'] as unknown[] | undefined) ?? []) {
    const found = pageTitleTemplate(child, depth + 1);
    if (found) return found;
  }
  return undefined;
}

/** The page's title resolved against its state and data, or undefined while anything is unresolved. */
export function resolvedPageTitle(component: unknown, state: Json, data: unknown): string | undefined {
  const template = pageTitleTemplate(component);
  if (!template) return undefined;
  let title: string;
  try {
    title = interpolate(template, { state, data }).trim();
  } catch {
    return undefined;
  }
  return title && !title.includes('${') ? title : undefined;
}
