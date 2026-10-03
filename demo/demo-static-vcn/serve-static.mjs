// A dumb static file server with an SPA fallback — what Netlify's `_redirects`, an S3+CloudFront
// error-document rule or nginx `try_files $uri /index.html` give you. It serves FILES ONLY: there is
// no Mateu, no Java and no proxy behind it. Any request that is not a file gets index.html, so a deep
// link such as /vcns/7 boots the SPA, which then resolves the route from manifest.json.
//
// Usage: node serve-static.mjs <dir> [port]
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? '.')
const port = Number(process.argv[3] ?? 8791)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.yaml': 'text/yaml', '.yml': 'text/yaml', '.map': 'application/json',
}

http.createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
  let file = join(root, path)
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    file = join(root, 'index.html') // SPA fallback
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(port, () => console.log(`static files from ${root} on http://localhost:${port}`))
