// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { unsupportedText } from './unsupportedRenderer'

/** The wire type name of an unsupported component is TEXT (final review H3). */
describe('<mateu-unsupported>', () => {

    it('renders a wire type name as text, never as markup', async () => {
        await import('./unsupportedRenderer')
        const el = document.createElement('mateu-unsupported')
        el.setAttribute('type', '<img src=x onerror="window.__pwned=1">')
        el.setAttribute('renderer', '<b>r</b>')
        document.body.appendChild(el)
        const root = el.shadowRoot!
        expect(root.querySelector('img')).toBeNull()
        expect(root.querySelector('b')).toBeNull()
        expect(root.querySelector('.mateu-unsupported')!.textContent).toContain('<img src=x')
        el.remove()
    })

    it('clamps an absurdly long type name', () => {
        const text = unsupportedText('x'.repeat(5000), 'vaadin')
        expect(text.length).toBeLessThan(200)
        expect(text).toContain('…')
    })
})
