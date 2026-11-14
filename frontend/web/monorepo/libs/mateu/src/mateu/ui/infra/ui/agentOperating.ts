import { announce } from '@infra/a11y/announcer.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'

/**
 * Whether an AI agent is OPERATING this tab right now (live UI push `query` messages: it reads the
 * screen, types into fields, presses buttons) — from its first query until {@link OPERATING_MS}
 * after the last one. While it is, the tab shows a small non-modal notice (mateu-agent-operating)
 * saying so, with Stop: the user always sees that the screen is being driven, and can end it.
 *
 * Stop is the channel's (agentChannel.ts registers it): every pairing removed and the channel
 * closed, until the user connects an agent again.
 */

/** How long the notice stays after the agent's last query. */
export const OPERATING_MS = 120_000

let operating = false
let timer: ReturnType<typeof setTimeout> | undefined
let stopHandler: (() => Promise<void> | void) | undefined
const listeners = new Set<(on: boolean) => void>()

const set = (next: boolean) => {
    if (operating === next) return
    operating = next
    listeners.forEach((l) => { try { l(operating) } catch { /* a listener's bug is its own */ } })
    if (typeof document !== 'undefined') syncNotice()
}

export const agentOperating = (): boolean => operating

/** Listens to the operating state (called at once with the current one); returns the unsubscribe. */
export const subscribeAgentOperating = (listener: (on: boolean) => void): (() => void) => {
    listeners.add(listener)
    listener(operating)
    return () => { listeners.delete(listener) }
}

/** A query arrived: the agent is operating (again), for the next {@link OPERATING_MS}. */
export const noteAgentQuery = () => {
    clearTimeout(timer)
    timer = setTimeout(() => { timer = undefined; set(false) }, OPERATING_MS)
    if (!operating) {
        set(true)
        announce(chromeText('agentOperating'))
    }
}

/** The notice goes (the user stopped the agent). */
export const stopOperating = () => {
    clearTimeout(timer)
    timer = undefined
    set(false)
}

export const setAgentStopHandler = (handler: () => Promise<void> | void) => { stopHandler = handler }

/** What Stop does: the channel's handler, then the confirmation for screen readers. */
export const stopAgent = async () => {
    stopOperating()
    await stopHandler?.()
    announce(chromeText('agentStopped'))
}

// ── the notice: a document-wide singleton, mounted while operating ────────────────────────

let notice: HTMLElement | null = null

const syncNotice = () => {
    if (operating) {
        if (notice?.isConnected) return
        // loaded with the channel's module graph; the element registers itself
        void import('@infra/ui/mateu-agent-operating.ts').then(() => {
            if (!operating || notice?.isConnected) return
            notice = document.createElement('mateu-agent-operating')
            document.body.appendChild(notice)
        }).catch(() => undefined)
    } else if (notice) {
        notice.remove()
        notice = null
    }
}

/** For tests. */
export const resetAgentOperating = () => {
    clearTimeout(timer)
    timer = undefined
    operating = false
    listeners.clear()
    notice?.remove()
    notice = null
}
