import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tocShortcutIndex } from '@mr/page/toc'
export { PageTocAside } from './PageTocAside'

const GAP = 8

/** The app shell's sticky header bottom (0 without one): what a pinned page element sits under. */
/**
 * The element the page scrolls in: the nearest scrollable ancestor across shadow roots and slots (a
 * Fiori dynamic page scrolls its content itself), or null when the document scrolls.
 */
export function pageScrollerOf(el: HTMLElement | null): HTMLElement | null {
  let n: Node | null = el
  while (n && n !== document.body && n !== document.documentElement) {
    let up: Node | null = (n as Element).assignedSlot ?? n.parentNode
    if (up instanceof ShadowRoot) up = up.host
    n = up
    if (n instanceof HTMLElement && n !== document.body && n !== document.documentElement) {
      const oy = getComputedStyle(n).overflowY
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) return n
    }
  }
  return null
}

function shellStickyTop(): number {
  const header = document.querySelector<HTMLElement>('.mateu-app-header')
  if (!header || getComputedStyle(header).position !== 'sticky') return 0
  return Math.max(0, header.getBoundingClientRect().bottom)
}

/**
 * The page's pinned region and its @Section cards, measured from the DOM (the web renderer's
 * mateu-page rules): the header wrap pins under the app header in docs mode, every
 * `@Section(sticky)` card stacks under it (each below the ones declared before it), the scrollspy
 * reads the section at the reading line just below what is pinned, a click scrolls a section to that
 * line and keeps it highlighted until the user scrolls by hand, Ctrl+Alt+1..9 does the same.
 */
export function usePageLayout(rootRef: React.RefObject<HTMLElement | null>, headerRef: React.RefObject<HTMLElement | null>, opts: { toc: boolean; count: number; layoutKey: unknown }) {
  const [active, setActive] = useState(0)
  const locked = useRef(false)

  const sections = useCallback((): HTMLElement[] => {
    const root = rootRef.current
    if (!root) return []
    // the page's own: not a nested view's (an island's sections are its own)
    return [...root.querySelectorAll<HTMLElement>('section.mateu-section')]
      .filter((el) => el.closest('.mateu-page') === root)
  }, [rootRef])

  /** Where the pinned region ends: the app header, the pinned page header, the stuck sticky cards. */
  const pinnedBottom = useCallback((exclude?: HTMLElement): number => {
    const scroller = pageScrollerOf(rootRef.current)
    let bottom = scroller ? scroller.getBoundingClientRect().top : shellStickyTop()
    const header = headerRef.current
    if (opts.toc && header) bottom = Math.max(bottom, header.getBoundingClientRect().bottom)
    for (const el of sections()) {
      if (el === exclude || !el.classList.contains('mateu-section--sticky')) continue
      const r = el.getBoundingClientRect()
      const stuck = Math.abs(r.top - parseFloat(el.style.top || '0')) < 2
      if (stuck) bottom = Math.max(bottom, r.bottom)
    }
    return bottom
  }, [rootRef, headerRef, opts.toc, sections])

  // the pinned tops: the page header under the app header, each sticky card under those before it
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const place = () => {
      const shell = pageScrollerOf(root) ? 0 : shellStickyTop()
      root.style.setProperty('--mateu-shell-sticky-top', `${shell}px`)
      const headerH = opts.toc && headerRef.current ? headerRef.current.offsetHeight : 0
      // the first pinned card sits right under the header (a gap would let the content scroll
      // through it); the ones after it keep the gap, covered by their own shadow (page.css)
      let top = shell + headerH
      root.style.setProperty('--mateu-page-pinned-top', `${shell + headerH}px`)
      for (const el of sections()) {
        if (!el.classList.contains('mateu-section--sticky')) continue
        el.style.top = `${top}px`
        top += el.offsetHeight + GAP
      }
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(root)
    if (headerRef.current) ro.observe(headerRef.current)
    window.addEventListener('resize', place)
    return () => { ro.disconnect(); window.removeEventListener('resize', place) }
  }, [rootRef, headerRef, sections, opts.toc, opts.layoutKey])

  // scrollspy
  useEffect(() => {
    if (!opts.toc) return
    const spy = () => {
      if (locked.current) return
      const line = pinnedBottom() + GAP + 1
      const all = sections()
      let current = 0
      all.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        // a pinned sticky card is the one in view while it is stuck at its place
        if (r.top <= line || (el.classList.contains('mateu-section--sticky') && r.top <= parseFloat(el.style.top || '0') + 1)) current = i
      })
      // the end of the page: the last section is the one being read
      const atEnd = scroller
        ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
        : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atEnd) current = all.length - 1
      setActive(Math.max(0, current))
    }
    const unlock = () => { locked.current = false }
    const scroller = pageScrollerOf(rootRef.current)
    const scrolling: HTMLElement | Window = scroller ?? window
    spy()
    scrolling.addEventListener('scroll', spy, { passive: true })
    window.addEventListener('wheel', unlock, { passive: true })
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      scrolling.removeEventListener('scroll', spy)
      window.removeEventListener('wheel', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [rootRef, opts.toc, pinnedBottom, sections, opts.layoutKey])

  const jump = useCallback((i: number) => {
    const el = sections()[i]
    if (!el) return
    // a sticky card already in its place stays; anything else lands just below the pinned region
    const delta = el.getBoundingClientRect().top - (pinnedBottom(el) + GAP)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ;(pageScrollerOf(rootRef.current) ?? window).scrollBy({ top: delta, behavior: reduce ? 'auto' : 'smooth' })
    setActive(i)
    // locked AFTER the keydown that may have triggered it has passed (keydown unlocks)
    setTimeout(() => { locked.current = true }, 0)
    const heading = el.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6')
    if (heading) {
      heading.tabIndex = -1
      heading.classList.add('mateu-focus-target')
      heading.focus({ preventScroll: true })
    }
  }, [rootRef, pinnedBottom, sections])

  // Ctrl+Alt+1..9
  useEffect(() => {
    if (!opts.toc) return
    const onKey = (e: KeyboardEvent) => {
      const i = tocShortcutIndex(e)
      if (i < 0 || i >= opts.count) return
      e.preventDefault()
      e.stopPropagation()
      jump(i)
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [opts.toc, opts.count, jump])

  return { active, jump }
}

