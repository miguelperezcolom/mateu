import { afterEach, describe, expect, it } from 'vitest'
import { RENDERER_HEADER, rendererHeaders, rendererHeaderValue, setRendererIdentity } from './rendererIdentity'

describe('renderer identity header', () => {
    afterEach(() => setRendererIdentity({ name: 'vaadin', version: 'unknown' }))

    it('defaults to the vaadin renderer of an unknown version, on the supported wire', () => {
        expect(rendererHeaderValue()).toBe('vaadin/unknown wire/3.0')
    })
    it('names the renderer and its version', () => {
        setRendererIdentity({ name: 'vaadin', version: '0.0.15' })
        expect(rendererHeaders()).toEqual({ [RENDERER_HEADER]: 'vaadin/0.0.15 wire/3.0' })
    })
    it('keeps the value header-safe', () => {
        setRendererIdentity({ version: '1.2.3 beta/x' })
        expect(rendererHeaderValue()).toBe('vaadin/1.2.3betax wire/3.0')
        setRendererIdentity({ version: '' })
        expect(rendererHeaderValue()).toBe('vaadin/unknown wire/3.0')
    })
})
