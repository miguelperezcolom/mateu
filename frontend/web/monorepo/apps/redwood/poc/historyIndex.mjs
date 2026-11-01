// Where in the session history each entry this app wrote sits, so a back/forward the user then
// refuses ("you have unsaved changes" → stay) can be UNDONE instead of papered over — the Redwood
// twin of libs/mateu infra/ui/historyIndex.ts.
//
// Staying used to PUSH the URL of the screen on display. After a Back that is close enough, but
// after a FORWARD it builds a wrong history: [A, B*, C] → forward to C → stay → [A, B, C, B*] — the
// user is "on B" with C behind them, and the next Back goes to C. Every entry pushed or replaced
// through `history` carries an index (`__mateuIdx`); a popstate moved by `to - from`, and staying is
// `history.go(from - to)`, which lands exactly where the user was and keeps the forward entries.
// The popstate that `go` fires itself is swallowed. Entries this app did not write (or hash mode,
// where hashchange carries no state) have no index: staying falls back to pushing the URL.

const HISTORY_IDX = '__mateuIdx'

let historyInstalledOn
let historyCurrent = { idx: 0, href: '' }
let historySwallow = 0
let historyLastMove = null

const historyIndexOf = (state) => {
  const v = state && typeof state === 'object' ? state[HISTORY_IDX] : undefined
  return typeof v === 'number' ? v : undefined
}

const withHistoryIndex = (state, idx) => ({ ...(state && typeof state === 'object' ? state : {}), [HISTORY_IDX]: idx })

/** Stamps every history entry this window writes from now on. Idempotent. */
export function installHistoryIndex(win = (typeof window !== 'undefined' ? window : undefined)) {
  if (!win || !win.history || historyInstalledOn === win) return
  historyInstalledOn = win
  const h = win.history
  const push = h.pushState.bind(h)
  const replace = h.replaceState.bind(h)
  const existing = historyIndexOf(h.state)
  historyCurrent = { idx: existing ?? 0, href: win.location.href }
  if (existing === undefined) replace(withHistoryIndex(h.state, 0), '')
  h.pushState = (state, unused, url) => {
    const idx = historyCurrent.idx + 1
    push(withHistoryIndex(state, idx), unused, url)
    historyCurrent = { idx, href: win.location.href }
  }
  h.replaceState = (state, unused, url) => {
    replace(withHistoryIndex(state, historyCurrent.idx), unused, url)
    historyCurrent = { idx: historyCurrent.idx, href: win.location.href }
  }
}

/**
 * A popstate happened: remembers where the user came FROM and where they are now, for a
 * {@link restoreUrlAfterStaying} that follows. Returns false when this popstate is the echo of our
 * own `go` (staying) and must be ignored.
 */
export function notePopState(state, win = (typeof window !== 'undefined' ? window : undefined)) {
  const from = historyCurrent
  const to = historyIndexOf(state)
  historyCurrent = { idx: to ?? historyCurrent.idx, href: win ? win.location.href : '' }
  if (historySwallow > 0) {
    historySwallow--
    historyLastMove = null
    return false
  }
  historyLastMove = { from, to }
  return true
}

/** Undo the last back/forward the user refused, when its entries carry indexes: true when done. */
export function undoLastMove(win = (typeof window !== 'undefined' ? window : undefined)) {
  const moved = historyLastMove
  historyLastMove = null
  if (!moved || !win || !win.history || moved.to === undefined || moved.to === moved.from.idx) return false
  historySwallow++
  win.history.go(moved.from.idx - moved.to)
  return true
}

/** Tests only. */
export function resetHistoryIndexForTests() {
  historyInstalledOn = undefined
  historyCurrent = { idx: 0, href: '' }
  historySwallow = 0
  historyLastMove = null
}
