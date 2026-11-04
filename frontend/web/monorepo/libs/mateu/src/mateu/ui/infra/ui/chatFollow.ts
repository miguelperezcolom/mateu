import { NAVIGATION_REQUESTED, RENDER_SCREEN } from './chatEvents'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

/**
 * Follow mode (the robot "Follow" button in the chat header). On, the view follows the assistant: a navigation or a
 * generated screen it streams is applied as it arrives. Off, the user stays where they are: those
 * events are kept on the answer as "deferred actions" — buttons the user clicks when they want to
 * see them. Every other agent event (a page's own `@SubscribeTo` event, close-requested) does not
 * move the view and applies in either mode.
 */

/** An agent event the panel holds back while follow mode is off, to be applied on a click. */
export interface DeferredAgentAction {
    name: string
    detail: unknown
    label: string
}

/** The agent events that move the view: the ones follow mode holds back. */
export const isViewMovingAgentEvent = (name: string): boolean =>
    name === NAVIGATION_REQUESTED || name === RENDER_SCREEN

/** The button text of a held-back event: "Open /route" for a navigation, else "Show the screen". */
export function deferredActionLabel(name: string, detail: unknown, lang?: string): string {
    if (name === NAVIGATION_REQUESTED) {
        const route = (detail as { route?: unknown } | null)?.route
        return typeof route === 'string' && route.trim()
            ? chromeTextf('chatOpenDeferredRoute', { route: route.trim() }, lang)
            : chromeText('chatOpenDeferredScreen', lang)
    }
    return chromeText('chatShowDeferredScreen', lang)
}

/** A held-back event, ready to sit on an answer. */
export const deferAgentEvent = (name: string, detail: unknown, lang?: string): DeferredAgentAction =>
    ({ name, detail, label: deferredActionLabel(name, detail, lang) })
