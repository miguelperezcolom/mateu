// @vitest-environment jsdom
// The subject here IS the DOM (the theme attribute crossing onto a container), so this file opts
// into jsdom; the suite default stays `node` for the pure-logic tests.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mirrorThemeAttribute } from './themeScope'

describe('mirrorThemeAttribute (theming isolation for embedding)', () => {
  let host: HTMLElement
  let dispose: (() => void) | undefined

  beforeEach(() => {
    document.documentElement.removeAttribute('theme')
    host = document.createElement('mateu-ui')
    document.body.appendChild(host)
  })

  afterEach(() => {
    dispose?.()
    dispose = undefined
    host.remove()
    document.documentElement.removeAttribute('theme')
  })

  it('copies the document theme onto the container on install', () => {
    document.documentElement.setAttribute('theme', 'dark')
    dispose = mirrorThemeAttribute(host)
    expect(host.getAttribute('theme')).toBe('dark')
  })

  it('has nothing to copy when the document declares no theme', () => {
    dispose = mirrorThemeAttribute(host)
    expect(host.hasAttribute('theme')).toBe(false)
  })

  it('tracks a later theme change on the document', async () => {
    dispose = mirrorThemeAttribute(host)
    document.documentElement.setAttribute('theme', 'dark')
    await Promise.resolve() // let the MutationObserver microtask run
    expect(host.getAttribute('theme')).toBe('dark')

    document.documentElement.setAttribute('theme', 'light')
    await Promise.resolve()
    expect(host.getAttribute('theme')).toBe('light')
  })

  it('clears the container theme when the document theme is removed', async () => {
    document.documentElement.setAttribute('theme', 'dark')
    dispose = mirrorThemeAttribute(host)
    expect(host.getAttribute('theme')).toBe('dark')

    document.documentElement.removeAttribute('theme')
    await Promise.resolve()
    expect(host.hasAttribute('theme')).toBe(false)
  })

  it('stops tracking after the disposer runs', async () => {
    dispose = mirrorThemeAttribute(host)
    dispose()
    dispose = undefined
    document.documentElement.setAttribute('theme', 'dark')
    await Promise.resolve()
    expect(host.hasAttribute('theme')).toBe(false)
  })
})
