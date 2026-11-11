// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { showSignInChooser, MateuSignIn } from './mateu-sign-in'
import { parseSignInConfig } from './signInConfig'

const providers = parseSignInConfig({ providers: [
    { id: 'google', type: 'oidc', label: 'Google', icon: 'google', issuer: 'https://accounts.google.com', clientId: 'x' },
    { id: 'acme', type: 'oidc', label: 'Acme SSO', issuer: 'https://idp.acme', clientId: 'ui' },
] })!.providers

const chooser = () => document.querySelector('mateu-sign-in') as MateuSignIn
const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)))

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-sign-in', () => {
    it('a labelled modal dialog with one button per provider; the first takes the focus', async () => {
        void showSignInChooser({ providers, cancellable: false })
        await chooser().updateComplete
        await frame()
        const root = chooser().shadowRoot!
        const dialog = root.querySelector('[role="dialog"]')!
        expect(dialog.getAttribute('aria-modal')).toBe('true')
        expect(root.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Sign in')
        const buttons = [...root.querySelectorAll('button.provider')]
        expect(buttons.map((b) => b.textContent?.trim())).toEqual(['GContinue with Google', 'Continue with Acme SSO'])
        expect(buttons.every((b) => b.tagName === 'BUTTON')).toBe(true)
        expect(root.activeElement).toBe(buttons[0])
        expect(root.querySelector('.cancel')).toBeNull()
    })

    it('resolves with the chosen provider and goes away', async () => {
        const chosen = showSignInChooser({ providers, cancellable: false })
        await chooser().updateComplete
        ;(chooser().shadowRoot!.querySelectorAll('button.provider')[1] as HTMLButtonElement).click()
        expect((await chosen)?.id).toBe('acme')
        expect(chooser()).toBeNull()
    })

    it('after a 401 it can be declined (Cancel or Esc); a message is shown as an alert', async () => {
        const declined = showSignInChooser({ providers, cancellable: true, message: 'Signing in did not work.' })
        await chooser().updateComplete
        const root = chooser().shadowRoot!
        expect(root.querySelector('[role="alert"]')?.textContent).toBe('Signing in did not work.')
        chooser().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(await declined).toBeNull()
        const again = showSignInChooser({ providers, cancellable: true })
        await chooser().updateComplete
        ;(chooser().shadowRoot!.querySelector('.cancel') as HTMLButtonElement).click()
        expect(await again).toBeNull()
    })

    it('Esc does nothing at boot (nothing behind it)', async () => {
        const spy = vi.fn()
        void showSignInChooser({ providers, cancellable: false }).then(spy)
        await chooser().updateComplete
        chooser().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await Promise.resolve()
        expect(spy).not.toHaveBeenCalled()
        expect(chooser()).not.toBeNull()
    })
})
