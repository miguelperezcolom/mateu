import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import * as http from 'node:http'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BackendProxy } from './backendProxy'
import { imageUrlPath } from './projectImages'

// The loopback proxy the webview talks to: a real backend on an ephemeral port, real requests.

let backend: http.Server
let backendUrl: string
let seen: { method?: string; url?: string; headers: http.IncomingHttpHeaders; body: string }[]
let proxy: BackendProxy
let media: string

beforeEach(async () => {
    seen = []
    backend = http.createServer((req, res) => {
        const chunks: Buffer[] = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => {
            seen.push({ method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks).toString() })
            res.writeHead(req.url?.includes('fail') ? 500 : 200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: req.url }))
        })
    })
    await new Promise<void>((r) => backend.listen(0, '127.0.0.1', () => r()))
    backendUrl = `http://127.0.0.1:${(backend.address() as any).port}/`
    media = mkdtempSync(join(tmpdir(), 'mateu-media-'))
    mkdirSync(join(media, 'assets'))
    writeFileSync(join(media, 'redwood-preview.html'), '<html>canvas</html>')
    writeFileSync(join(media, 'assets/a.js'), 'export {}')
    proxy = new BackendProxy(media)
})
afterEach(async () => {
    proxy.dispose()
    await new Promise((r) => backend.close(r))
    rmSync(media, { recursive: true, force: true })
})

async function call(port: number, path: string, init: { method?: string; body?: string; headers?: Record<string, string> } = {}) {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { method: init.method ?? 'GET', body: init.body, headers: init.headers })
    return { status: res.status, headers: res.headers, text: await res.text() }
}

describe('BackendProxy', () => {
    it('forwards a sync POST with its whole body and an accurate Content-Length, adding CORS', async () => {
        const port = await proxy.ensureStarted(backendUrl)
        const body = JSON.stringify({ route: '/x', actionId: '', componentState: { a: 'é'.repeat(100) } })
        const res = await call(port, '/mateu/v3/sync/x?a=1', { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })
        expect(res.status).toBe(200)
        expect(res.headers.get('access-control-allow-origin')).toBe('*')
        expect(JSON.parse(res.text)).toEqual({ ok: '/mateu/v3/sync/x?a=1' })
        expect(seen[0]).toMatchObject({ method: 'POST', url: '/mateu/v3/sync/x?a=1', body })
        expect(seen[0].headers['content-length']).toBe(String(Buffer.byteLength(body)))
    })

    it('answers the preflight itself, allowing what the web client sends', async () => {
        const port = await proxy.ensureStarted(backendUrl)
        const res = await call(port, '/mateu/v3/sync/x', { method: 'OPTIONS' })
        expect(res.status).toBe(204)
        expect(res.headers.get('access-control-allow-headers')).toMatch(/Content-Type/)
        expect(seen).toHaveLength(0)
    })

    it('passes the backend status through and answers 502 with the backend URL when it is down', async () => {
        const port = await proxy.ensureStarted(backendUrl)
        expect((await call(port, '/mateu/fail', { method: 'POST', body: '{}' })).status).toBe(500)
        await new Promise((r) => backend.close(r))
        backend = http.createServer()
        backend.listen(0)
        const down = await call(port, '/mateu/v3/sync/x', { method: 'POST', body: '{}' })
        expect(down.status).toBe(502)
        expect(down.text).toContain(`Mateu backend unreachable at ${backendUrl}`)
    })

    it('serves the Redwood canvas from the bundle and 404s anything else that is not a Mateu call', async () => {
        const port = await proxy.ensureStarted(backendUrl)
        const page = await call(port, '/redwood-preview.html')
        expect(page.status).toBe(200)
        expect(page.headers.get('content-type')).toMatch(/text\/html/)
        expect(page.text).toBe('<html>canvas</html>')
        expect((await call(port, '/assets/a.js')).text).toBe('export {}')
        expect((await call(port, '/etc/passwd')).status).toBe(404)
        expect((await call(port, '/assets/../../x')).status).toBe(404)
        expect(seen).toHaveLength(0)
    })

    it("falls back to the backend's own Redwood app when the bundle has none", async () => {
        const port = await proxy.ensureStarted(backendUrl)
        const res = await call(port, '/redwood/index.html?x=1')
        expect(res.status).toBe(200)
        expect(seen[0].url).toBe('/index.html?x=1')
    })

    it('serves only registered module images', async () => {
        const module = mkdtempSync(join(tmpdir(), 'mateu-mod-'))
        try {
            mkdirSync(join(module, 'src/main/resources/static/img'), { recursive: true })
            writeFileSync(join(module, 'src/main/resources/static/img/logo.svg'), '<svg/>')
            const token = proxy.registerImageRoot(module)
            const port = await proxy.ensureStarted(backendUrl)
            const ok = await call(port, imageUrlPath(token, 'src/main/resources/static/img/logo.svg'))
            expect(ok.status, ok.text).toBe(200)
            expect(ok.text).toBe('<svg/>')
            expect((await call(port, imageUrlPath('nope', 'src/main/resources/static/img/logo.svg'))).status).toBe(404)
            expect((await call(port, imageUrlPath(token, 'src/main/resources/static/img/logo.svg'), { method: 'POST' })).status).toBe(404)
            expect((await call(port, imageUrlPath(token, '../../etc/passwd'))).status).toBe(404)
        } finally {
            rmSync(module, { recursive: true, force: true })
        }
    })

    it('reuses one server per backend URL and restarts for another', async () => {
        const a = await proxy.ensureStarted(backendUrl)
        expect(await proxy.ensureStarted(backendUrl)).toBe(a)
        expect(proxy.port).toBe(a)
        const b = await proxy.ensureStarted(backendUrl + 'other')
        expect(b).not.toBe(-1)
        proxy.dispose()
        expect(proxy.port).toBe(-1)
    })
})
