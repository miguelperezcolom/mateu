import assert from 'node:assert/strict'
import { fit, installSubheaderOverflow, overflowedOf } from './subheaderOverflow.mjs'

const leaf = (width) => ({ width, leaf: true })

// all fit: nothing moves, and the button takes no room
assert.deepEqual(overflowedOf([leaf(100), leaf(100)], 200, 60), [])
// the last ones go, in order, until the rest and the button fit
assert.deepEqual(overflowedOf([leaf(100), leaf(100), leaf(100), leaf(100)], 300, 60), [2, 3])
assert.deepEqual(overflowedOf([leaf(100), leaf(100), leaf(100)], 299, 60), [2])
// a group stays where it is, with its dropdown; the leaves before it go instead
assert.deepEqual(overflowedOf([leaf(100), leaf(100), { width: 100, leaf: false }], 220, 60), [0, 1])
// nothing but groups: nothing to move
assert.deepEqual(overflowedOf([{ width: 300, leaf: false }], 100, 60), [])

/** As much of an element as fit() touches. */
function el(classes = [], attrs = {}, width = 0) {
  const set = new Set(classes)
  return {
    style: {},
    offsetWidth: width,
    classList: {
      add: (c) => set.add(c),
      remove: (c) => set.delete(c),
      contains: (c) => set.has(c),
      toggle: (c, on) => { if (on) set.add(c); else set.delete(c) },
    },
    hasAttribute: (a) => a in attrs,
    getAttribute: (a) => attrs[a],
  }
}
const item = (route, width = 100, ...classes) => el(['mateu-subheader-item', ...classes], route ? { 'data-route': route } : {}, width)
const option = (value) => ({ value, style: {} })
const HIDDEN = 'mateu-subheader-overflowed'

function bar(items, clientWidth, options) {
  const list = { querySelectorAll: () => options }
  const more = el(['mateu-subheader-item'], {}, 60)
  more.querySelector = () => list
  const menu = el()
  menu.children = [...items, more]
  menu.clientWidth = clientWidth
  return { menu, more }
}

// what doesn't fit is hidden and left in the menu, and the rest of the menu isn't
{
  const items = [item('/a'), item('/b'), item('/c')]
  const options = ['/a', '/b', '/c'].map(option)
  const { menu, more } = bar(items, 200, options)
  fit(menu, more)
  assert.equal(more.style.display, '')
  assert.deepEqual(items.map((i) => i.classList.contains(HIDDEN)), [false, true, true])
  assert.deepEqual(options.map((o) => o.style.display), ['none', '', ''])
  assert.equal(more.classList.contains('mateu-nav-active'), false)

  // the screen on show is in the menu: the button says so
  items[2].classList.add('mateu-nav-active')
  fit(menu, more)
  assert.equal(more.classList.contains('mateu-nav-active'), true)

  // room again: everything is back, and the button goes
  menu.clientWidth = 300
  fit(menu, more)
  assert.deepEqual(items.map((i) => i.classList.contains(HIDDEN)), [false, false, false])
  assert.equal(more.style.display, 'none')

  // a phone's folded menu is left as it is
  menu.clientWidth = 100
  menu.classList.add('mateu-phone-folded')
  fit(menu, more)
  assert.deepEqual(items.map((i) => i.classList.contains(HIDDEN)), [false, false, false])
  assert.equal(more.style.display, 'none')
}

// a list JET has moved out of the button while it's open is still found: it was kept
{
  const options = ['/a', '/b'].map(option)
  const { menu, more } = bar([item('/a'), item('/b')], 100, options)
  fit(menu, more)
  more.querySelector = () => null
  menu.clientWidth = 180
  options.forEach((o) => { o.style.display = 'unset' })
  fit(menu, more)
  assert.equal(options[1].style.display, '')
}

// it watches: fitted when the bar appears and again when its options or its size change, ignoring its own changes
{
  const observers = []
  const frames = []
  globalThis.MutationObserver = class {
    constructor(callback) { this.callback = callback; this.observing = 0; observers.push(this) }
    observe() { this.observing++ }
    disconnect() { this.observing = 0 }
  }
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; this.observing = 0; observers.push(this) }
    observe() { this.observing++ }
    disconnect() { this.observing = 0 }
  }
  globalThis.requestAnimationFrame = (f) => frames.push(f)
  const run = () => { while (frames.length) frames.shift()() }

  const items = [item('/a'), item('/b')]
  const options = ['/a', '/b'].map(option)
  const { menu, more } = bar(items, 100, options)
  menu.isConnected = true
  menu.querySelector = () => more
  let found = null
  const doc = { documentElement: {}, querySelector: () => found }

  installSubheaderOverflow(doc)
  installSubheaderOverflow(doc) // once
  const page = observers[0]
  assert.equal(observers.length, 1)
  page.callback() // nothing on screen yet
  assert.equal(frames.length, 0)

  found = menu
  page.callback()
  page.callback() // the same bar: not watched twice
  assert.equal(observers.length, 3)
  const [, options_, size] = observers
  run()
  assert.equal(items[1].classList.contains(HIDDEN), true)
  assert.equal(options_.observing, 1, 'watching again after fitting')

  // a burst of changes: one fit
  menu.clientWidth = 200
  options_.callback()
  size.callback()
  assert.equal(frames.length, 1)
  run()
  assert.equal(items[1].classList.contains(HIDDEN), false)

  // gone by the time the frame comes: nothing to do
  menu.clientWidth = 100
  size.callback()
  menu.isConnected = false
  run()
  assert.equal(items[1].classList.contains(HIDDEN), false)

  // another bar: the old one is let go
  const next = bar([item('/x')], 100, [option('/x')])
  next.menu.isConnected = true
  next.menu.querySelector = () => next.more
  found = next.menu
  page.callback()
  assert.equal(options_.observing, 0)
  assert.equal(size.observing, 0)
  run()

  // a browser without observers, or no document: nothing happens
  delete globalThis.MutationObserver
  installSubheaderOverflow({})
  installSubheaderOverflow(null)
}

console.log('subheader overflow: ok')
