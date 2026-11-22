import { useEffect } from 'react'
import { assignAccessKeys, keyHint } from '@infra/a11y/accessKeys.ts'
import { appShortcutFor } from '@infra/ui/appShortcuts.ts'
import type { MateuSession } from '@rn/core/MateuSession'

/**
 * ACCESS KEYS (`@App(accessKeys = true)`): holding Alt shows a key next to every visible button,
 * tab and link-button — its declared shortcut when it has one (`aria-keyshortcuts`, or the tooltip
 * an `@Action(shortcut)` button carries here), else a letter of its label assigned without repeats
 * (libs/mateu's rule, `assignAccessKeys`) — and Alt+that letter activates it. The candidates are a
 * query of the page (the badges go in one fixed layer); a design system whose buttons are custom
 * elements adds their tags (`addAccessKeyCandidates('ui5-button, ui5-tab')`).
 */
let CANDIDATES = 'button, [role="tab"], [role="button"], a[href][role="menuitem"]'

/** More elements that count as buttons/tabs for the access keys (a web-component design system's hosts). */
export function addAccessKeyCandidates(selector: string): void {
  CANDIDATES += ', ' + selector
}
const DECLARED = /^((ctrl|alt|shift|meta)\+)+[a-z0-9]$/i

interface Candidate { el: HTMLElement; label: string; declared: string; letter?: string }

const isShown = (el: HTMLElement) => {
  if (el.closest('[hidden], [aria-hidden="true"], .mateu-access-keys')) return false
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth
}

const candidates = (): Candidate[] => {
  // with a modal open only its own controls can be reached
  const modal = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"], [role="alertdialog"]')].pop()
  const root: ParentNode = modal ?? document
  return [...root.querySelectorAll<HTMLElement>(CANDIDATES)]
    .filter((el) => isShown(el) && !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true')
    .map((el) => {
      const declared = (el.getAttribute('aria-keyshortcuts') || el.getAttribute('title') || '').trim()
      return {
        el,
        label: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim(),
        declared: DECLARED.test(declared) ? declared.toLowerCase() : '',
      }
    })
    .filter((c) => c.label)
}

/** A key a screen or the app declares itself (session registry, AppDto.shortcuts) keeps doing what it declares. */
export function useAccessKeys(on: boolean, session: MateuSession, appShortcuts: unknown[]) {
  useEffect(() => {
    if (!on) return undefined
    let current: Candidate[] = []
    let shown = false
    const hide = () => {
      shown = false
      document.querySelectorAll('.mateu-access-keys').forEach((l) => l.remove())
    }
    const show = () => {
      hide()
      const all = candidates()
      const reserved = all.map((c) => /^alt\+([a-z0-9])$/i.exec(c.declared)?.[1] ?? '').filter(Boolean)
      const free = all.filter((c) => !c.declared)
      assignAccessKeys(free.map((c) => c.label), reserved).forEach((letter, i) => { free[i]!.letter = letter })
      const layer = document.createElement('div')
      layer.className = 'mateu-access-keys'
      layer.setAttribute('aria-hidden', 'true')
      for (const c of all) {
        const text = c.declared ? keyHint(c.declared) : (c.letter ?? '').toUpperCase()
        if (!text) continue
        const r = c.el.getBoundingClientRect()
        const badge = document.createElement('span')
        badge.className = 'mateu-access-keys__badge'
        badge.textContent = text
        badge.style.left = `${Math.max(0, r.left - 4)}px`
        badge.style.top = `${Math.max(0, r.top - 8)}px`
        layer.appendChild(badge)
      }
      document.body.appendChild(layer)
      shown = true
      current = all.filter((c) => c.letter)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (!shown) show()
        return
      }
      if (!e.altKey || e.ctrlKey || e.metaKey) return
      const letter = /^Key([A-Z])$/.exec(e.code)?.[1]?.toLowerCase() ?? /^Digit([0-9])$/.exec(e.code)?.[1]
      if (!letter) return
      if (session.keyShortcuts.find(e, false) || appShortcutFor(appShortcuts as never, e, false)) { hide(); return }
      if (!shown) show()
      const hit = current.find((c) => c.letter === letter)
      hide()
      if (!hit) return
      e.preventDefault()
      e.stopPropagation()
      hit.el.focus()
      hit.el.click()
    }
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Alt') hide() }
    // capture: the letter must reach us before a field would type it
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    window.addEventListener('blur', hide)
    window.addEventListener('scroll', hide, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
      window.removeEventListener('blur', hide)
      window.removeEventListener('scroll', hide, true)
      hide()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, session])
}
