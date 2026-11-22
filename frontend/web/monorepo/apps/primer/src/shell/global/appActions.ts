import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { toastOf } from '@rn/core/componentContext'

type Dict = Record<string, unknown>

/** The App shell's metadata the global layer reads (AppDto). */
export interface AppMetaLike extends Dict {
  serverSideType?: string | null
  rootRoute?: string | null
  homeRoute?: string | null
}

/** The route an APP-LEVEL action is sent to: the app's root (else its home), as every renderer does. */
export const appRouteOf = (app: AppMetaLike): string => String(app.rootRoute ?? app.homeRoute ?? '')

/**
 * Runs an APP-LEVEL action (a shortcut's actionId, an app FAB, `_keep-alive`, `_globalsearch`…):
 * route = the app's root, serverSideType = the app class — the rail the @AppContext pickers' remote
 * search uses. Returns the raw increment.
 */
export async function runAppLevel(session: MateuSession, app: AppMetaLike, actionId: string, parameters: Dict = {}, initiator = 'mateu-app'): Promise<unknown> {
  const route = appRouteOf(app)
  return session.api.runAction({
    route,
    consumedRoute: route || '_empty',
    actionId,
    serverSideType: (app.serverSideType as string | null) ?? null,
    initiatorComponentId: initiator,
    componentState: {},
    appState: session.appState,
    parameters,
  } as never)
}

/** What an app-level answer does on screen: overlays open, messages toast, a NavigateTo navigates. */
export function applyAppAnswer(session: MateuSession, app: AppMetaLike, increment: unknown, navigate: (t: NavTarget) => void): void {
  const inc = (increment ?? {}) as Dict
  const route = appRouteOf(app)
  for (const fragment of (inc['fragments'] as Dict[] | undefined) ?? []) {
    const component = fragment['component'] as Dict | undefined
    const type = (component?.['metadata'] as Dict | undefined)?.['type']
    if (component && (type === 'Drawer' || type === 'Dialog')) {
      session.openOverlay(component, fragment['state'], fragment['data'], {
        route, consumedRoute: route || '_empty', serverSideType: String(app.serverSideType ?? ''),
      })
    }
  }
  for (const message of (inc['messages'] as Dict[] | undefined) ?? []) {
    const toast = toastOf(message)
    if (toast) session.notify(toast.title, toast.text, toast.variant, { duration: toast.duration, sticky: toast.persistence === 'sticky' || undefined, key: toast.key })
  }
  for (const command of (inc['commands'] as Dict[] | undefined) ?? []) {
    if (command['type'] === 'NavigateTo' && typeof command['data'] === 'string') {
      navigate({ label: '', route: command['data'], consumedRoute: '', serverSideType: '' })
    }
  }
}

/** Runs an app-level action and applies its answer; failures toast. */
export async function runAndApply(session: MateuSession, app: AppMetaLike, actionId: string, navigate: (t: NavTarget) => void, parameters: Dict = {}): Promise<void> {
  if (!actionId) return
  try {
    applyAppAnswer(session, app, await runAppLevel(session, app, actionId, parameters), navigate)
  } catch (e) {
    session.notify(null, e instanceof Error ? e.message : String(e), 'error')
  }
}

/** A route the APP names (a shortcut, a search hit, a recent screen) as a navigation target. */
export const routeTarget = (route: string, label = ''): NavTarget => ({ label, route, consumedRoute: '', serverSideType: '' })
