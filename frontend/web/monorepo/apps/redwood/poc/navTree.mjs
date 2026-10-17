import { chromeText } from './i18n.mjs'
// The navigation tree: the rules of libs/mateu/.../navTree.ts this renderer needs,
// PORTED (not shared): the bridge is built by concatenating these .mjs (make-amd.mjs) and cannot
// import TypeScript. Same rules, same cases in test.mjs; if one changes, both change.
//
// A remote section arrives as a placeholder (`remote: true`, no children) until its pod answers. What
// the shell knows about it beforehand —its label and the prefix its screens live under— is enough
// for the active section and the first breadcrumb.

const navRoute = (r) => {
  let s = String(r == null ? '' : r).trim()
  const q = s.search(/[?#]/)
  if (q >= 0) s = s.slice(0, q)
  if (s && s[0] !== '/') s = '/' + s
  while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

/** `path` is `route` or hangs from it. The root does not match by prefix. */
export function routeCovers(route, path) {
  return !!route && route !== '/' && (path === route || path.indexOf(route + '/') === 0)
}

/** A remote section that has not answered yet (or that did not answer). */
export function isMount(option) {
  return !!(option && option.remote)
}

/** The prefix of a remote section: the one the server sends (`routePrefix`) or, otherwise, its path (or its route). */
export function mountPrefix(option) {
  return isMount(option) ? navRoute(option.routePrefix || option.path || option.route) : ''
}

/** Why a section is disabled, in the UI's language. */
export function unavailableHint(label, lang) {
  const language = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || ''
  // Strip markup until nothing is left, then any stray angle bracket (as navTree.ts does): one pass of
  // the tag pattern can leave a tag behind (CodeQL js/incomplete-multi-character-sanitization).
  let name = String(label == null ? '' : label)
  for (let before = ''; before !== name;) {
    before = name
    name = name.replace(/<[^<>]*>/g, '')
  }
  name = name.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
  return chromeText('unavailableMount', { name }, language || 'en')
}

/**
 * What the pod answered, with the shell's label if it DECLARED one (`shellLabel`) and the pod answers
 * with ONE entry —the usual: a group named after the service—: the shell's word wins, and
 * the bar does not change under the reader. Several entries are spliced in as they are: there is no node to name.
 */
export function labelledByShell(entries, option) {
  if (option.shellLabel && option.label && entries.length === 1) {
    return [Object.assign({}, entries[0], { label: option.label, icon: option.icon || entries[0].icon })]
  }
  return entries
}

/**
 * HAMBURGER_SECTIONS: what a pod mounted at the first level answers is ONE section. A group
 * already is one; several entries, or a single screen, become the entries of a section with the
 * label (and the path) the shell gave the mount —splicing them would make each of the pod's screens a
 * section, and the subheader would have nothing to show—. Port of mergeRemoteMenus from navTree.ts.
 */
export function asSection(entries, option) {
  const list = entries || []
  const oneGroup = list.length === 1 && ((list[0].submenus || list[0].submenu || []).length > 0)
  if (oneGroup || !list.length) return list
  return [{ label: option.label, icon: option.icon, path: option.path, route: '', visible: option.visible, submenus: list }]
}

/** The entries of a hidden section: they are not painted at any depth, but stay in the tree. */
export function markHidden(entries) {
  return entries.map((option) => {
    const children = option.submenus || option.submenu || []
    return Object.assign({}, option, { visible: false }, children.length ? { submenus: markHidden(children) } : {})
  })
}

/** The section of a pod that did not answer: it stays there, disabled and saying why. */
export function unavailableMount(option, lang) {
  return Object.assign({}, option, { unavailable: true, disabled: true, description: unavailableHint(option.label, lang) })
}

/**
 * The routes of a first-level section: those of its entries at any depth (hidden ones
 * included: a screen under one still belongs to that section), the prefix of a remote section
 * that has not answered yet and the ids the already projected menu navigates with (`node`, from shellNavOf).
 */
export function sectionRoutes(option, node) {
  const out = new Set()
  const add = (r) => {
    const s = navRoute(r)
    if (s && s !== '/') out.add(s)
  }
  const walkOption = (o) => {
    if (!o || o.separator) return
    if (isMount(o)) add(mountPrefix(o))
    add(o.route || o.path)
    for (const child of o.submenus || o.submenu || []) walkOption(child)
  }
  const walkNode = (n) => {
    if (!n) return
    add(n.id)
    for (const child of n.children || []) walkNode(child)
  }
  walkOption(option)
  walkNode(node)
  return Array.from(out)
}

/**
 * The first-level section on screen (the same rule as the web renderer's activeSection.ts:
 * the entry that is the route, or the group containing it at any depth):
 * its id, or null if the route hangs from none — the home, e.g. The longest route wins: a
 * section does not take another's screens because its prefix is shorter.
 */
function nodeRoutes(node, out = []) {
  if (!node) return out
  const route = navRoute(node.id)
  if (route && route !== '/') out.push(route)
  for (const child of node.children || []) nodeRoutes(child, out)
  return out
}

export function activeSectionOf(sections, current) {
  const path = navRoute(current)
  if (!path || path === '/') return null
  let best = null
  let length = 0
  for (const section of sections || []) {
    // a first-level section carries its routes (sectionRoutes); a second-level item
    // (HAMBURGER_SECTIONS) does not: the ids of whatever hangs from it count
    for (const route of section.routes || nodeRoutes(section)) {
      if (routeCovers(route, path) && route.length > length) {
        best = section.id
        length = route.length
      }
    }
  }
  return best
}


/*
 * HAMBURGER_SECTIONS (Opera Cloud style): the first level of the menu are the SECTIONS, in the
 * hamburger; the subheader carries the second level of the section on screen (a group, as a
 * dropdown: the third level). Port of activeSection/sectionHome from navTree.ts, over the nodes already
 * projected by shellNavOf (id, children, disabled; hidden ones are already gone).
 */

/**
 * Where choosing a section leads: the section itself if it is a screen, otherwise its first entry
 * that can be opened, depth-first —the section's home, as in Opera—. null if there is nothing
 * to open (a remote section that did not answer).
 */
export function sectionHomeOf(node) {
  if (!node || node.disabled) return null
  const children = node.children || []
  if (!children.length) return node.id || null
  for (const child of children) {
    const home = sectionHomeOf(child)
    if (home) return home
  }
  return null
}

/** The node of the section on screen (activeSectionOf), or null —the home, e.g.—. */
export function sectionOf(sections, current) {
  const id = activeSectionOf(sections, current)
  return id == null ? null : ((sections || []).find((section) => section.id === id) || null)
}

/** The server's sentinel routes meaning «no home declared»: the shell then opens
 *  the first screen of the menu (depth-first), like a section's home. */
export function isSentinelHome(route) {
  const r = String(route || '')
  return !r || /(^|\/)_no_home_route$/.test(r) || /(^|\/)_page$/.test(r)
}

/**
 * The LOCAL (not remote) menu option covering a route —the one with the longest prefix, by segments—,
 * or null. A menu route (`/inventory/floorPlan`) belongs to the APP: the server only resolves it if the
 * request carries the serverSideType of the app declaring that menu; without it it answers «Not found.»
 * (in demo-vb it went unnoticed because each @Menu was named like its class's @UI route).
 */
export function localMenuOptionOf(menu, route) {
  const path = String(route || '').split('?')[0]
  if (!path) return null
  let best = null
  const visit = (options) => {
    for (const o of options || []) {
      if (!o || o.remote || o.baseUrl) continue
      const r = o.route || o.path
      if (r && routeCovers(r, path) && (!best || r.length > (best.route || best.path).length)) best = o
      visit(o.submenus || o.submenu)
    }
  }
  visit(menu)
  return best
}
