import * as http from 'http'

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
        // Forward the request STREAM verbatim (pipe), preserving content-type/length. Buffering the
        // body worked for a plain Node client but dropped the browser's body (preflight/keep-alive
        // interplay), so the backend saw empty parameters → "Invalid or empty YAML".
        const headers: Record<string, string> = {
            'Content-Type': (req.headers['content-type'] as string) ?? 'application/json',
            'Accept': (req.headers['accept'] as string) ?? 'application/json',
        }
        if (req.headers['content-length']) headers['Content-Length'] = req.headers['content-length'] as string
        // Buffer the body so we can (a) inspect exactly what the webview sent and (b) forward it
        // with an accurate Content-Length. DIAGNOSTIC build.
        const chunks: Buffer[] = []
        req.on('data', (c) => chunks.push(c as Buffer))
        req.on('end', () => {
            const body = Buffer.concat(chunks)
            const fwdHeaders = { ...headers, 'Content-Length': String(body.length) }
            const upstream = http.request({
                hostname: target.hostname, port: target.port, path: target.pathname + target.search,
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
