// The subheader's options that don't fit go into a «More» menu at its end, as the web renderer's
// menu bar does, instead of running past the edge of the window. Measured here, in the page: only
// the browser knows how wide the labels are. The options stay in the template; this hides the ones
// left out, and leaves just those in the template's menu, whose action is the one the group dropdowns use.

/**
 * Which items go into the menu, by index, in order: the last ones first, until the rest and the
 * button fit. A group stays: its dropdown hangs from its own button.
 * @param items [{ width, leaf }]
 */
export function overflowedOf(items, available, moreWidth) {
  const total = items.reduce((sum, item) => sum + item.width, 0)
  if (total <= available) return []
  let used = total + moreWidth
  const out = []
  for (let i = items.length - 1; i >= 0 && used > available; i--) {
    if (!items[i].leaf) continue
    used -= items[i].width
    out.unshift(i)
  }
  return out
}

const HIDDEN = 'mateu-subheader-overflowed'
const ACTIVE = 'mateu-nav-active'

function fit(menu, more) {
  // an open menu's list is moved out of the button by JET: found once, and kept
  more.__mateuList = more.__mateuList || more.querySelector('oj-menu')
  const items = [...menu.children].filter((el) => el !== more && el.classList.contains('mateu-subheader-item'))
  items.forEach((el) => el.classList.remove(HIDDEN))
  if (menu.classList.contains('mateu-phone-folded') || !items.length) {
    more.style.display = 'none'
    return
  }
  more.style.display = ''
  const out = overflowedOf(items.map((el) => ({ width: el.offsetWidth, leaf: el.hasAttribute('data-route') })),
    menu.clientWidth, more.offsetWidth)
  if (!out.length) {
    more.style.display = 'none'
    return
  }
  const hidden = out.map((i) => items[i])
  hidden.forEach((el) => el.classList.add(HIDDEN))
  more.classList.toggle(ACTIVE, hidden.some((el) => el.classList.contains(ACTIVE)))
  const routes = new Set(hidden.map((el) => el.getAttribute('data-route')))
  for (const option of more.__mateuList ? more.__mateuList.querySelectorAll('oj-option') : []) {
    option.style.display = routes.has(option.value) ? '' : 'none'
  }
}

/** Keeps the subheader fitted: when it appears, when its options change and when the window does. */
export function installSubheaderOverflow(doc) {
  if (!doc || doc.__mateuSubheaderOverflow || typeof MutationObserver === 'undefined' || typeof ResizeObserver === 'undefined') return
  doc.__mateuSubheaderOverflow = true
  let watched = null
  let pending = false
  let optionsObserver = null
  let sizeObserver = null
  const WATCH = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-route'] }
  const schedule = () => {
    if (pending || !watched) return
    pending = true
    requestAnimationFrame(() => {
      pending = false
      const more = watched && watched.querySelector('#mateuSubheaderMore')
      if (!more || !watched.isConnected) return
      // what this does to the options isn't a change to answer
      optionsObserver.disconnect()
      fit(watched, more)
      optionsObserver.observe(watched, WATCH)
    })
  }
  const attach = () => {
    const menu = doc.querySelector('.mateu-subheader-menu')
    if (!menu || menu === watched) return
    if (optionsObserver) optionsObserver.disconnect()
    if (sizeObserver) sizeObserver.disconnect()
    watched = menu
    optionsObserver = new MutationObserver(schedule)
    optionsObserver.observe(menu, WATCH)
    sizeObserver = new ResizeObserver(schedule)
    sizeObserver.observe(menu)
    schedule()
  }
  new MutationObserver(attach).observe(doc.documentElement, { childList: true, subtree: true })
  attach()
}

if (typeof document !== 'undefined') installSubheaderOverflow(document)
