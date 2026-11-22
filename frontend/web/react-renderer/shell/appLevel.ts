import type { MateuSession } from '@rn/core/MateuSession'
import type { MateuViewController } from '@rn/core/MateuViewController'
import { toastOf } from '@rn/core/componentContext'
import { describeFailure } from '@rn/core/requestPolicy'
import { connectivity } from '@rn/core/connectivity'

type Dict = Record<string, unknown>

/** What an app-level action needs to know of the App shell (AppDto). */
export interface AppTarget {
  serverSideType?: string
  rootRoute?: string
  homeRoute?: string
}

export const appTargetOf = (app: Dict): AppTarget => ({
  serverSideType: typeof app['serverSideType'] === 'string' ? app['serverSideType'] : undefined,
  rootRoute: typeof app['rootRoute'] === 'string' ? app['rootRoute'] : undefined,
  homeRoute: typeof app['homeRoute'] === 'string' ? app['homeRoute'] : undefined,
})

/**
 * An APP-LEVEL action (context search, inbox, header actions): sent against the app class at its
 * root route — the rail every renderer uses (RN runAppLevelIncrement, web dispatchAppHeaderAction).
 */
export function runAppLevel(
  session: MateuSession, app: AppTarget, actionId: string, parameters: Dict = {}, initiatorComponentId = 'ux_main',
): Promise<unknown> {
  const route = app.rootRoute ?? app.homeRoute ?? ''
  return session.api.runAction({
    route,
    consumedRoute: route || '_empty',
    actionId,
    serverSideType: app.serverSideType ?? null,
    initiatorComponentId,
    componentState: {},
    appState: session.appState,
    parameters,
  })
}

/** The data a key of an app-level answer carries (`_notifications`, `_appcontext_<field>`…). */
export function answerData(increment: unknown, key: string): unknown {
  for (const fragment of ((increment as { fragments?: { data?: Dict }[] } | null)?.fragments ?? [])) {
    const value = fragment?.data?.[key]
    if (value !== undefined) return value
  }
  return undefined
}

// ---- the content view on screen ----------------------------------------------------------------

const content = new WeakMap<MateuSession, MateuViewController>()

/** The top-level content view registers itself (ViewHost): an app-level answer applies to it. */
export function setContentController(session: MateuSession, controller: MateuViewController | null): void {
  if (controller) content.set(session, controller)
  else content.delete(session)
}

export function contentControllerOf(session: MateuSession): MateuViewController | undefined {
  return content.get(session)
}

/**
 * The answer of an app action, applied like the web's: on the screen on view (messages, commands,
 * a Drawer / Dialog it opens); without one, its messages become toasts. An App fragment (the shell
 * answering for itself) never replaces the screen.
 */
export function applyAppAnswer(session: MateuSession, increment: unknown): void {
  const inc = (increment ?? {}) as Dict
  const fragments = ((inc['fragments'] as Dict[] | undefined) ?? []).filter((f) => {
    const type = ((f?.['component'] as Dict | undefined)?.['metadata'] as Dict | undefined)?.['type']
    return type !== 'App'
  })
  const controller = contentControllerOf(session)
  if (controller) {
    controller.applyIncrement({ ...inc, fragments } as never)
    return
  }
  for (const message of (inc['messages'] as Dict[] | undefined) ?? []) {
    const toast = toastOf(message as never)
    if (toast) session.notify(toast.title, toast.text, toast.variant, { duration: toast.duration })
  }
}

/** Runs an app action and applies its answer; a failure is a toast. */
export async function runAndApply(session: MateuSession, app: AppTarget, actionId: string, parameters: Dict = {}): Promise<void> {
  try {
    applyAppAnswer(session, await runAppLevel(session, app, actionId, parameters))
  } catch (e) {
    session.notify(null, describeFailure(e, connectivity.isOnline), 'error')
  }
}

// ---- @AppContext persistence (the web renderer's keys) -----------------------------------------

export const APP_CONTEXT_KEY = 'mateu-app-context'
export const APP_CONTEXT_LABELS_KEY = 'mateu-app-context-labels'

function readJson(key: string): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, string> : {}
  } catch {
    return {}
  }
}

function writeJson(key: string, value: Record<string, string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable (private mode): the choice lasts this page only
  }
}

/** The context the user fixed (`{hotel: "3"}`): the appState every request of the session starts with. */
export function storedAppContext(): Record<string, unknown> {
  const stored = readJson(APP_CONTEXT_KEY)
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(stored)) if (v !== '' && v != null) out[k] = v
  return out
}

export const storedContextLabel = (field: string): string | undefined => readJson(APP_CONTEXT_LABELS_KEY)[field]

/** A new context value: stored for every tab of the origin; blank clears it. */
export function saveAppContext(field: string, value: string, label?: string): void {
  const values = readJson(APP_CONTEXT_KEY)
  const labels = readJson(APP_CONTEXT_LABELS_KEY)
  if (value === '') {
    delete values[field]
    delete labels[field]
  } else {
    values[field] = value
    if (label) labels[field] = label
  }
  writeJson(APP_CONTEXT_KEY, values)
  writeJson(APP_CONTEXT_LABELS_KEY, labels)
}
