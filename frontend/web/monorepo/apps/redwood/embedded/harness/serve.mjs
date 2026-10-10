// Serves the host harness (index.html) at / and the BUILT component (build/embedded/mateu-ui, from
// `npm run build:embedded`) at /mateu-ui/ — the two halves of the embedded check.
// Usage: node embedded/harness/serve.mjs [port]   (default 9131)
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const component = join(here, '..', '..', 'build', 'embedded', 'mateu-ui')
const port = Number(process.argv[2] || process.env.PORT || 9131)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown' }

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const file = path.startsWith('/mateu-ui/')
    ? join(component, normalize(path.slice('/mateu-ui/'.length)).replace(/^(\.\.[/\\])+/, ''))
    : join(here, 'index.html')
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch (e) {
    res.writeHead(404)
    res.end('not found')
  }
}).listen(port, () => console.log(`host harness on http://localhost:${port}/ (component from ${component})`))
