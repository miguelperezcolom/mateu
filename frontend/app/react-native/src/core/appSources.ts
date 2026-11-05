/**
 * The REST sources a data-authored app shell (`type: AppShell`) feeds its header from — the twins of
 * an app class's suppliers: the inbox (`notifications:`), the entity search (`globalSearch:`) and the
 * context pickers' options (`optionsSource:`). The same rules as libs/mateu appSources.ts: a direct
 * source is fetched by the app, a proxied one goes through the server's `_appsource` action (the app
 * names the role, never a url), and each field is read through the source's `fields` map.
 */
import { fetchExternalJson, getByPath, mapItemsToOptions, type FetchedOption, type RestSourceCatalogue } from './restFetch.ts';
import { interpolate, interpolateUrl } from './expressions.ts';

type Json = Record<string, unknown>;

export type AppSourceRole = 'notifications' | 'notificationsRead' | 'globalSearch' | 'contextOptions';

export interface AppSourceHost {
  api: { runAction: (rq: Json) => Promise<unknown> };
  sources: RestSourceCatalogue;
  appState: Json;
  rootRoute?: string;
  serverSideType?: string | null;
}

export async function runAppSource(host: AppSourceHost, role: AppSourceRole, source: Json, vars: Json, field?: string): Promise<unknown> {
  if (host.sources.viaProxy(source)) {
    const route = host.rootRoute ?? '';
    const increment = (await host.api.runAction({
      route,
      consumedRoute: route || '_empty',
      actionId: '_appsource',
      serverSideType: host.serverSideType ?? null,
      initiatorComponentId: 'app-source',
      componentState: {},
      appState: host.appState,
      parameters: { ...vars, _appSource: role, ...(field ? { _field: field } : {}) },
    })) as { appData?: Json } | undefined;
    const appData = increment?.appData ?? {};
    const error = appData['_restfetchError'] as { message?: string } | undefined;
    if (error) throw new Error(error.message ?? 'Request failed');
    return appData['_restfetch'];
  }
  const ctx = { state: vars, appState: host.appState };
  return fetchExternalJson(source, (t) => interpolate(String(t ?? ''), ctx), (t) => interpolateUrl(String(t ?? ''), ctx), host.sources);
}

function itemsOf(json: unknown, source: Json, sources: RestSourceCatalogue): Json[] {
  const itemsPath = sources.resolve(source)['itemsPath'] as string | undefined;
  const items = itemsPath ? getByPath(json, itemsPath) : json;
  return Array.isArray(items) ? (items.filter((i) => i != null && typeof i === 'object') as Json[]) : [];
}

const text = (v: unknown): string | null => (v == null || v === '' ? null : String(v));

export interface SourcedNotification {
  id: string;
  title: string;
  text: string | null;
  route: string | null;
  unread: boolean;
  when: string | null;
}

/** A source's response → inbox entries. A missing `unread` counts as unread. */
export function notificationsOf(json: unknown, source: Json, sources: RestSourceCatalogue): SourcedNotification[] {
  const at = (item: Json, field: string) => getByPath(item, sources.pathOfField(source, field));
  return itemsOf(json, source, sources).map((item) => {
    const unread = at(item, 'unread');
    return {
      id: String(at(item, 'id') ?? ''),
      title: String(at(item, 'title') ?? ''),
      text: text(at(item, 'text')),
      route: text(at(item, 'route')),
      unread: unread == null ? true : unread === true || unread === 'true',
      when: text(at(item, 'when')),
    };
  });
}

export interface SourcedSearchHit {
  label: string;
  description: string | null;
  route: string;
  category: string | null;
}

/** A source's response → search hits; a hit with nowhere to go is dropped. */
export function searchHitsOf(json: unknown, source: Json, sources: RestSourceCatalogue): SourcedSearchHit[] {
  const at = (item: Json, field: string) => getByPath(item, sources.pathOfField(source, field));
  return itemsOf(json, source, sources)
    .map((item) => ({
      label: String(at(item, 'label') ?? ''),
      description: text(at(item, 'description')),
      route: String(at(item, 'route') ?? ''),
      category: text(at(item, 'category')),
    }))
    .filter((hit) => hit.route !== '');
}

/** A source's response → picker options, through its itemsPath/valuePath/labelPath. */
export function contextOptionsOf(json: unknown, source: Json, sources: RestSourceCatalogue): FetchedOption[] {
  const resolved = sources.resolve(source) as { itemsPath?: string; valuePath?: string; labelPath?: string };
  return mapItemsToOptions(json, resolved.itemsPath, resolved.valuePath || 'value', resolved.labelPath || 'label');
}

/** The variables of a "mark as read": every id comma-joined, the first one, and whether it is "all". */
export function markReadVars(ids: string[], all: boolean): Json {
  return { ids: ids.join(','), id: ids[0] ?? '', all };
}
