// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    documentUrl,
    handleFileDownload,
    preparePrint,
    printPage,
    shadowRoots,
    type DocumentEnv,
} from './documents'

function env(overrides: Partial<DocumentEnv> = {}) {
    const timers: Array<() => void> = []
    const e = {
        document,
        URL: { createObjectURL: vi.fn(() => 'blob:doc'), revokeObjectURL: vi.fn() },
        Blob,
        atob: (s: string) => atob(s),
        open: vi.fn(() => ({ opener: {} }) as unknown as Window),
        print: vi.fn(),
        setTimeout: vi.fn((cb: () => void) => { timers.push(cb) }),
        ...overrides,
    } as unknown as DocumentEnv & { timers: Array<() => void> }
    ;(e as any).timers = timers
    return e as DocumentEnv & { timers: Array<() => void> }
}

describe('documentUrl', () => {
    it('keeps a same-site path and resolves it against an absolute base url', () => {
        expect(documentUrl('/app/mateu/v3/documents/abc')).toBe('/app/mateu/v3/documents/abc')
        expect(documentUrl('/app/mateu/v3/documents/abc', 'http://localhost:8080/app'))
            .toBe('http://localhost:8080/app/mateu/v3/documents/abc')
        expect(documentUrl('https://cdn.example/x.pdf')).toBe('https://cdn.example/x.pdf')
    })
    it('refuses anything that is not a path or an http(s) url', () => {
        expect(documentUrl('javascript:alert(1)')).toBeUndefined()
        expect(documentUrl('//evil.example/x')).toBeUndefined()
        expect(documentUrl('data:text/html,<script>')).toBeUndefined()
        expect(documentUrl(undefined)).toBeUndefined()
    })
})

describe('handleFileDownload', () => {
    let click: ReturnType<typeof vi.spyOn>
    beforeEach(() => {
        click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    })
    afterEach(() => {
        click.mockRestore()
        document.body.innerHTML = ''
    })

    it('downloads an attachment and releases the object url later, not in the same tick', () => {
        const e = env()
        expect(handleFileDownload({ filename: 'a.csv', mimeType: 'text/csv', base64Content: btoa('a;b') }, e))
            .toBe('downloaded')
        expect(click).toHaveBeenCalledTimes(1)
        expect(e.URL.revokeObjectURL).not.toHaveBeenCalled()
        e.timers.forEach(t => t())
        expect(e.URL.revokeObjectURL).toHaveBeenCalledWith('blob:doc')
        expect(document.querySelector('a')).toBeNull() // the anchor is removed again
    })

    it('opens an inline document in a new tab, cutting the opener', () => {
        const tab = { opener: {} }
        const e = env({ open: vi.fn(() => tab as unknown as Window) })
        expect(handleFileDownload({ filename: 'f.pdf', mimeType: 'application/pdf', base64Content: btoa('%PDF'), disposition: 'inline' }, e))
            .toBe('opened')
        expect(e.open).toHaveBeenCalledWith('blob:doc', '_blank')
        expect(tab.opener).toBeNull()
        expect(click).not.toHaveBeenCalled()
    })

    it('downloads an inline document when a popup blocker refuses the tab', () => {
        const e = env({ open: vi.fn(() => null) })
        expect(handleFileDownload({ filename: 'f.pdf', url: '/mateu/v3/documents/tok', disposition: 'inline' }, e))
            .toBe('downloaded')
        expect(click).toHaveBeenCalledTimes(1)
    })

    it('fetches a parked document from its url, resolved against the base url', () => {
        const e = env()
        handleFileDownload({ filename: 'big.pdf', url: '/app/mateu/v3/documents/tok', disposition: 'inline' }, e,
            'http://localhost:8080/app')
        expect(e.open).toHaveBeenCalledWith('http://localhost:8080/app/mateu/v3/documents/tok', '_blank')
        expect(e.URL.createObjectURL).not.toHaveBeenCalled()
    })

    it('prints an inline document through a hidden frame', () => {
        const e = env()
        expect(handleFileDownload({ filename: 'f.pdf', base64Content: btoa('%PDF'), disposition: 'inline', print: true }, e))
            .toBe('printing')
        const frame = document.querySelector('iframe') as HTMLIFrameElement
        expect(frame).not.toBeNull()
        expect(frame.getAttribute('aria-hidden')).toBe('true')
        const print = vi.fn()
        Object.defineProperty(frame, 'contentWindow', { value: { focus: vi.fn(), print } })
        frame.dispatchEvent(new Event('load'))
        expect(print).toHaveBeenCalledTimes(1)
        expect(e.open).not.toHaveBeenCalled()
    })

    it('opens the document in a tab when the frame cannot print it', () => {
        const e = env()
        handleFileDownload({ filename: 'f.pdf', base64Content: btoa('%PDF'), disposition: 'inline', print: true }, e)
        const frame = document.querySelector('iframe') as HTMLIFrameElement
        Object.defineProperty(frame, 'contentWindow', { value: { focus() {}, print() { throw new Error('blocked') } } })
        frame.dispatchEvent(new Event('load'))
        expect(e.open).toHaveBeenCalledWith('blob:doc', '_blank')
    })

    it('ignores what it cannot use', () => {
        const e = env()
        expect(handleFileDownload(null, e)).toBe('none')
        expect(handleFileDownload({ filename: 'x', url: 'javascript:alert(1)' }, e)).toBe('none')
        expect(click).not.toHaveBeenCalled()
    })
})

describe('printing the page', () => {
    afterEach(() => { document.body.innerHTML = '' })

    it('adopts the chrome-hiding print sheet into the document and every shadow root, once', () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const sr = host.attachShadow({ mode: 'open' })
        const inner = document.createElement('span')
        sr.appendChild(inner)
        const nested = inner.attachShadow({ mode: 'open' })
        expect(shadowRoots(document)).toEqual([sr, nested])
        const count = preparePrint(document)
        expect(count).toBe(3)
        const css = (root: Document | ShadowRoot) =>
            [...((root as any).adoptedStyleSheets ?? [])].map((s: CSSStyleSheet) => [...s.cssRules].map(r => r.cssText).join('')).join('')
                + [...root.querySelectorAll('style[data-mateu-print]')].map(s => s.textContent).join('')
        expect(css(nested)).toContain('print')
        expect(css(sr)).toContain('print')
        const before = (nested as any).adoptedStyleSheets?.length ?? nested.querySelectorAll('style').length
        preparePrint(document)
        const after = (nested as any).adoptedStyleSheets?.length ?? nested.querySelectorAll('style').length
        expect(after).toBe(before)
    })

    it('Print prepares the sheet and opens the print dialog', () => {
        const e = env()
        printPage(e)
        expect(e.print).toHaveBeenCalledTimes(1)
    })
})
