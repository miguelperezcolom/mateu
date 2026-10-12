// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectivity } from '@infra/http/connectivity.ts'
import { mountConnectivityBanner } from './mateu-connectivity-banner'
import type { MateuConnectivityBanner } from './mateu-connectivity-banner'
import { mountSkipLink } from './mateu-skip-link'
import type { MateuSkipLink } from './mateu-skip-link'

/**
 * The two document-wide chrome singletons mounted by the composition root (mateu-ui): the offline
 * banner and the skip link. Both are what a user relies on when something is unusual — the network
 * dropped, or they navigate by keyboard — so they are exactly what a refactor breaks silently.
 */
describe('mateu-connectivity-banner', () => {
    const banner = () => document.querySelector('mateu-connectivity-banner') as MateuConnectivityBanner
    const bar = () => banner().shadowRoot!.querySelector('.bar') as HTMLElement | null

    beforeEach(() => { connectivity.reset(); document.body.innerHTML = ''; document.body.removeAttribute('style') })
    afterEach(() => { vi.useRealTimers(); connectivity.reset() })

    it('is invisible while online, and mounts once however often it is asked', async () => {
        mountConnectivityBanner()
        mountConnectivityBanner()
        expect(document.querySelectorAll('mateu-connectivity-banner')).toHaveLength(1)
        await banner().updateComplete
        expect(bar()).toBeNull()
        expect(document.body.style.getPropertyValue('padding-block-start')).toBe('')
    })

    it('shows a polite status strip when our own traffic proves the backend unreachable', async () => {
        mountConnectivityBanner()
        connectivity.noteUnreachable()
        await banner().updateComplete
        expect(bar()).not.toBeNull()
        expect(bar()!.getAttribute('role')).toBe('status')
        expect(bar()!.getAttribute('aria-live')).toBe('polite')
        expect(bar()!.classList.contains('offline')).toBe(true)
        expect(bar()!.textContent).toContain('No connection')
        // it reserves its own height instead of covering the page title (0 in jsdom, but SET)
        expect(document.body.style.getPropertyValue('padding-block-start')).toBe('0px')
    })

    it('the browser going offline shows it too', async () => {
        mountConnectivityBanner()
        window.dispatchEvent(new Event('offline'))
        await banner().updateComplete
        expect(bar()?.classList.contains('offline')).toBe(true)
        window.dispatchEvent(new Event('online'))
    })

    it('announces the recovery briefly, then retires and gives the space back', async () => {
        vi.useFakeTimers()
        mountConnectivityBanner()
        connectivity.noteUnreachable()
        await banner().updateComplete
        connectivity.noteReachable()
        await banner().updateComplete
        expect(bar()?.classList.contains('back')).toBe(true)
        expect(bar()!.textContent).toContain('Connection restored')
        vi.advanceTimersByTime(4001)
        await banner().updateComplete
        expect(bar()).toBeNull()
        expect(document.body.style.getPropertyValue('padding-block-start')).toBe('')
    })

    it('unmounting stops listening and releases the reserved space', async () => {
        mountConnectivityBanner()
        connectivity.noteUnreachable()
        await banner().updateComplete
        banner().remove()
        expect(document.body.style.getPropertyValue('padding-block-start')).toBe('')
    })
})

describe('mateu-skip-link', () => {
    beforeEach(() => { document.body.innerHTML = '' })

    it('is the FIRST thing in the body, mounted once', async () => {
        document.body.innerHTML = '<nav><a href="/x">menu</a></nav>'
        mountSkipLink()
        mountSkipLink()
        expect(document.body.firstElementChild?.localName).toBe('mateu-skip-link')
        expect(document.querySelectorAll('mateu-skip-link')).toHaveLength(1)
        const link = document.body.firstElementChild as MateuSkipLink
        await link.updateComplete
        expect(link.shadowRoot!.querySelector('button')!.textContent).toBe('Skip to content')
    })

    it('moves the focus to the content region, even inside a shadow root', async () => {
        mountSkipLink()
        const shell = document.createElement('div')
        document.body.appendChild(shell)
        const shadow = shell.attachShadow({ mode: 'open' })
        const content = document.createElement('div')
        content.className = 'app-content'
        shadow.appendChild(content)

        const link = document.querySelector('mateu-skip-link') as MateuSkipLink
        await link.updateComplete
        ;(link.shadowRoot!.querySelector('button') as HTMLButtonElement).click()
        expect(content.getAttribute('tabindex')).toBe('-1')
        expect(shadow.activeElement).toBe(content)
    })

    it('prefers the app content over a page or ux further down', async () => {
        mountSkipLink()
        document.body.insertAdjacentHTML('beforeend', '<mateu-ux id="ux"></mateu-ux><div class="app-content" id="ac"></div>')
        const link = document.querySelector('mateu-skip-link') as MateuSkipLink
        await link.updateComplete
        ;(link.shadowRoot!.querySelector('button') as HTMLButtonElement).click()
        expect(document.activeElement?.id).toBe('ac')
    })

    it('does nothing when there is no content region', async () => {
        mountSkipLink()
        const link = document.querySelector('mateu-skip-link') as MateuSkipLink
        await link.updateComplete
        expect(() => (link.shadowRoot!.querySelector('button') as HTMLButtonElement).click()).not.toThrow()
    })
})
