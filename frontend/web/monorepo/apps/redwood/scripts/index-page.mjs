// Mateu — Apache License 2.0 (LICENSE.txt at the repository root)
//
// The page the renderer jar ships (static/_index.html), written by Mateu.
//
// The Visual Builder build (grunt vb-build) emits an index.html of its own: the development page
// plus the markup the tool injects to boot the runtime. The jar does NOT ship that file. It ships
// the page below, and the build output is only READ for the facts the page needs, which the build
// is the authority on: the CDN urls of the theme and of the runtime scripts (their versions follow
// the installed tooling) and the module bundle map require.js needs to find the app's modules.
// Every one of those facts is a url, a module id or a configuration value — no markup of the tool
// travels.
//
// What the page must do, and the markers the Mateu controllers rely on (core IndexPage, .NET
// UiPage, Python ui_page, the bundle writer):
//  - <base href="/">: served at a deep route (/checkin/3) the relative assets still resolve from
//    the root. The visual-runtime derives its MODULE base from location.pathname and ignores
//    <base>, hence the absolute vbInitConfig.BASE_URL as well.
//  - <!-- AQUIKEYCLOAK -->: where a @KeycloakSecured UI's token script goes (refused without it).
//  - AQUIELTITULODELAPAGINA: the app title, stamped by the controller.
//  - <!-- AQUIJS --> … <!-- HASTAAQUIJS -->: the boot, parked as type="text/mateu-deferred" (src in
//    data-src, so nothing is even fetched) and replayed IN ORDER by the controller's replayer once
//    there is a session: require.js → JET's bundle config → the runtime's third-party libraries →
//    the app's require config → the visual-runtime.
//  - <!-- AQUIUI --><!-- HASTAAQUIUI -->: replaced by the <mateu-ui> element, which here renders
//    nothing (display:none) and only CARRIES the @UI mount the bridge reads (poc/mount.mjs).

const fail = (what) => {
  throw new Error(`index-page: ${what} not found in the VB build's index.html — did the build change its output?`)
}

/** Balanced `{…}` starting at `from` (which must point at `{`), skipping string literals. */
const objectAt = (text, from) => {
  let depth = 0
  let quote = null
  for (let i = from; i < text.length; i++) {
    const c = text[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'") quote = c
    else if (c === '{') depth++
    else if (c === '}' && --depth === 0) return text.slice(from, i + 1)
  }
  return fail('the end of the bundle map')
}

/** The facts the page needs, read off the build's own index.html. */
export const readBuildFacts = (html) => {
  const stylesheets = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => ({
      rel: /\brel="([^"]*)"/.exec(tag)?.[1],
      href: /\bhref="([^"]*)"/.exec(tag)?.[1],
      id: /\bid="([^"]*)"/.exec(tag)?.[1],
    }))
    .filter((l) => l.rel === 'stylesheet' && /^https:\/\//.test(l.href ?? ''))
  if (!stylesheets.length) fail('the theme stylesheets')

  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="(https:\/\/[^"]+)"[^>]*>/g)].map((m) => m[1])
  const runtime = scripts.find((u) => /\/visual-runtime\.js$/.test(u)) ?? fail('the visual-runtime script')
  const libraries = scripts.filter((u) => u !== runtime)
  if (!libraries.some((u) => /\/require\.js$/.test(u))) fail('require.js')

  // the string settings of the runtime configuration object (urls, the app path, the VB host's
  // own placeholders); BASE_URL / BASE_URL_TOKEN are the page's to decide
  const initAt = html.indexOf('vbInitConfig')
  if (initAt < 0) fail('the runtime configuration')
  const init = objectAt(html, html.indexOf('{', initAt))
  const settings = {}
  for (const [, key, value] of init.matchAll(/\b([A-Z][A-Z0-9_]*)\s*:\s*'([^']*)'/g)) {
    if (key !== 'BASE_URL' && key !== 'BASE_URL_TOKEN') settings[key] = value
  }
  if (!settings.JET_URL) fail('JET_URL')

  const bundlesAt = html.indexOf('{"bundles"')
  if (bundlesAt < 0) fail('the module bundle map')
  const requireConfig = JSON.parse(objectAt(html, bundlesAt))

  return { stylesheets, libraries, runtime, settings, requireConfig }
}

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
// a value inside an inline <script>: JSON, with `<` escaped so no `</script>` can close it
const js = (v) => JSON.stringify(v).replace(/</g, '\\u003c')
// the runtime configuration as a readable object literal, one `KEY: 'value'` per line (hosts that
// re-anchor the page, like the visual editor's canvas, rewrite `BASE_URL: '…'` in place)
const quoted = (v) => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/</g, '\\u003c') + "'"
const objectLiteral = (o, indent) => '{\n' + Object.entries(o)
  .map(([k, v]) => `${indent}  ${k}: ${typeof v === 'string' ? quoted(v) : js(v)},`).join('\n') + `\n${indent}}`

