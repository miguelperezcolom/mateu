// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { adaptIndexHtml, deferredScripts, replayDeferred } from './previewPage'

/** The packaged page of io.mateu:redwood, as committed (what every host serves under redwood/). */
function packagedIndex(): string {
    let dir = dirname(fileURLToPath(import.meta.url))
    const rel = 'backend/shared/frontend/redwood/src/main/resources/static/_index.html'
    while (dir !== '/' && !existsSync(resolve(dir, rel))) dir = dirname(dir)
    return readFileSync(resolve(dir, rel), 'utf-8')
}

describe('the Redwood canvas page', () => {
    it('re-anchors the packaged page under the prefix the host serves it at', () => {
        const html = adaptIndexHtml(packagedIndex(), '/redwood/')
        expect(html).toContain('<base href="/redwood/">')
        expect(html).toContain("BASE_URL: '/redwood/_redwood/'")
        expect(html).not.toContain("BASE_URL: '/_redwood/'")
    })

    it('finds the parked boot scripts in order: JET from Oracle\'s CDN, never from the bundle', () => {
        const doc = new DOMParser().parseFromString(packagedIndex(), 'text/html')
        const srcs = deferredScripts(doc).map((s) => s.getAttribute('data-src')).filter(Boolean) as string[]
        expect(srcs.length).toBeGreaterThan(2)
        expect(srcs.every((u) => u.startsWith('https://static.oracle.com/'))).toBe(true)
        expect(srcs[0]).toMatch(/require\.js$/)
        expect(srcs[srcs.length - 1]).toMatch(/visual-runtime\.js$/)
    })

    it('replays them one after the other, and reports the first that cannot load', () => {
        document.body.innerHTML = `
            <script type="text/mateu-deferred">window.__a = 1</script>
            <script type="text/mateu-deferred" data-src="https://static.oracle.com/one.js"></script>
            <script type="text/mateu-deferred" data-src="https://static.oracle.com/two.js"></script>`
        const failed: string[] = []
        replayDeferred(document, (u) => failed.push(u))
        const live = () => Array.from(document.querySelectorAll('script')).filter((s) => s.type !== 'text/mateu-deferred')
        // the inline one ran and the first remote one is requested; the second waits for it
        expect(live().map((s) => s.getAttribute('src'))).toEqual([null, 'https://static.oracle.com/one.js'])
        expect(deferredScripts(document)).toHaveLength(1)
        live()[1].dispatchEvent(new Event('error'))
        expect(failed).toEqual(['https://static.oracle.com/one.js'])
        expect(deferredScripts(document)).toHaveLength(1) // a failed boot stops there
    })
})
