/**
 * The agent chat panel's width. It sits on the content's start, beside the page: wide enough for a
 * conversation with tool steps and tables by default, resizable by dragging its edge, and the width
 * a user chose is remembered in this browser. ⤢ is a wide mode (about 60% of the viewport) on top of
 * that; on a phone the panel always covers the content.
 */
export const CHAT_WIDTH = { default: 460, min: 320, max: 720 } as const

/** How much of the viewport the wide mode (⤢) takes. */
export const CHAT_WIDE_VW = 60

/** The localStorage key of the width a user chose. */
export const CHAT_WIDTH_KEY = 'mateu-chat-width'

/** A width within the panel's bounds, rounded to whole pixels; anything unusable is the default. */
export const clampChatWidth = (px: number | undefined | null): number => {
    if (px == null || !Number.isFinite(px)) return CHAT_WIDTH.default
    return Math.round(Math.min(CHAT_WIDTH.max, Math.max(CHAT_WIDTH.min, px)))
}

type WidthStore = Pick<Storage, 'getItem' | 'setItem'> | undefined

const defaultStore = (): WidthStore => {
    try {
        return typeof localStorage === 'undefined' ? undefined : localStorage
    } catch {
        return undefined // storage blocked (privacy mode, sandboxed iframe): no memory, no failure
    }
}

/** The width this user chose before, or the default. Never throws. */
export const loadChatWidth = (store: WidthStore = defaultStore()): number => {
    try {
        const raw = store?.getItem(CHAT_WIDTH_KEY)
        return raw ? clampChatWidth(Number(raw)) : CHAT_WIDTH.default
    } catch {
        return CHAT_WIDTH.default
    }
}

/** Remembers the width (clamped). Never throws: a full or blocked storage just forgets. */
export const saveChatWidth = (px: number, store: WidthStore = defaultStore()): number => {
    const width = clampChatWidth(px)
    try {
        store?.setItem(CHAT_WIDTH_KEY, String(width))
    } catch {
        // nothing to do: the width still applies to this page
    }
    return width
}

/**
 * The width while the panel's edge is dragged. The panel is on the content's START, so its edge is
 * its end side: dragging it towards the end widens it — rightwards in LTR, leftwards in RTL.
 */
export const dragChatWidth = (startWidth: number, startX: number, x: number, rtl = false): number =>
    clampChatWidth(startWidth + (rtl ? startX - x : x - startX))

/** One keyboard step on the edge (←/→), in pixels; Home/End go to the bounds. */
export const CHAT_WIDTH_STEP = 24
