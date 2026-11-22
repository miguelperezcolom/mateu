// A plain static host, like a CDN: serves a renderer jar's static/ folder as files, answers
// index.html for any other GET (the SPA rewrite every host offers: Netlify `/* /index.html 200`,
// nginx `try_files $uri /index.html`), and — with --proxy — forwards /mateu/* to a Mateu backend,
// streaming the answer unbuffered (so SSE passes through), exactly what the recommended CDN setup
// does. Used by cdn-site-probe.mjs; also handy by hand:
//
//   node e2e/cdn-static-server.mjs --dir <static folder> --port 9300 [--proxy http://localhost:8080]
//   node e2e/cdn-static-server.mjs --dir site --port 9300 --backend http://localhost:8080
//     (--backend rewrites the served index.html's <meta name="mateu-backend"> — the alternative path)

import { createServer, request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name)
  return i > 0 ? process.argv[i + 1] : fallback
}
const dir = resolve(arg('dir', '.'))
const port = Number(arg('port', '9300'))
const proxy = arg('proxy', '')
const backend = arg('backend', '')
const upstream = proxy ? new URL(proxy) : null

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

const fileOf = (urlPath) => {
  const rel = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  const path = join(dir, rel)
  if (!path.startsWith(dir)) return null
  try { return statSync(path).isFile() ? path : null } catch { return null }
}

const index = () => {
  let html = readFileSync(join(dir, 'index.html'), 'utf8')
  if (backend) html = html.replace('<meta name="mateu-backend" content="">', `<meta name="mateu-backend" content="${backend}">`)
  return html
}

createServer((req, res) => {
  if (proxy && (req.url === '/mateu' || req.url.startsWith('/mateu/'))) {
    // the host and port are the --proxy ones; only the path (always /mateu…) comes from the request
    const send = upstream.protocol === 'https:' ? httpsRequest : httpRequest
    const headers = { ...req.headers, host: upstream.host }
    const options = {
      protocol: upstream.protocol, hostname: upstream.hostname, port: upstream.port,
      path: upstream.pathname.replace(/\/$/, '') + req.url, method: req.method, headers,
    }
    const up = send(options, (answer) => {
      res.writeHead(answer.statusCode, answer.headers)
      answer.pipe(res)
    })
    up.on('error', (e) => { res.writeHead(502); res.end('proxy error: ' + e.message) })
    req.pipe(up)
    return
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return }
  const file = fileOf(req.url)
  if (file && !file.endsWith(join(dir, 'index.html'))) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' })
    res.end(readFileSync(file))
    return
  }
  // a POST to /mateu/* with no proxy answers 405 above; a GET of a route answers the page
  res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-cache' })
  res.end(index())
}).listen(port, () => console.log(`static host on :${port} ← ${dir}${proxy ? ` (proxy /mateu/* → ${proxy})` : ''}${backend ? ` (mateu-backend = ${backend})` : ''}`))
