// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { renderImage } from './imageRenderer'

/** An Image carries its text alternative to the <img>, so a screen reader reads it. */
describe('the image', () => {
    const draw = (metadata: Record<string, unknown>) => {
        const host = document.createElement('div')
        const component = { type: 'ClientSide', id: 'img', metadata: { type: 'Image', ...metadata }, children: [] } as unknown as ClientSideComponent
        render(renderImage(component), host)
        return host.querySelector('img') as HTMLImageElement
    }

    it('renders the declared alt text', () => {
        expect(draw({ src: '/logo.png', alt: 'Company logo' }).getAttribute('alt')).toBe('Company logo')
    })

    it('keeps an empty alt — the declaration that the image is decorative', () => {
        expect(draw({ src: '/divider.png', alt: '' }).getAttribute('alt')).toBe('')
    })

    it('adds no alt attribute when none was declared', () => {
        expect(draw({ src: '/logo.png' }).hasAttribute('alt')).toBe(false)
    })
})
