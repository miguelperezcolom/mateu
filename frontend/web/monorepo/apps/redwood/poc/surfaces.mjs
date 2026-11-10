// The SURFACE a painted node belongs to.
//
// An inline island (a Java `java:` example embedded in a page: a ServerSide nested in the host's
// tree) and a MicroFrontend are surfaces of their own: their atoms are painted among the host's,
// but whatever they send — a button, a calendar's day, a map marker, a matrix cell, a typed value,
// a shortcut — must go to THEIR class (their context in the registry), or the server answers 403
// for the host's.
//
// The projection tags each atom of a surface with its `surfaceId` (tagSurfaceActions, core/display),
// and make-html stamps it on every atom's ROOT element as `data-mateu-surface-id`. So any DOM-level
// piece (a sink fired from a click/drag/keydown, a field's change listener) finds the surface by
// walking up from the node that fired — with no per-atom code: a new atom gets it for free.

export const SURFACE_ATTR = 'data-mateu-surface-id'

/** The surface id of the nearest painted ancestor that carries one ('' = the host's), crossing
 *  shadow roots (a JET element's inner node reports its host). */
export function surfaceOfNode(node) {
  let el = node && node.nodeType === 1 ? node : (node && node.parentElement) || null
  let guard = 0
  while (el && guard++ < 500) {
    const v = el.getAttribute ? el.getAttribute(SURFACE_ATTR) : null
    if (v) return v
    if (el.parentElement) { el = el.parentElement; continue }
    const root = el.getRootNode ? el.getRootNode() : null
    el = root && root.host && root.host !== el ? root.host : null
  }
  return ''
}

/** The third argument of a page-action sink for something fired from `node`: the atom's own
 *  routing ({surfaceId, fromNested}) when the caller has it, else the surface the node sits in. */
export function surfaceAtomOf(node, atom) {
  const own = atom && typeof atom === 'object' ? atom : {}
  if (own.surfaceId) return own
  const surfaceId = surfaceOfNode(node)
  // painted among the host's own atoms: the caller's routing as it was
  return surfaceId ? { ...own, surfaceId } : own
}

/** The surface an event was fired in (its composed path's first element). */
export function surfaceOfEvent(event) {
  if (!event) return ''
  // VB hands a chain a COPY of the event: its composedPath is then an unbound method (Illegal
  // invocation) — the target it carries is the real node
  let first = null
  try { first = typeof event.composedPath === 'function' ? event.composedPath()[0] : null } catch (e) { first = null }
  return surfaceOfNode(first || event.target || event.currentTarget || null)
}