/**
 * The page. `appDir` is the folder the app is served from (relative to the root), `hash` the
 * source hash appended to the app's own modules for cache busting (CDN urls are left alone).
 */
export const indexPage = ({ stylesheets, libraries, runtime, settings, requireConfig }, { appDir, hash }) => {
  const runtimeConfig = {
    ...settings,
    DEBUG: false,
    IS_DT_MODE: false,
    TRACE_CONFIG: {},
    BASE_URL: `/${appDir}/`,
    BASE_URL_TOKEN: appDir,
    INJECTED: { security: {} },
  }
  const parked = (src, extra = '') => `    <script type="text/mateu-deferred" data-src="${attr(src)}"${extra}></script>`
  return `<!-- Mateu — Apache License 2.0. Written by scripts/copy.mjs (apps/redwood/scripts/index-page.mjs). -->
<!DOCTYPE html>
<html class="oj-html" lang="en">
  <head>
    <base href="/">
    <!-- AQUIKEYCLOAK -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AQUIELTITULODELAPAGINA</title>
    <link rel="preconnect" href="https://static.oracle.com">
${stylesheets.map((s) => `    <link rel="stylesheet" type="text/css" href="${attr(s.href)}"${s.id ? ` id="${attr(s.id)}"` : ''}>`).join('\n')}
    <link rel="stylesheet" href="${appDir}/resources/css/app.css?v=${hash}">
    <style>mateu-ui { display: none !important; }
      /* until Visual Builder mounts the app (Oracle's CDN is still downloading): Redwood's loader, the
         large indeterminate progress circle — the very markup JET renders for oj-progress-circle, styled
         by oj-redwood-min.css above, which arrives before any script. Gone as soon as VB fills
         oj-vb-content. */
      .mateu-boot-loader { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
      oj-vb-content:not(:empty) + .mateu-boot-loader { display: none; }</style>
  </head>
  <body class="oj-body">
    <oj-vb-content config="[[vbApplication]]"></oj-vb-content>
    <div class="mateu-boot-loader" role="progressbar" aria-valuetext="Loading">
      <div class="oj-progress-circle oj-progress-circle-lg"><div class="oj-progress-circle-indeterminate"><div class="oj-progress-circle-indeterminate-inner"></div></div></div>
    </div>
    <noscript>
      <style>.mateu-boot-loader { display: none; }</style>
      <p style="font: 18px/1.5 system-ui, sans-serif; max-width: 40rem; margin: 20vh auto;">This application needs JavaScript. Please turn it on in your browser and reload the page.</p>
    </noscript>
    <!-- AQUIJS -->
    <script type="text/mateu-deferred">
      // the query the page was opened with (e.g. a listing's filters), kept before the VB router
      // removes it from the URL while starting
      window.__mateuInitialSearch = window.location.search || '';
    </script>
    <script type="text/mateu-deferred">
      // the interface language follows the browser, as in the Vaadin renderer: the runtime, JET's
      // own texts and the bridge's chrome catalogue (poc/i18n.mjs) all read it
      document.documentElement.lang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
      window.vbInitParams = Object.assign(window.vbInitParams || {}, { locale: document.documentElement.lang });
      window.vbInitConfig = ${objectLiteral(runtimeConfig, '      ')};
    </script>
${libraries.map((u) => parked(u, /third-party/.test(u) ? ' charset="UTF-8"' : '')).join('\n')}
    <script type="text/mateu-deferred" id="vb-require-bundles-config">
      // the app's own modules carry ?v=<source hash>; absolute (CDN) urls are left alone
      require.config({ urlArgs: function (id, url) { return /^(https?:)?\\/\\//.test(url) ? '' : (url.indexOf('?') < 0 ? '?' : '&') + 'v=${hash}'; } });
      // ?vb.bundles=none loads every module on its own (debugging)
      if (!/[?&]vb\\.bundles=none(&|#|$)/.test(window.location.href)) { require.config(${js(requireConfig)}); }
    </script>
${parked(runtime, ' id="vbrt"')}
    <!-- HASTAAQUIJS -->
    <!-- AQUIUI --><!-- HASTAAQUIUI -->
  </body>
</html>
`
}
