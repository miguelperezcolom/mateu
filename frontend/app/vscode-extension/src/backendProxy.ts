import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import { staticAnswerOf } from './staticFiles'

/**
 * A loopback HTTP proxy that forwards the Mateu sync endpoints (`/mateu`, `/sse`) to the configured
 * backend and adds permissive CORS. The VSCode webview fetches this proxy (allowed by the webview
 * CSP `connect-src`), so the web app runs unchanged with `baseUrl = http://127.0.0.1:<port>` and no
 * cross-origin problem — the same "backend is same-ish-origin" trick the JCEF host uses.
 *
 * It also serves the Redwood canvas (the editor frames the real Redwood/VB app from here — see
 * staticFiles.ts), from `mediaDir`, the bundle the webview loads.
 *
 * One proxy per backend URL, started lazily.
 */
export class BackendProxy {
    private server?: http.Server
    private _port = -1
    private startedFor?: string

    /** @param mediaDir the visual-editor bundle (`media/`), for the Redwood canvas */
    constructor(private readonly mediaDir?: string) {}

    get port(): number { return this._port }

    ensureStarted(backendBaseUrl: string): Promise<number> {
        if (this.server && this.startedFor === backendBaseUrl) return Promise.resolve(this._port)
        this.dispose()
        return new Promise((resolve, reject) => {
            const server = http.createServer((req, res) => this.handle(req, res, backendBaseUrl))
            server.on('error', reject)
            server.listen(0, '127.0.0.1', () => {
                this.server = server
                this.startedFor = backendBaseUrl
                this._port = (server.address() as any).port
                resolve(this._port)
            })
        })
    }

    private handle(req: http.IncomingMessage, res: http.ServerResponse, backend: string) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Session-Id')
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

        let path = req.url ?? '/'
        if (!path.startsWith('/mateu') && !path.startsWith('/sse')) {
            const answer = req.method === 'GET' ? staticAnswerOf(this.mediaDir, path) : { kind: 'none' as const }
            if (answer.kind === 'file') {
                res.writeHead(200, { 'Content-Type': answer.contentType, 'Cache-Control': 'no-cache' })
                fs.createReadStream(answer.file).pipe(res)
                return
            }
            if (answer.kind === 'none') { res.writeHead(404); res.end('not found'); return }
            path = answer.path // the backend's own Redwood app
        }
        const target = new URL(backend.replace(/\/$/, '') + path)
        const headers: Record<string, string> = {
            'Content-Type': (req.headers['content-type'] as string) ?? 'application/json',
            'Accept': (req.headers['accept'] as string) ?? 'application/json',
        }
        // Buffer the whole request body, then forward it with an accurate Content-Length. A plain pipe
        // dropped the webview's body (preflight/keep-alive interplay) and the backend saw empty
        // parameters → "Invalid or empty YAML"; buffering is reliable for these small sync requests.
        const chunks: Buffer[] = []
        req.on('data', (c) => chunks.push(c as Buffer))
        req.on('end', () => {
            const body = Buffer.concat(chunks)
            const fwdHeaders = { ...headers, 'Content-Length': String(body.length) }
            // Pick the client by scheme so an `https://` mateu.baseUrl works (http.request would have
            // silently failed against it). An empty port lets the client use the scheme default (80/443).
            const client = target.protocol === 'https:' ? https : http
            const upstream = client.request({
                protocol: target.protocol,
                hostname: target.hostname,
                port: target.port ? Number(target.port) : undefined,
                path: target.pathname + target.search,
                method: req.method, headers: fwdHeaders,
            }, (up) => {
                res.writeHead(up.statusCode ?? 502, { 'Content-Type': up.headers['content-type'] ?? 'application/json' })
                up.pipe(res)
            })
            upstream.on('error', (e) => { if (!res.headersSent) res.writeHead(502); res.end(`Mateu backend unreachable at ${backend}: ${e.message}`) })
            if (body.length) upstream.write(body)
            upstream.end()
        })
    }

    dispose() {
        this.server?.close()
        this.server = undefined
        this.startedFor = undefined
        this._port = -1
    }
}
