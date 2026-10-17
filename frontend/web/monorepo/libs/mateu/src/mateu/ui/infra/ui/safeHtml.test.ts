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

    it('keeps an allow-listed custom element (vaadin-icon) but drops its on… attributes', () => {
        const out = sanitizeHtml('<vaadin-icon icon="vaadin:check" onclick="x()"></vaadin-icon>')
        expect(out).toContain('<vaadin-icon icon="vaadin:check">')
        expect(out).not.toContain('onclick')
    })

    it('drops a <mateu-ux> pointing at another origin (B1: credentials + remote UI injection)', () => {
        const out = sanitizeHtml('Mug <mateu-ux baseurl="https://attacker.example" route="pwned" '
            + 'consumedroute="y" id="z"></mateu-ux><mateu-ui baseurl="https://attacker.example"></mateu-ui>')
        expect(out).not.toMatch(/mateu-ux|mateu-ui|attacker/i)
        expect(out).toContain('Mug')
    })

    it('drops every custom element that is not allow-listed, and unknown attributes of an allowed one', () => {
        const out = sanitizeHtml('<x-widget src="//evil"></x-widget><mateu-drawer opened></mateu-drawer>'
            + '<vaadin-grid items="x"></vaadin-grid><vaadin-icon icon="vaadin:user" src="//evil/i.svg"></vaadin-icon>'
            + '<div is="mateu-ux"></div>')
        // (DOMPurify empties a customised built-in's `is` instead of removing it: inert)
        expect(out).not.toMatch(/x-widget|mateu-drawer|vaadin-grid|evil|mateu-ux/)
        expect(out).toContain('<vaadin-icon icon="vaadin:user">')
    })

    it('drops form controls (no credential-harvesting form from a value)', () => {
        const out = sanitizeHtml('<form action="https://phish.example"><input type="password" name="p">'
            + '<button formaction="https://phish.example">Go</button><select><option>a</option></select>'
            + '<textarea>t</textarea></form><b>kept</b>')
        expect(out).not.toMatch(/<form|<input|<button|<select|<option|<textarea|formaction|phish/i)
        expect(out).toContain('<b>kept</b>')
    })

    it('a header title keeps its own markup and shows interpolated data as text (M-S4)', () => {
        const title = possiblyHtml('<b>${state.name}</b>', { name: XSS + '<form action="https://phish"><input type=password></form>' }, {})!
        const out = sanitizeHtml(title)
        expect(out.startsWith('<b>')).toBe(true)
        expect(out).not.toMatch(/<img|<script|<form|<input/i)
        expect(out).toContain('&lt;img src=x')
    })
})

describe('rendered HTML sinks', () => {
    it('textRenderer (div container) renders state markup sanitized: no handler, no form, no mateu-ux', () => {
        const host = document.createElement('div')
        const component: any = {
            type: 'ClientSide', id: 't1', metadata: { type: 'Text', container: TextContainer.div,
                text: '<b>Hi</b> ${state.name}' }
        }
        render(renderText(component, { name: XSS + '<form><input type=password></form><mateu-ux baseurl="https://x"></mateu-ux><i>ok</i>' }, {}, {}, {}), host)
        const div = host.querySelector('div')!
        expect(div.querySelector('b')?.textContent).toBe('Hi')
        expect(div.querySelector('i')?.textContent).toBe('ok')
        expect(div.querySelector('img')!.hasAttribute('onerror')).toBe(false)
        expect(div.querySelector('script, form, input, mateu-ux')).toBeNull()
    })

    it('htmlColumnRenderer sanitizes the cell value', () => {
        const host = document.createElement('div')
        render(renderHtmlCell({ c: '<i>ok</i>' + XSS }, {} as any, { path: 'c' } as any, '', ''), host)
        expect(host.querySelector('i')?.textContent).toBe('ok')
        expect(host.querySelector('img')!.hasAttribute('onerror')).toBe(false)
        expect(host.querySelector('script')).toBeNull()
    })
})
