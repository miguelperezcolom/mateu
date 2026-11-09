# Performance baseline — 2026-11 (before 3.0 GA)

What a Mateu app costs a user and a server, measured on master at `fcba5e110` (+ the fixes of
branch `perf/ga-baseline`), the two clear wins it found, and the budgets that keep them from
coming back. Numbers are medians unless said otherwise.

## Machine and method

- Apple M3 Max (10 performance + 4 efficiency cores), 36 GB, macOS 15.6.1. Corretto 26.0.2
  (`-Xmx1g`, G1), .NET 8.0.30, Python 3.14.3 (uvicorn 0.54, one worker), Node 23.7,
  Playwright 1.62 / Chromium.
- **The machine was shared**: other agents built and tested in parallel (load average 10–16 on 14
  cores throughout). Single-request latencies and the in-JVM A/B below are stable; the 10/50
  concurrency cells of the load loop are indicative only (±50% between runs). That is also why no
  latency gate was added to CI — see [Budgets](#budgets-in-ci).
- **First load** — `e2e/first-load-probe.mjs`: a fresh browser context per run (cold cache, cache
  disabled), viewport 412×915, throttled through the DevTools protocol to **Fast 3G** (150 ms RTT,
  1.6 Mbit/s down, 750 kbit/s up) **and 4× CPU slowdown** (Lighthouse's mobile profile). Median of
  3 runs. *Content* (our "first meaningful paint") = the first moment a string only the route's
  own content shows (a column header, a record value — passed per URL) is in the rendered DOM,
  found by a walk that pierces shadow roots, polled every 50 ms. TTFB is Navigation Timing (Chrome
  does not add its emulated latency there, so it is the server's own time: 2–6 ms everywhere).
- **Server** — `e2e/sync-latency-probe.mjs`: a browser drives the real screens once and records
  every `POST /mateu/v3/sync` the renderer sends (`capture`); the load loop replays each one warm
  (300 requests first) with 1, 10 and 50 concurrent loops for 8 s (`run`). Java: the e2e SUT
  (`mvc-app1`, `webflux-app1`, `quarkus-app1`) — `/full-crud` listing load, its search, opening a
  record, saving it, and a `/wizard` step. Ports: the `starters/dotnet` and `starters/python`
  Products CRUD (listing load, search, open, save). The load generator is ONE Node process, which
  caps the fastest cells (~15–17 k req/s).
- **Profiles** — async-profiler (`asprof`, shipped with Corretto) `-e cpu -i 1ms` for 15 s under a
  10-way listing-load loop on `mvc-app1`; Python `cProfile` over 600 in-process requests.
- **In-JVM A/B** — `RequestBudgetTest` with `-Dmateu.perf.timing=true` (p50 of 1000 warm requests
  per scenario, single thread), run twice on the old sources and twice on the new ones,
  back-to-back.

## 1. Web first load

### Vaadin renderer — Fast 3G + 4× CPU

| Route | Content (before → after) | JS on the wire | All bytes | Requests | TBT |
|---|---|---|---|---|---|
| demo-admin-panel `/` (arrivals listing) | **14.4 s → 4.6 s** | 2675 KB → 654 KB | 2719 KB → 698 KB | 16 | 234 → 201 ms |
| demo-starwars `/` (YAML welcome) ¹ | **14.0 s → 4.4 s** | 2588 KB → 642 KB | 2657 KB → 706 KB | 12 | 269 → 241 ms |
| demo-starwars `/people` (YAML listing over swapi.mateu.io) ¹ | **14.6 s → 5.0 s** | 2588 KB → 642 KB | 2723 KB → 772 KB | 33 | 457 → 408 ms |
| e2e SUT mvc `/products` | **14.3 s → 4.6 s** | 2633 KB → 642 KB | 2662 KB → 671 KB | 12 | 291 → 289 ms |
| e2e SUT webflux `/full-crud` | — → 4.6 s | — → 641 KB | — → 671 KB | 12 | 304 ms |
| e2e SUT quarkus `/full-crud` | — → 4.6 s | — → 641 KB | — → 671 KB | 12 | 296 ms |
| demo-static-vcn Java bundle `/vcns` ² | 14.3 s | 2632 KB | 2691 KB | 11 | 431 ms |
| demo-static-vcn YAML bundle `/vcns` ² | 14.1 s | 2632 KB | 2646 KB | 11 | 363 ms |

¹ "before" is the published `3.0-beta.32` renderer the demo pins; "after" is this branch.
² Served by `serve-static.mjs`, a dumb file server with no compression — on a real static host
(CDN, nginx `gzip_static`, Netlify, S3+CloudFront) the host compresses and the numbers follow the
"after" rows. Not changed here.

Unthrottled (same machine, after): content in 145 ms (admin), 161 ms (SUT), 148/153 ms (static
bundles), 551 ms (`/people`, which waits on a public API). FCP ≈ content on every Vaadin route:
the page paints nothing until its bundle runs (see [What is left](#what-is-left)).

### Redwood (VB) renderer — demo-vb `/products`

| | Content | All bytes | of which Oracle's CDN | Mateu's own | Requests |
|---|---|---|---|---|---|
| unthrottled, before (compression off) | 1.66 s | 9972 KB | 4641 KB | **5331 KB** | 78 |
| unthrottled, after | 1.72 s | 5428 KB | 4641 KB | **787 KB** | 78 |
| Fast 3G + 4× CPU, before | **did not render within 400 s** (1 run) | | | | |
| Fast 3G + 4× CPU, after | **29.3 s** (1 run) | 5427 KB | 4641 KB | 786 KB | 77 |

"Before" is the same build with `-Dmateu.static-assets.compression=false`. 85% of what a Redwood
page now downloads is Oracle's JET/Spectra/VB runtime from `static.oracle.com`, which Mateu does
not control (and must not vendor — `NOTICE.md`); 78 requests are mostly its AMD modules.

## 2. Server — `POST /mateu/v3/sync`

### In-JVM A/B (single thread, p50 of 1000 warm requests, µs) — `RequestBudgetTest`

| Scenario | before (2 runs) | after (2 runs) | |
|---|---|---|---|
| simple form | 1209 / 1198 | 550 / 608 | **2.1×** |
| CRUD listing | 1034 / 991 | 792 / 558 ³ | **~1.9×** |
| CRUD search | 166 / 169 | 197 / 158 | = |
| app shell | 533 / 521 | 257 / 235 | **2.1×** |
| wizard step | 1591 / 1442 | 648 / 727 | **2.1×** |

³ The first "after" run of a cell sometimes lands on a busy core; the earlier full run of the test
gave 477 µs.

### Load loop, Java adapters (p50 / p95 ms, req/s)

Quarkus (the cleanest pair of runs):

| Action | conc | before | after |
|---|---:|---|---|
| listing load | 1 | 1.2 / 1.9 · 771 | 1.3 / 5.6 · 490 ⁴ |
| listing load | 10 | 1.5 / 2.4 · 6304 | 0.7 / 2.6 · **9363** |
| listing load | 50 | 7.1 / 12.7 · 6666 | 3.9 / 18.0 · 8049 |
| search | 10 | 0.5 / 1.6 · 16929 | 0.5 / 1.8 · 14603 |
| open a record | 1 | 1.0 / 1.3 · 964 | 0.4 / 0.8 · **1924** |
| open a record | 10 | 1.5 / 2.3 · 6253 | 0.6 / 2.0 · **11291** |
| open a record | 50 | 7.3 / 13.2 · 6454 | 3.1 / 7.5 · **12569** |
| save | 10 | 0.5 / 1.7 · 16798 | 0.5 / 1.8 · 14942 |
| wizard step | 1 | 1.9 / 2.5 · 492 | 0.7 / 1.2 · **1280** |
| wizard step | 10 | 2.8 / 4.1 · 3422 | 0.8 / 3.0 · **8297** |
| wizard step | 50 | 13.4 / 24.5 · 3471 | 6.6 / 18.8 · 6251 |

⁴ noise: the identical work on the other adapters went 1.3 → 0.6–0.8 ms.

Before, Spring MVC / WebFlux (same actions): listing load 1.3 / 1.8 ms single, 4350 / 5079 req/s
at 10, 5416 / 6796 at 50; record 1.5 / 1.3 ms; save 0.4 / 0.3 ms; wizard step 2.2 / 1.8 ms. After,
on the profiled MVC run (10 concurrent listing loads + searches): **12 323 req/s at p50 0.6 ms**
(4350 before). The "after" load-loop runs of MVC and WebFlux were taken while other builds ran on
the machine and are not comparable cell by cell — the in-JVM A/B above is the clean comparison.
Search and save, whose answers are small (0.7 KB) and carry no component tree, are unchanged —
as expected, the fix is in the walk of the component tree.

Response sizes (raw JSON): listing load 9.2–9.6 KB, record 9.2–9.6 KB, wizard step 8.6 KB,
search 0.7 KB, save 0.7 KB. The 53 corpus screens: 3–15 KB each (`toc` the largest), 279 KB in all.

### Ports (starters' Products CRUD, p50 / p95 ms, req/s)

| Action | conc | .NET (before = after) | Python before | Python after |
|---|---:|---|---|---|
| listing load | 1 | 0.7 / 1.3 · 1197 | 1.6 / 3.5 · 526 | 1.2 / 1.9 · **761** |
| listing load | 10 | 0.9 / 2.2 · 9097 | 11.8 / 16.4 · 819 | 9.2 / 16.1 · **988** |
| listing load | 50 | 3.6 / 7.3 · 12592 | 56.9 / 73.4 · 856 | 42.6 / 68.4 · **1097** |
| search | 10 | 0.5 / 1.8 · 14984 | 3.7 / 5.4 · 2553 | 3.3 / 4.4 · 2932 |
| open a record | 1 | 0.7 / 1.3 · 1167 | 2.1 / 9.3 · 302 | 1.1 / 1.6 · **842** |
| open a record | 10 | 0.8 / 2.4 · 9018 | 12.8 / 24.9 · 682 | 8.4 / 11.4 · **1158** |
| open a record | 50 | 5.2 / 12.7 · 8079 | 57.0 / 76.7 · 854 | 41.5 / 51.9 · **1188** |
| save | 10 | 0.5 / 2.7 · 10835 | 4.6 / 5.9 · 2133 | 3.2 / 4.2 · 3013 |

Python is one uvicorn worker (the GIL): its ceiling is ~1 k req/s per worker for a screen load;
run several workers (`uvicorn --workers N` / gunicorn) for more. .NET's save at 50 concurrent
(5096 req/s, p95 31.6 ms) is the one cell worth a second look.

### Heap

Mateu keeps no per-session state on the server (a view model is rebuilt per request). After
~2 M requests and a full GC: MVC 48 MB used, WebFlux 64 MB, Quarkus 23 MB; a freshly started MVC
after 1 k warm requests: 44 MB. No growth.

## 3. What the profiles found, and the fixes

### Fix 1 — Mateu's assets were served uncompressed (every adapter, both ports)

`curl -H 'Accept-Encoding: gzip'` on `/assets/vendor-vaadin.js` answered 1 452 981 bytes on MVC,
WebFlux, Quarkus and Helidon: Spring Boot and Quarkus only compress when the APP turns response
compression on, Helidon's static handler needs an encoding module, and the ports' `MATEU_UI`
serving wrote the bytes as read. Micronaut was the exception (Netty compresses by default).

- Core `io.mateu.core.infra.AssetCompression`: gzip (best level) of Mateu's TEXT assets ≥ 1 KB,
  once per asset and process, kept in a bounded in-memory cache (64 MB) keyed by location, size
  and modification time; `Vary: Accept-Encoding`; the gzip variant gets its own validator
  (`W/"…-gzip"`), so revalidations stay 304s. Off with `mateu.static-assets.compression=false`.
- Spring MVC and WebFlux: `MateuGzipAssetResolver` in the existing `MateuStaticAssetCaching`
  resource chain; Quarkus: `MateuQuarkusRoutes.serveAsset`; Helidon MP: the routing filter answers
  a gzip-accepting asset request itself (`servesGzippedAsset`) — an encoding module would also
  compress the SSE streams; Micronaut: `Vary` added (Netty already compresses). .NET
  (`UiPage.Gzipped`) and Python (`ui_page.gzipped`) do the same when they serve the page.
- Effect: **14.4 s → 4.6 s** to first content on a Fast 3G phone, 2.6 MB → 0.65 MB of JavaScript;
  Redwood's own bytes 5.3 MB → 0.79 MB, and a Redwood page that never finished loading on Fast 3G
  now renders in 29 s.
- Tests: `AssetCompressionTest`; the parity contract `AdapterParityITFoundation.servesTextAssetsGzipped`
  on all five adapters (gzip bytes inflate to the asset, `Vary` on both variants, 304 on the gzip
  validator); `UiServingTests.The_renderers_text_assets_are_gzipped_…` (.NET);
  `test_the_renderers_text_assets_are_gzipped_…` (Python).

### Fix 2 — `Class.getRecordComponents()` on every node of every response (Java)

The CPU profile of a listing load on MVC: **66% of all samples** in
`ReferencedRestSources.apply` (the walk that adds the REST sources a response references), almost
all of it inside the JVM (`InstanceKlass::find_method_index`, symbol-table lookups,
`__psynch_mutexwait`): `getRecordComponents()` is not cached by the JVM and each call resolves
every accessor again — under concurrency it serialises on the VM's locks. Ten of Mateu's generic
wire-record walks called it per node (`TreeActionHarvester`, `AdvertisedActions`,
`FluentHandlerButtons`, `SelfNamingTree`, `SeededYamlPage`, `PageMetadataExtractor`…).

- `io.mateu.core.domain.Records.components(type)`: read once per class (`ClassValue`), accessors
  made accessible once. Every walk goes through it.
- Effect: that walk 66% → 3.7% of the profile; screens with a component tree **~2× faster** single
  threaded (A/B above) and 2–3× the throughput under load.
- Budget: `RequestBudgetTest` now pins **zero record-shape reads per warm request** on its five
  scenarios, and `recordShapesAreReadThroughTheCache` fails on a new direct
  `getRecordComponents()` call in core.

### Fix 3 — Python re-evaluated every annotation on every request

`cProfile` of the Python port: `eval` ran 28 times per request — `reflection._local_hints` called
`inspect.get_annotations(eval_str=True)` for each class of each view, several times per request —
and the referenced-sources walk read every field of every pydantic node (~20% each).

- `_local_hints` resolves once per class (a copy is returned; an annotation that cannot be
  evaluated YET — a forward reference asked for at import time — is not cached).
- The walk skips scalar fields by declared type (`_walkable_fields`, Java's `ComponentRecords`
  rule).
- Effect: Mateu's handler time per request −34%; listing load 1.6 → 1.2 ms, open a record
  2.1 → 1.1 ms, throughput at 10 concurrent +20–70%. Tests: `test_reflection_cache.py`.

### Looked at, not changed (worth a follow-up, each a few % of a request)

- `MetaAnnotations.find` (~12% after fix 2): already cached, but asked ~hundreds of times per
  request; fewer asks, not a faster cache, is the lever.
- `StructureHashPostProcessor.hashOf` (~10%): canonical JSON + SHA-256 of every routed component,
  by design (it is what lets a return visit skip the structure).
- ~~`DefaultRoutedClassResolver` (~8%)~~ and ~~`MateuSettings.get` (~6%)~~ — done, see
  [Follow-ups](#4-follow-ups-2026-11-08).
- .NET: not profiled — it is the fastest backend measured (0.7 ms listing load).

## 4. Follow-ups (2026-11-08)

Same machine and method (the machine still shared with other agents' builds), each measured
before/after back to back.

### Route resolution indexed once (Java)

`DefaultRoutedClassResolver` asked every `RoutedClassProvider` on each `resolve` / `resolveApp` /
`resolveAbsolute` (and `resolveApp` ran `ViewTypeClassifier.isApp` — a walk of the class's fields
— on every one of them BEFORE matching the route). `RoutedClassIndex` is built once per resolver
(= per container) on first use: a route without `:params` is a map key (the one string its
compiled pattern matches), the parameterised ones are still tried in order, and candidates come
back in the providers' order, so "first provider wins" is unchanged; `isApp` only runs on the
classes whose route matched. A broken provider is logged once at index time instead of per request.

In-JVM A/B, a new informational scenario `RequestBudgetTest.printsTheMedianTimeOfAWarmRequestInALargeApp`
(the five scenarios with 200 generated `@UI` classes registered BEFORE the measured ones, settings
from a Spring Boot `Environment` — the e2e SUT's shape), p50 of 1000 warm requests, µs, 2 runs each:

| Scenario | before | after (index) | after (index + settings memo) |
|---|---|---|---|
| simple form | 413 / 411 | 247 / 261 | 288 / 247 |
| CRUD listing | 349 / 375 | 282 / 274 | 296 / 318 |
| CRUD search | 183 / 180 | 128 / 131 | 133 / 145 |
| app shell | 324 / 325 | 194 / 198 | 194 / 201 |
| wizard step | 548 / 579 | 453 / 477 | 547 / 519 |

The small app (4 routed classes) is unchanged within noise (e.g. app shell 238/252 → 231/237).
Budget: `RequestBudgetTest` now also pins **0 routed classes scanned per warm request**
(`DefaultRoutedClassResolver.providersScanned()`); `RoutedClassIndexTest` pins that a literal
route's key matches exactly what its compiled pattern matched, and the providers' order.

### Settings memoised (Java)

`MateuSettings.get` resolved every read through the framework's configuration — Spring's
`Environment` walks each property source with relaxed binding. A warm request reads 2–9 settings
(counted per scenario). The system property is still read live (tests flip them; `-D` still wins);
what the framework configuration and the environment answer is memoised per key, per registered
source (a new/closed container starts a new memo; at most 1024 keys). `MateuSettings.refresh()`
forgets it; the Spring adapters call it on `ContextRefreshedEvent` and on Spring Cloud's
`EnvironmentChangeEvent` (matched by class name, no dependency).

Per read, a Spring Boot-shaped `Environment` (7 property sources, `ConfigurationPropertySources`
attached): **1923 ns → 20 ns**. On the in-JVM scenarios that is ~4–17 µs per request, below this
machine's run-to-run noise (table above); on a real Boot app (more property sources, a large
environment) a read costs more, which is what the async-profiler run of the SUT showed (~6%).

### Ports: validators on the renderer's assets (.NET, Python)

Both ports served `MATEU_UI` assets with `Cache-Control: no-cache` and no validator, so a repeat
visit downloaded every bundle again. They now send Java's `ETag` (`W/"<size-hex>-<mtime-ms-hex>"`,
`-gzip` variant for the gzip encoding — `StaticAssetCaching.weakEtag` / `AssetCompression.gzipEtag`)
and `Last-Modified` (from the file, or the jar entry), and answer `If-None-Match` (which decides
when present) / `If-Modified-Since` with a bodyless `304`. Before: a revalidating repeat visit of
the starter's `/products` = the 15 requests / ~676 KB of the cold load again; after: the same
requests answered 304 with no body. Tests: `UiServingTests.The_renderers_assets_carry_validators_…`
+ `A_jar_entry_carries_validators_too` (.NET), `test_the_renderers_assets_carry_validators_…` (Python).

### Static bundles ship `.gz` siblings

`mateu-bundle:bundle` writes `<file>.gz` (best level, the original's mtime) next to every text file
≥ 1 KB (`AssetCompression.COMPRESSIBLE`); `-Dmateu.bundle.precompress=false` skips it. No Brotli:
the JDK has no encoder and the plugin takes no dependency for it. The demo's `serve-static.mjs`
now serves a `.gz` sibling like nginx `gzip_static on`, and the Redwood demo sites' nginx configs
turn `gzip_static` on.

demo-static-vcn Java bundle `/vcns` (33 files, 4305 KB → 1163 KB as `.gz`), Fast 3G + 4× CPU,
median of 3:

| | Content | FCP | JS on the wire | All bytes |
|---|---|---|---|---|
| before (no `.gz`) | 14.4 s | 14.3 s | 2663 KB | 2722 KB |
| after | **4.3 s** | 4.2 s | 652 KB | 663 KB |

### Vaadin pre-boot loader

`apps/vaadin/index.html` (and the committed `_index.html`) carries a CSS-only loader after the UI
marker region — kept by every server that swaps the region for its `<mateu-ui>` (Java `IndexPage`,
`YamlMounts`, the bundle writer, the .NET/Python pages, which read the same file) — hidden by
`mateu-ui:defined ~ .mateu-preboot`. It fades in after 300 ms (a fast load never sees it), follows
the `theme` attribute `mateu-theme.js` sets before the first paint (dark), stops spinning under
`prefers-reduced-motion`, and adds no script. Python starter `/products`, Fast 3G + 4× CPU, 3 runs,
"something on screen" = the loader visible (polled every 50 ms) or the content:

| | Something on screen | Content |
|---|---|---|
| before | 4.1 s (nothing until the bundle has run: FCP) | 4.8 s |
| after | **0.69–0.74 s** | 4.8 s (unchanged) |

Chrome's own FCP entry does not count the spinner (an inline-SVG shape faded in), so
`first-load-probe.mjs` still reports FCP ≈ 4.1 s on both; the poll above is what a user sees.

## What is left

- **Redwood**: 4.6 MB / ~70 requests from Oracle's CDN on every cold load. Outside Mateu's
  control; an organisation allowed to mirror it (`mateu.oracle-cdn.url`) can serve it closer.
- `MetaAnnotations.find` and `StructureHashPostProcessor.hashOf` (above).
- Brotli for static bundles, if a dependency-free encoder ever becomes available.

## Budgets in CI

| Budget | Where | Gate |
|---|---|---|
| Eager JS of the Vaadin bundle, raw + gzip (existing) | `apps/vaadin/scripts/check-bundle-budget.mjs` | ceiling = measured + 5% |
| Container lookups + injection scans per warm request (existing) + **record-shape reads = 0** + no direct `getRecordComponents()` | `RequestBudgetTest` | exact |
| **Raw wire JSON of every corpus screen** (53) | `WireConformanceTest.everyCaseStaysWithinItsResponseSizeBudget`, ceilings in `shared/core/src/test/resources/perf/response-size-budget.json` (measured + 10%; `-Dresponse.size.write=true` re-baselines) | per screen |
| **Cold first load of a listing**: the bundle arrives gzipped, ≤ 25 requests until content, ≤ 1000 KB JS / 1200 KB total on the wire (measured 12 / 642 KB / 670 KB) | `e2e/tests/shared/first-load-budget.spec.ts` — the shared suite, so every adapter | counts and bytes |
| **Assets gzipped on every adapter** | `AdapterParityITFoundation.servesTextAssetsGzipped` (5 adapters) + port tests | yes |

No latency gate: on this machine p95s moved ±50% between identical runs while other work ran,
and a shared CI runner is worse. Counts and bytes catch the regressions found here (an
uncompressed bundle, a per-node reflective read) deterministically; the probes above are for
measuring, not gating.

## Reproduce

```bash
# web first load (any running app; the READY text is something only that route's content shows)
cd e2e && node first-load-probe.mjs "http://localhost:8595/=García López" http://localhost:8600/people=Ackbar
PROFILE=none RUNS=1 node first-load-probe.mjs http://localhost:9005/products=LP-100

# server latency: capture what the renderer sends, then replay it
node sync-latency-probe.mjs capture java http://localhost:8080 /tmp/java-actions.json
CONC=1,10,50 DURATION=8 node sync-latency-probe.mjs run /tmp/java-actions.json http://localhost:8080

# in-JVM request timing
cd backend && mvn -pl shared/core test -Dtest=RequestBudgetTest -Dmateu.perf.timing=true

# CPU profile of a running app under load
asprof -d 15 -e cpu -i 1ms -o collapsed -f /tmp/cpu.collapsed <pid>
```
