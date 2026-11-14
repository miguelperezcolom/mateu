// Serves the two HOSTS of the embedded check, both with the BUILT component (build/embedded/mateu-ui,
// from `npm run build:embedded`):
//   /            a plain Oracle JET page (index.html), the component at /mateu-ui/;
//   /ic/builder/rt/hostapp/live/webApps/hostapp/   a real Visual Builder app on the 2701 runtime
//                (vb-host/), at the path shape VB serves an app from — VB's fetch plugins (CSRF, app
//                version headers) scope themselves by it, and at "/" they would stamp every request,
//                third-party APIs included —, the component where VB's import puts it:
//                <app>/resources/components/mateu-ui-<version>/. /vb/ redirects there.
// COMPONENT_DIR=<dir> serves another build of the component (e.g. an older release, to reproduce).
// Usage: node embedded/harness/serve.mjs [port]   (default 9131)
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const root = join(here, '..', '..')
const component = process.env.COMPONENT_DIR || join(root, 'build', 'embedded', 'mateu-ui')
const vbHost = join(here, 'vb-host')
const port = Number(process.argv[2] || process.env.PORT || 9131)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown' }
const componentVersion = () => JSON.parse(readFileSync(join(component, 'component.json'), 'utf8')).version
// the Spectra bundles a Redwood VB app registers (the standalone app's, the same CDN version)
const ojSpBundles = () => JSON.stringify(JSON.parse(readFileSync(join(root, 'webApps', 'vbredwoodapp', 'app-flow.json'), 'utf8')).requirejs.bundles)
export const VB_APP_PATH = '/ic/builder/rt/hostapp/live/webApps/hostapp/'
const inside = (base, rel) => join(base, normalize(rel).replace(/^(\.\.[/\\])+/, ''))

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file
  let rewrite = null
  if (path.startsWith('/mateu-ui/')) file = inside(component, path.slice('/mateu-ui/'.length))
  else if (path === '/vb' || path === '/vb/') {
    res.writeHead(302, { Location: VB_APP_PATH + new URL(req.url, 'http://x').search })
    res.end()
    return
  } else if (path === VB_APP_PATH) {
    file = join(vbHost, 'index.html')
    rewrite = (s) => s.replace('/*@OJ_SP_BUNDLES@*/{}', ojSpBundles()).replaceAll('@VB_APP_PATH@', VB_APP_PATH)
  } else if (path.startsWith(VB_APP_PATH)) {
    const rel = path.slice(VB_APP_PATH.length)
    const prefix = 'resources/components/mateu-ui-' + componentVersion() + '/'
    if (rel.startsWith(prefix)) file = inside(component, rel.slice(prefix.length))
    else {
      file = inside(vbHost, rel)
      if (rel === 'pages/host-page.json') rewrite = (s) => s.replace('@VERSION@', componentVersion())
    }
  } else file = join(here, 'index.html')
  try {
    let body = await readFile(file)
    if (rewrite) body = rewrite(body.toString('utf8'))
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch (e) {
    res.writeHead(404)
    res.end('not found')
  }
}).listen(port, () => console.log(`host harness on http://localhost:${port}/ and the VB 2701 host on http://localhost:${port}${VB_APP_PATH} (component from ${component})`))
