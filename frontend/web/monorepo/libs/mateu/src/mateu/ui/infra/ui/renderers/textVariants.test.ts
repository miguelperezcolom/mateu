// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'lit'
import { renderText } from './textRenderer'

const draw = (metadata: Record<string, unknown>) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(renderText({ type: 'ClientSide', id: 't', metadata: { type: 'Text', ...metadata }, children: [] } as any, {}, {}, {}, {}) as any, host)
    return host.firstElementChild as HTMLElement
}
afterEach(() => { document.body.innerHTML = '' })

describe('Text variants', () => {
    it('b draws the text bold and i italic, in any container', () => {
        expect(draw({ text: 'x', variants: ['b'] }).getAttribute('style')).toContain('font-weight: bold')
        expect(draw({ text: 'x', container: 'span', variants: ['i'] }).getAttribute('style')).toContain('font-style: italic')
        const both = draw({ text: 'x', container: 'h4', variants: ['b', 'i'] }).getAttribute('style')
        expect(both).toContain('font-weight: bold')
        expect(both).toContain('font-style: italic')
    })

    it('no variants adds neither', () => {
        const style = draw({ text: 'x', container: 'p' }).getAttribute('style') ?? ''
        expect(style).not.toContain('font-weight')
        expect(style).not.toContain('font-style')
    })
})
