// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-cookie-consent'
import type { MateuCookieConsent } from './mateu-cookie-consent'

const banner = () => document.querySelector('.cc-window[aria-label="cookieconsent"]') as HTMLElement | null

afterEach(() => {
    document.body.innerHTML = ''
    document.cookie = 'mateu-cookieconsent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
})

async function mount(props: Partial<MateuCookieConsent> = {}) {
    const el = document.createElement('mateu-cookie-consent') as MateuCookieConsent
    Object.assign(el, props)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

describe('cookie consent', () => {
    it('shows a banner announced as an alert, with the chrome texts and the learn-more link', async () => {
        await mount()
        const popup = banner()!
        expect(popup).toBeTruthy()
        expect(popup.getAttribute('role')).toBe('alert')
        expect(popup.textContent).toContain('This website uses cookies.')
        const link = popup.querySelector('a.cc-link')!
        expect(link.getAttribute('href')).toBe('https://cookiesandyou.com/')
        expect(link.getAttribute('rel')).toContain('noopener')
        expect(popup.querySelector('a.cc-btn')!.textContent).toBe('Ok. Thanks :).')
    })

    it('escapes texts (they are data, not markup) and refuses an unsafe learn-more link', async () => {
        await mount({ message: '<img src=x onerror=alert(1)>', learnMoreLink: 'javascript:alert(1)' } as any)
        const popup = banner()!
        expect(popup.querySelector('img')).toBeNull()
        expect(popup.textContent).toContain('<img src=x onerror=alert(1)>')
        expect(popup.querySelector('a.cc-link')!.getAttribute('href')).toBe('#')
    })

    it('dismisses with Enter on the dismiss link, like a button, remembering the choice in its cookie', async () => {
        await mount()
        const dismiss = banner()!.querySelector('a.cc-btn') as HTMLElement
        dismiss.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 } as any))
        expect(document.cookie).toContain('mateu-cookieconsent=dismiss')
    })

    it('removes its banner and style when it leaves the page, so a re-connect does not stack banners', async () => {
        const el = await mount()
        const styles = document.head.querySelectorAll('style').length
        el.remove()
        expect(banner()).toBeNull()
        expect(document.head.querySelectorAll('style').length).toBe(styles - 1)
        document.body.appendChild(el)
        document.body.appendChild(el.cloneNode())
        expect(document.querySelectorAll('.cc-window')).toHaveLength(1)
    })

    it('_show reveals a banner that was hidden', async () => {
        const el = await mount()
        const popup = banner()!
        popup.style.display = 'none'
        popup.classList.add('cc-invisible')
        ;(el as any)._show()
        expect(popup.style.display).toBe('')
        expect(popup.classList.contains('cc-invisible')).toBe(false)
    })
})
