// The static-bundle remote, served as what it is: plain files. No Mateu and no Java at run time —
// stands in for a CDN / an S3 bucket in front of static-remote/target/mateu-bundle.
//
// Every answer carries `Access-Control-Allow-Origin: *`: the Explorer (another origin) reads the
// bundle's manifest.json from the browser — what a CDN in front of a static site would be set to allow.
//
// Usage: node serve-static.mjs            (port: env STATIC_REMOTE_PORT, default 8643)
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const bundle = resolve(here, 'static-remote/target/mateu-bundle')
const port = Number(process.env.STATIC_REMOTE_PORT ?? 8643)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.map': 'application/json',
  '.webmanifest': 'application/manifest+json',
}
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS).end(); return }
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
  let file = join(bundle, path)
  if (!file.startsWith(bundle)) { res.writeHead(403, CORS).end(); return }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    file = join(bundle, 'index.html') // SPA fallback: a deep link opens the bundle's page
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { ...CORS, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404, CORS).end('not found')
  }
}).listen(port, () => console.log(`static Help Center bundle on http://localhost:${port}`))
