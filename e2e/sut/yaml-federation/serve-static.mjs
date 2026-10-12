// The static half of the YAML-only federation: plain files, no Mateu and no Java behind them.
//
//   /api/**   the JSON both domains read their rows from (api/), standing in for a public REST API
//   /**       the Catalog domain's static bundle (catalog/target/mateu-bundle), SPA fallback included
//
// Every answer carries `Access-Control-Allow-Origin: *`: the console (another origin) reads the
// bundle's manifest.json and the API from the browser — exactly what a CDN in front of a static site
// would be configured to allow.
//
// Usage: node serve-static.mjs [port]   (default 18482)
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const bundle = resolve(here, 'catalog/target/mateu-bundle')
const api = resolve(here, 'api')
const port = Number(process.argv[2] ?? 18482)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.map': 'application/json',
}
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS).end(); return }
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
  const isApi = path.startsWith('/api/')
  const root = isApi ? api : bundle
  let file = join(root, isApi ? path.substring('/api'.length) : path)
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    if (isApi) { res.writeHead(404, CORS).end('not found'); return }
    file = join(root, 'index.html') // SPA fallback
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { ...CORS, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404, CORS).end('not found')
  }
}).listen(port, () => console.log(`static catalog + api on http://localhost:${port}`))
