// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import { sanitizeHtml } from './safeHtml'
import { possiblyHtml } from './interpolation'
import { renderText } from './renderers/textRenderer'
import { renderHtmlCell } from './renderers/columnRenderers/htmlColumnRenderer'
import { TextContainer } from '@mateu/shared/apiClients/dtos/componentmetadata/TextContainer'

const XSS = '<img src=x onerror="globalThis.__pwnedHtml=1"><script>globalThis.__pwnedHtml=1</script>'

describe('sanitizeHtml (HTML sinks fed with data: header texts, texts, html cells/fields)', () => {
    it('strips event handlers and scripts but keeps simple markup', () => {
        const out = sanitizeHtml('<b>Bold</b> ' + XSS + ' <a href="javascript:alert(1)">x</a>')
        expect(out).toContain('<b>Bold</b>')
        expect(out).toContain('<img src="x">')
        expect(out).not.toMatch(/onerror|<script|javascript:/i)
    })

    it('keeps custom elements but drops their on… attributes', () => {
        const out = sanitizeHtml('<vaadin-icon icon="vaadin:check" onclick="x()"></vaadin-icon>')
        expect(out).toContain('<vaadin-icon icon="vaadin:check">')
        expect(out).not.toContain('onclick')
    })

    it('sanitizes a header title whose interpolated data carries markup', () => {
        const title = possiblyHtml('<b>${state.name}</b>', { name: XSS }, {})!
        const out = sanitizeHtml(title)
        expect(out.startsWith('<b>')).toBe(true)
        expect(out).not.toMatch(/onerror|<script/i)
    })
})

describe('rendered HTML sinks', () => {
    it('textRenderer (div container) strips <img onerror> from interpolated data, keeps <b>', () => {
        const host = document.createElement('div')
        const component: any = {
            type: 'ClientSide', id: 't1', metadata: { type: 'Text', container: TextContainer.div,
                text: '<b>Hi</b> ${state.name}' }
        }
        render(renderText(component, { name: XSS }, {}, {}, {}), host)
        const div = host.querySelector('div')!
        expect(div.querySelector('b')?.textContent).toBe('Hi')
        expect(div.querySelector('img')).not.toBeNull()
        expect(div.querySelector('img')!.hasAttribute('onerror')).toBe(false)
        expect(div.querySelector('script')).toBeNull()
    })

    it('htmlColumnRenderer sanitizes the cell value', () => {
        const host = document.createElement('div')
        render(renderHtmlCell({ c: '<i>ok</i>' + XSS }, {} as any, { path: 'c' } as any, '', ''), host)
        expect(host.querySelector('i')?.textContent).toBe('ok')
        expect(host.querySelector('img')!.hasAttribute('onerror')).toBe(false)
        expect(host.querySelector('script')).toBeNull()
    })
})
