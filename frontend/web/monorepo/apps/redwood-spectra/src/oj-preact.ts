/**
 * Oracle JET preact (`oj-c-*`) component CSS.
 *
 * The `oj-c-*` widgets are preact VComponents whose CSS Oracle EXTERNALIZES from the AMD JS bundles
 * — so loading the components from the CDN upgrades them but leaves them UNSTYLED (bare native look).
 * The styles live only in the npm package `@oracle/oraclejet-preact`; aggregate them here so every
 * control is themed. We render in LIGHT DOM (index.ts → setUseShadowRoot(false)), so this
 * document-level CSS reaches the controls.
 *
 * Layers: (1) Theme-redwood/theme.css = the base design tokens the component variants reference,
 * (2) global.css = html/body from those tokens, (3) every `amd/*.styles*.css` = the per-component
 * variant classes the rendered elements carry (their hashed class names must match the CDN JS build
 * — keep the npm version's major.minor in lockstep with JET_BASE in oj-bootstrap.ts).
 */
// NB: import via the package's EXPORTED specifiers (its exports map resolves these to es/*, and the
// `amd/*` paths are NOT exported so a bundler rejects them).
import '@oracle/oraclejet-preact/Theme-redwood/theme.css'
import '@oracle/oraclejet-preact/global.css'
