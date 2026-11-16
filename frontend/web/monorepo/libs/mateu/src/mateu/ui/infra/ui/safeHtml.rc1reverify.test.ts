// @vitest-environment jsdom
// rc.1 re-verification of GA review 2 N-9 / C3 (overlay styles in data HTML), with spellings of our
// own beside the fix's: the result must carry no position other than static/relative and no z-index
// as the browser's own CSS parser reads it.
import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './safeHtml'

const parsed = (out: string) => {
    const div = new DOMParser().parseFromString(out, 'text/html').querySelector('div')!
    const probe = document.createElement('div')
    probe.setAttribute('style', div.getAttribute('style') ?? '')
    return { position: probe.style.getPropertyValue('position'), zIndex: probe.style.getPropertyValue('z-index'), raw: div.getAttribute('style') ?? '' }
}

describe('rc.1 re-verify N-9/C3: no overlay through data HTML', () => {
    for (const style of [
        'position/**/:fixed;inset:0;z-index/**/:9999;background:#fff', // the report's own
        '/**/position:fixed',
        'p\\6fsition:fixed',
        'position:f\\69xed',
        'position:var(--x,fixed)',
        'position:/*a*/fixed/*b*/',
        '\\70osition:fixed',
        'pos\\ition:fixed',
        'position:\\66ixed',
        'position: sticky',
        'position:-webkit-sticky',
        'position:absolute!important',
        'z-\\69ndex:9999',
        'z-index:var(--z)',
        'color:red;;position:fixed',
        'content:";";position:fixed',
        'position:&#102;ixed', // an entity decoded by the HTML parser first
    ]) {
        it(style, () => {
            const r = parsed(sanitizeHtml(`<div style="${style}">x</div>`))
            expect(['', 'static', 'relative']).toContain(r.position.toLowerCase())
            expect(r.zIndex).toBe('')
            expect(r.raw).not.toMatch(/fixed|absolute|sticky|z-?index/i)
        })
    }
})
