import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Tab, TabContainer } from '@ui5/webcomponents-react'
import { type TocEntry, tocShortcutIndex } from '@mr/page/toc'
import { tx } from '@mr/i18n/texts'

const GAP = 8

/** The app shell's sticky header bottom (0 without one): what a pinned page element sits under. */
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
    let bottom = shellStickyTop()
    const header = headerRef.current
    if (opts.toc && header) bottom = Math.max(bottom, header.getBoundingClientRect().bottom)
    for (const el of sections()) {
      if (el === exclude || !el.classList.contains('mateu-section--sticky')) continue
      const r = el.getBoundingClientRect()
      const stuck = Math.abs(r.top - parseFloat(el.style.top || '0')) < 2
      if (stuck) bottom = Math.max(bottom, r.bottom)
    }
    return bottom
  }, [headerRef, opts.toc, sections])

  // the pinned tops: the page header under the app header, each sticky card under those before it
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const place = () => {
      const shell = shellStickyTop()
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
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = all.length - 1
      setActive(Math.max(0, current))
    }
    const unlock = () => { locked.current = false }
    spy()
    window.addEventListener('scroll', spy, { passive: true })
    window.addEventListener('wheel', unlock, { passive: true })
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('scroll', spy)
      window.removeEventListener('wheel', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [opts.toc, pinnedBottom, sections, opts.layoutKey])

  const jump = useCallback((i: number) => {
    const el = sections()[i]
    if (!el) return
    // a sticky card already in its place stays; anything else lands just below the pinned region
    const delta = el.getBoundingClientRect().top - (pinnedBottom(el) + GAP)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollBy({ top: delta, behavior: reduce ? 'auto' : 'smooth' })
    setActive(i)
    // locked AFTER the keydown that may have triggered it has passed (keydown unlocks)
    setTimeout(() => { locked.current = true }, 0)
    const heading = el.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6')
    if (heading) {
      heading.tabIndex = -1
      heading.classList.add('mateu-focus-target')
      heading.focus({ preventScroll: true })
    }
  }, [pinnedBottom, sections])

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

/**
 * The index as the object page's anchor bar (Fiori): one tab per section across the top, pinned
 * with the header, the section in view selected; each tab names its Ctrl+Alt shortcut.
 */
export function PageTocAside({ entries, active, onJump }: { entries: TocEntry[]; active: number; onJump: (i: number) => void }) {
  return (
    <nav className="mateu-page-toc" aria-label={tx('sections')}>
      <TabContainer collapsed noAutoSelection tabLayout="Inline" overflowMode="End"
        onTabSelect={(e: CustomEvent<{ tabIndex: number }>) => onJump(e.detail.tabIndex)}>
        {entries.map((e, i) => {
          const name = e.title || tx('sectionN', { n: i + 1 })
          return (
            <Tab key={i} text={name} selected={i === active || undefined}
              additionalText={i < 9 ? `Ctrl+Alt+${i + 1}` /* i18n-ok: key names */ : undefined}
              aria-keyshortcuts={i < 9 ? `Control+Alt+${i + 1}` /* i18n-ok: key names */ : undefined} />
          )
        })}
      </TabContainer>
    </nav>
  )
}
