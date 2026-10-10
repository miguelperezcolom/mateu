# Third-party dependency advisories

Dependabot tracks the advisories of every manifest in this repository. This file records the ones
that are **not fixed by an upgrade**, with the reason, so they can be dismissed on GitHub with that
reason — and the **overrides** we carry to fix the rest, so nobody removes one by accident.

Last reviewed: 2026-10-10 (GA dependency sweep).

## Open advisories we cannot fix by upgrading

None of these reaches a shipped artifact: they live in build or dev-server tooling that runs on a
developer machine or in CI, against our own inputs, and never in a Mateu app's runtime.

### `frontend/web/monorepo` — the Oracle Visual Builder grunt tooling of `apps/redwood`

`apps/redwood` builds the Redwood renderer with Oracle's own `@oracle/grunt-vb-build` and
`@oracle/grunt-vb-audit`, which are tarballs pinned to Oracle's CDN (`static.oracle.com`): we cannot
upgrade their dependencies, only override them, and Oracle's tooling is not ours to patch. Everything
below is `dev: true` in the lockfile — it runs only when someone runs `npm run build` / `serve` in
`apps/redwood`; the renderer we ship (the `io.mateu:mateu-redwood` jar) is the OUTPUT of that build, with
none of these packages in it.

| Alert | Package | Advisory | Why it stays |
|---|---|---|---|
| #505 | `request` 2.88.2 | GHSA-p8p7-x288-28g6 (SSRF on redirects) | No patched version exists (the package is deprecated). Pulled by `@oracle/grunt-vb-audit`, which only talks to Oracle VB endpoints the developer configures. |
| #523 | `uuid` 3.4.0 | GHSA-w5hq-g745-h8pq (v3/v5/v6 with a caller buffer) | Only `request` uses it, through the deep import `uuid/v4`, which uuid ≥ 7 no longer exports — overriding it to the patched 11.1.1 breaks `request` at load. `request` only calls v4 without a buffer, which is not the vulnerable path. |
| #581, #612 | `extract-zip` 2.0.1 | GHSA-jmr9-qjv8-65gv, GHSA-7pqw-9j4j-h8q3 (symlink path traversal) | No patched version exists. Pulled by `puppeteer-core` 13 (via `pwa-asset-generator` in grunt-vb-build) to unpack a browser download; never fed an untrusted archive. |
| #504 | `jszip` 2.7.0 | GHSA-36fh-84j7-cv5h (path traversal via `loadAsync`) | Pinned by `grunt-zip` 0.20 inside grunt-vb-build, which uses the jszip 2 API (`new JSZip(data)`, `generate()`) that jszip 3 removed — an override would break the zip tasks. jszip 2 has no `loadAsync`; the tooling only (un)zips build artifacts it produced itself. The other two jszip copies (3.10.x) are already outside the range. |
| #588 | `decode-uri-component` 0.2.2 | GHSA-vcc3-ghjq-m6fr (DoS on malformed input) | The patched 0.5.0 is ESM-only; its consumer (`source-map-resolve` 0.5, via `snapdragon` → `micromatch` 3 → `globby` 9 → `cpy` in grunt-vb-audit) `require()`s it. It only decodes source-map URLs of our own files. |
| #758 | `sprintf-js` 1.0.3 / 1.1.3 | GHSA-hp3w-g68c-fv3c (DoS via unbounded precision) | No patched version exists (1.1.3 is the latest). Pulled by `grunt` itself (via `argparse` and `underscore.string`) to format its own log lines. |

### `frontend/app/react-native` — Expo CLI

| Alert | Package | Advisory | Why it stays |
|---|---|---|---|
| #708 | `node-forge` 1.4.0 | GHSA-86w9-cpqp-85rv (lenient PKCS#1 v1.5 signature check) | No patched version exists (1.4.0 is the latest). Pulled by `@expo/cli` and `@expo/code-signing-certificates` (expo-updates) — dev-server certificates and code-signing of EAS updates, which this app does not use. Not in the JS bundle of the app. |
| #709 | `braces` 3.0.3 | GHSA-vfj7-8cjw-p6xm (stack exhaustion on deeply nested patterns) | No patched version exists (3.0.3 is the latest). Pulled by `metro-file-map` → `micromatch` 4 (Expo's bundler), which only expands the bundler's own glob patterns. Not in the JS bundle of the app. |

(The same `braces` advisory appears in `npm audit` of `frontend/app/vscode-extension` through
vitest's tooling — dev-only, same reason.)

## Overrides we carry

npm `overrides` force a transitive dependency to a patched version when the package that pulls it
has not moved yet. Remove one only when `npm ls <package>` shows every path already on a fixed
version without it. Each one is also noted in the manifest's `"//overrides"` key.

### `frontend/web/monorepo/package.json`

| Override | Alerts | Pulled by |
|---|---|---|
| `source-map-js` ^1.2.2 | #756 | postcss / css-tree (vite, jsdom, grunt-vb-build) |
| `proxy-addr` ^2.0.8 | #755 | express 4 (grunt-vb-build dev server) |
| `undici` ^7.29.1 | #677 #679 #680 #683 #684 #685 | jsdom (vitest environment) |
| `adm-zip` ^0.6.1 | #528 #629 #657 #710 #714 | grunt-contrib-compress (grunt-vb-build) |
| `lodash` ^4.18.1 | #326 #327 #516 | grunt, grunt-contrib-compress |
| `http-cache-semantics` ^4.3.0 | #739 | got 12 → cacheable-request (grunt-vb-build) |
| `js-yaml@<3.15.2` → ^3.15.2 | #527 #529 #575 #653 | grunt-vb-audit |
| `minimatch@<3.1.3` → ^3.1.5 | #520 | grunt-vb-audit, globule, recursive-readdir |
| `brace-expansion` (1.x ^1.1.21, 2.x ^2.1.7, 5.x ^5.0.12) | #721 #722 #723 | the minimatch copies above and eslint / vite-plugin-dts |
| `braces@<3.0.3` → ^3.0.3 | #507 | micromatch 3 (grunt-vb-audit → cpy → globby 9) |
| `form-data@<2.5.6` → ^2.5.6 | #512 #526 | request (grunt-vb-audit) |
| `qs@<6.14.1` → ^6.14.1 | #514 | request |
| `tough-cookie@<4.1.3` → ^4.1.3 | #506 | request |
| `tar-fs@<2.1.4` → ^2.1.4 | #510 #511 #513 | puppeteer-core 13 (grunt-vb-build) |
| `ws@>=8.0.0 <8.21.0` → ^8.21.0 | #508 #525 | puppeteer-core 13 |
| `serialize-javascript` ^7.0.5 | #521 #524 | mocha 10, rollup-plugin-terser (workbox-build) in grunt-vb-build |

Verified with the Redwood suites (`npm test`) and `npm run build` in `apps/redwood`, which still
produces `build/optimized` including its compress tasks.

### `doc/package.json`

| Override | Alerts | Pulled by |
|---|---|---|
| `postcss-selector-parser` ^7.1.6 | #741 | `postcss-nested` 6 in expressive-code (Starlight's code blocks), which still asks for ^6 |
