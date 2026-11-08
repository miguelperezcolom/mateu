# Third-party dependency advisories

Dependabot tracks the advisories of every manifest in this repository. This file records the ones
that are **not fixed by an upgrade**, with the reason, so they can be dismissed on GitHub with that
reason — and the **overrides** we carry to fix the rest, so nobody removes one by accident.

Last reviewed: 2026-11-08 (GA hygiene: the build-tooling alerts below were re-checked against the
lockfiles and the registry — none has a patched release inside the major its dependents accept).
Before that: 2026-10-19 (pre-GA review 3). The web monorepo was re-checked over a full install
(`npm ci` at `frontend/web/monorepo`, `npm ls <package> --all` per entry, and for each override every
range the lockfile's packages declare for it, resolved against the registry): the open advisories
below are all still present at the versions listed, and the overrides that no longer change anything
were removed (see "Removed overrides"). The React Native and doc entries were not re-checked.

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
| #793 | `decode-uri-component` 0.2.2 | GHSA-qr28-fpjm-wq7f (quadratic percent-decoding) | Same copy and same reason as #588: the patched 0.5.1 is ESM-only and `source-map-resolve` `require()`s it. |
| #758 | `sprintf-js` 1.0.3 / 1.1.3 | GHSA-hp3w-g68c-fv3c (DoS via unbounded precision) | No patched version exists (1.1.3 is the latest). Pulled by `grunt` itself (via `argparse` and `underscore.string`) to format its own log lines. |

### `frontend/web/monorepo` — lint and dev-server tooling

| Alert | Package | Advisory | Why it stays |
|---|---|---|---|
| #814 | `minimatch` 9.0.9 / 10.2.6 | GHSA-g3hv-75wg-m249 (DoS via globparts amplification) | Fixed only in 11.0.1, a major no dependent accepts: `eslint` 10 and `@eslint/config-array` (`^10.2.4`), `typescript-eslint` (`^10.2.2`), `glob` 10/11, `editorconfig`/`js-beautify` and `@oracle/grunt-vb-build` (`^9`). All `dev: true` — lint and the Redwood build, matching our own patterns. |
| #792 | `deepmerge` 4.3.1 | GHSA-gcqx-w48m-w2h4 (prototype poisoning in `mergeObject`) | No patched version exists. Pulled by `@rollup/plugin-node-resolve` (workbox-build in grunt-vb-build, and `@web/dev-server-rollup`) and `@web/dev-server`. Dependabot calls it *runtime* only because `vcf-date-range-picker` lists its dev server as a dependency; Vite never bundles it (it is `NOT_BUNDLED` in `scripts/check-frontend-licenses.mjs`) and it only merges the dev server's own config. |

### `frontend/app/react-native` — Expo CLI

| Alert | Package | Advisory | Why it stays |
|---|---|---|---|
| #708 | `node-forge` 1.4.0 | GHSA-86w9-cpqp-85rv (lenient PKCS#1 v1.5 signature check) | No patched version exists (1.4.0 is the latest). Pulled by `@expo/cli` and `@expo/code-signing-certificates` (expo-updates) — dev-server certificates and code-signing of EAS updates, which this app does not use. Not in the JS bundle of the app. |
| #812 | `minimatch` 10.2.6 | GHSA-g3hv-75wg-m249 | Fixed only in 11.0.1; `@expo/fingerprint` and `glob` 13 ask for `^10.2.2`. Build time only (fingerprinting and globbing of the project's own files). |
| #805 | `glob` 13.0.6 | GHSA-3g3m-2fjr-6pw4 (AbortSignal cancellation bypass) | Fixed only in 14.0.2; every dependent asks for `^13.0.0` (`@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/fingerprint`, `@expo/metro-config`, and `expo-updates`' config plugin / CLI). Build time only, and none of them passes an AbortSignal it relies on to stop a walk of untrusted paths. |
| #766 | `zod` 3.25.76 | GHSA-mrhx-c7xc-m3w5 (memory exhaustion on oversized collections) | Fixed only in 4.6.6; `@expo/cli` asks for `^3.25.76`. It validates the CLI's own config / API answers on the developer's machine. |
| #785 | `deepmerge` 4.3.1 | GHSA-gcqx-w48m-w2h4 | No patched version exists. Pulled by `@expo/config` (merges the app's own app.json/app.config). The copy the app ships with (`@callstack/react-theme-provider`, react-native-paper) is deepmerge 3.3.0, outside the affected range. |
| #709 | `braces` 3.0.3 | GHSA-vfj7-8cjw-p6xm (stack exhaustion on deeply nested patterns) | No patched version exists (3.0.3 is the latest). Pulled by `metro-file-map` → `micromatch` 4 (Expo's bundler), which only expands the bundler's own glob patterns. Not in the JS bundle of the app. |

None of the four above is in the JS bundle of the app. Re-check them when moving to the next Expo
SDK: its packages are what would accept the fixed majors (`npx expo install --fix`).

(The same `braces` advisory appears in `npm audit` of `frontend/app/vscode-extension` through
vitest's tooling — dev-only, same reason.)

### `frontend/app/vscode-extension` — packaging tooling

| Alert | Package | Advisory | Why it stays |
|---|---|---|---|
| #813 | `minimatch` 10.2.6 | GHSA-g3hv-75wg-m249 | Fixed only in 11.0.1; `@vscode/vsce` 3 and `glob` 13 ask for `^10.2.2` (vsce 4 is a major, not taken before GA). `dev: true` — vsce packages and publishes the `.vsix`; nothing of it ships inside. |

## Overrides we carry

npm `overrides` force a transitive dependency to a patched version when the package that pulls it
has not moved yet. Remove one only when `npm ls <package>` shows every path already on a fixed
version without it. Each one is also noted in the manifest's `"//overrides"` key.

### `frontend/web/monorepo/package.json`

| Override | Alerts | Pulled by |
|---|---|---|
| `adm-zip` ^0.6.1 | #528 #629 #657 #710 #714 | grunt-contrib-compress (grunt-vb-build) |
| `lodash` ^4.18.1 | #326 #327 #516 | grunt, grunt-contrib-compress |
| `js-yaml@<3.15.2` → ^3.15.2 | #527 #529 #575 #653 | grunt-vb-audit |
| `minimatch@<3.1.3` → ^3.1.5 | #520 | grunt-vb-audit, globule, recursive-readdir |
| `braces@<3.0.3` → ^3.0.3 | #507 | micromatch 3 (grunt-vb-audit → cpy → globby 9) |
| `form-data@<2.5.6` → ^2.5.6 | #512 #526 | request (grunt-vb-audit) |
| `qs@<6.14.1` → ^6.14.1 | #514 | request |
| `tough-cookie@<4.1.3` → ^4.1.3 | #506 | request |
| `tar-fs@<2.1.4` → ^2.1.4 | #510 #511 #513 | puppeteer-core 13 (grunt-vb-build) |
| `ws@>=8.0.0 <8.21.0` → ^8.21.0 | #508 #525 | puppeteer-core 13 |
| `serialize-javascript` ^7.1.3 | #521 #524 #784 | mocha 10, rollup-plugin-terser (workbox-build) in grunt-vb-build |

Verified with the Redwood suites (`npm test`) and `npm run build` in `apps/redwood`, which still
produces `build/optimized` including its compress tasks.

Each override above is still needed: at least one package pins a range whose newest version is
vulnerable — `grunt-contrib-compress` asks `adm-zip ^0.5.1`, `@oracle/grunt-vb-audit` pins `lodash
4.17.21`, `grunt` asks `js-yaml ~3.14.0` and `minimatch ~3.0.4` (`globule ~3.0.2`,
`recursive-readdir 3.0.4`), `micromatch` 2 asks `braces ^2.3.1`, `request` asks `form-data ~2.3.2`,
`qs ~6.5.2` and `tough-cookie ~2.5.0`, `puppeteer-core` 13 pins `tar-fs 2.1.1` and `ws 8.5.0`, and
`mocha` / `rollup-plugin-terser` ask `serialize-javascript ^6.0.2` / `^4.0.0`.

The other two entries of `overrides` (and `resolutions`) are not security: `@vaadin/*` ~25.3.3 keeps
every Vaadin component on one release.

#### Removed overrides (2026-10-19)

No longer change the install — every range in the tree already reaches a fixed version (or nothing
depends on the package), and removing them leaves `package-lock.json` byte-identical:

| Override | Alerts | Why it went |
|---|---|---|
| `source-map-js` ^1.2.2 | #756 | every dependent range reaches 1.2.2 |
| `proxy-addr` ^2.0.8 | #755 | express 4's range reaches 2.0.8 |
| `undici` ^7.29.1 | #677 #679 #680 #683 #684 #685 | jsdom's range reaches 7.30 |
| `http-cache-semantics` ^4.3.0 | #739 | cacheable-request's range reaches 4.3.0 |
| `brace-expansion` (1.x, 2.x, 5.x) | #721 #722 #723 | every minimatch copy's range reaches a fixed version |
| `esbuild` ^0.28.1 (also in `resolutions`) | — (alignment, never security) | esbuild is no longer in the tree (Vite 8 does not use it; only optional peers name it) |

### `doc/package.json`

| Override | Alerts | Pulled by |
|---|---|---|
| `postcss-selector-parser` ^7.1.6 | #741 | `postcss-nested` 6 in expressive-code (Starlight's code blocks), which still asks for ^6 |
