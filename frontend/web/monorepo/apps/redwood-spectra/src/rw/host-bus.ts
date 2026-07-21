import { mateuApiClient } from '@infra/http/AxiosMateuApiClient'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'
import type UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import type UICommand from '@mateu/shared/apiClients/dtos/UICommand'
import { showToast } from '@/rw/toast'

/**
 * The clean-room replacement for the shared rxjs `upstream` bus + HttpService.handleUIIncrement.
 *
 * Every stateful host (<rw-root>/<rw-host>) registers itself by wire id. An increment's fragments
 * and commands are addressed by `targetComponentId`; we route each straight to the matching host —
 * no rxjs, no broadcast. The app-wide state/data bags ride along on every request (like the shared
 * client does for @AppContext).
 */

export interface IncrementSink {
  applyFragment(fragment: UIFragment): void
  applyCommand(command: UICommand): void
}

const hosts = new Map<string, IncrementSink>()

export function registerHost(id: string | undefined, host: IncrementSink): void {
  if (id) hosts.set(id, host)
}
export function unregisterHost(id: string | undefined, host: IncrementSink): void {
  if (id && hosts.get(id) === host) hosts.delete(id)
}

/** The root receives any fragment/command whose targetComponentId matches no live host — notably
 *  the initial load's routed component, whose id is minted server-side. */
let rootSink: IncrementSink | undefined
export function setRootSink(sink: IncrementSink | undefined): void {
  rootSink = sink
}
function sinkFor(targetComponentId: string | undefined): IncrementSink | undefined {
  const byId = targetComponentId ? hosts.get(targetComponentId) : undefined
  return byId ?? rootSink
}

/** App-wide bags (@AppContext selectors etc.) merged into every request. */
export const appBags: { state: Record<string, unknown>; data: Record<string, unknown> } = {
  state: {},
  data: {},
}

/** Apply an increment: fragments first, then app bags, then toasts, then commands (the order the
 *  shared HttpService uses). */
export function applyIncrement(increment: UIIncrement | undefined): void {
  increment?.fragments?.forEach((f) => sinkFor(f.targetComponentId)?.applyFragment(f))
  if (increment?.appState) appBags.state = { ...increment.appState }
  if (increment?.appData) appBags.data = { ...increment.appData }
  increment?.messages?.forEach((m) => showToast(m))
  increment?.commands?.forEach((c) => sinkFor(c.targetComponentId)?.applyCommand(c))
}

export interface RunActionParams {
  baseUrl: string
  route: string
  consumedRoute: string
  actionId: string
  initiatorComponentId: string
  serverSideType: string | undefined
  componentState: Record<string, unknown> | undefined
  parameters: Record<string, unknown> | undefined
  initiator: HTMLElement
}

/** Call the (Vaadin-free) protocol client and apply the resulting increment. */
export async function runActionAndApply(p: RunActionParams): Promise<void> {
  const increment = await mateuApiClient.runAction(
    p.baseUrl,
    p.route,
    // Omit an empty consumedRoute: sending "" alongside route "" makes the server fail route
    // resolution ("Not found."). We don't use consumed routes in the single-app model.
    (p.consumedRoute || undefined) as unknown as string,
    p.actionId,
    p.initiatorComponentId,
    appBags.state,
    p.serverSideType,
    p.componentState,
    p.parameters,
    p.initiator,
    false,
  )
  applyIncrement(increment)
}
