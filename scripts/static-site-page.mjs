// Mateu — Apache License 2.0 (LICENSE.txt at the repository root)
//
// The DEPLOYABLE page of a web renderer jar: static/index.html, next to the server template
// static/_index.html. Both renderers (apps/vaadin `npm run copy`, apps/redwood scripts/copy.mjs)
// write it from their own _index.html with this one function, so the two follow one rule.
//
// _index.html is a TEMPLATE: a Mateu backend fills its markers per request (core IndexPage, .NET
// UiPage, Python ui_page) and that does not change. index.html is the same page with no backend to
// fill it, ready to upload to any CDN or static host as it is:
//  - no template markers (title, favicon, the boot and UI regions);
//  - <meta name="mateu-backend" content="">: the ONE place the backend URL is set. Empty = the page's
//    own origin, the recommended setup (the host proxies /mateu/* to the backend). Read at startup by
//    libs/mateu pageBackend.ts (Vaadin) and apps/redwood poc/mount.mjs (Redwood);
//  - Vaadin: a <mateu-ui> with NO baseUrl (so the meta tag decides) and no pathPrefix (the site is
//    the host's root);
//  - Redwood: no <mateu-ui>, i.e. its hosted mode (hash routes, #/products — no rewrite rule needed
//    on the host), and the boot scripts the template parks as text/mateu-deferred (for the server's
//    replayer) written as ordinary scripts, in the same order.
//
// Usage: node scripts/static-site-page.mjs <_index.html> <index.html>

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const BACKEND_META = 'mateu-backend'
// the same default favicon the server writes (core IndexPage.DEFAULT_FAVICON)
export const DEFAULT_FAVICON = '<link rel="icon" type="image/svg+xml" href="/assets/mateu-icon.svg" />'
export const DEFAULT_TITLE = 'Mateu'

const MARKERS = ['<!-- AQUIFAVICON -->', '<!-- AQUIKEYCLOAK -->', '<!-- AQUIJS -->', '<!-- HASTAAQUIJS -->']

const BACKEND_HEAD = `
    <!-- Where the Mateu backend is. Empty = this site's own origin: proxy /mateu/* to the backend
         (recommended — one origin, no CORS, cookies work). Or put the backend's URL here, e.g.
         content="https://api.example.com", and allow this site's origin on the backend with
         mateu.cors.allowed-origins. -->
    <meta name="${BACKEND_META}" content="">`

/** The deployable page of a renderer, from its server template. */
export function staticSitePage(template) {
  let html = String(template)
  const from = html.indexOf('<!-- AQUIUI -->')
  const to = html.indexOf('<!-- HASTAAQUIUI -->')
  if (from < 0 || to < from) throw new Error('static-site-page: the template has no <!-- AQUIUI --> … <!-- HASTAAQUIUI --> region')
  if (!html.includes('</head>')) throw new Error('static-site-page: the template has no </head>')
  // Vaadin's region holds a sample <mateu-ui>: the page's root element, with no baseUrl so the meta
  // tag decides. Redwood's is empty: no element = hosted mode.
  const root = /<mateu-ui\b/.test(html.slice(from, to))
    ? '<mateu-ui style="width: 100%; height: 100vh;"></mateu-ui>'
    : ''
  html = html.slice(0, from) + root + html.slice(to + '<!-- HASTAAQUIUI -->'.length)
  html = html.replace('<!-- AQUIFAVICON -->', DEFAULT_FAVICON)
  for (const m of MARKERS) html = html.split(m).join('')
  html = html.split('AQUIELTITULODELAPAGINA').join(DEFAULT_TITLE)
  // the parked boot, as ordinary scripts (no replayer here): parser-ordered, like the replayer's
  html = html.replace(/<script\b([^>]*)\btype="text\/mateu-deferred"([^>]*)>/g, (_, before, after) =>
    `<script${(' ' + before.trim() + ' ' + after.trim()).replace(/\s+/g, ' ').replace(/\sdata-src=/, ' src=').replace(/\s+$/, '')}>`)
  // right after the title: the first thing someone editing the page sees
  html = html.replace(/(<title>[^<]*<\/title>)/, '$1' + BACKEND_HEAD)
  if (!html.includes(`name="${BACKEND_META}"`)) throw new Error('static-site-page: the template has no <title>')
  return html
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2)
  if (!input || !output) {
    console.error('usage: node scripts/static-site-page.mjs <_index.html> <index.html>')
    process.exit(2)
  }
  writeFileSync(output, staticSitePage(readFileSync(input, 'utf8')))
  console.log(`static-site-page: ${input} -> ${output}`)
}
