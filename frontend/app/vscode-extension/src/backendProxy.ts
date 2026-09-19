import * as http from 'http'
import * as https from 'https'

/**
 * A loopback HTTP proxy that forwards the Mateu sync endpoints (`/mateu`, `/sse`) to the configured
 * backend and adds permissive CORS. The VSCode webview fetches this proxy (allowed by the webview
 * CSP `connect-src`), so the web app runs unchanged with `baseUrl = http://127.0.0.1:<port>` and no
 * cross-origin problem — the same "backend is same-ish-origin" trick the JCEF host uses.
 *
 * One proxy per backend URL, started lazily.
 */
export class BackendProxy {
    private server?: http.Server
    private _port = -1
    private startedFor?: string

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

        const path = req.url ?? '/'
        if (!path.startsWith('/mateu') && !path.startsWith('/sse')) {
            res.writeHead(404); res.end('not found'); return
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
