# Backend test coverage review (GA plan, phase 2) — 2026-10-11

Scope: the Java backend (core, uidl, dtos, the annotation processors, the five adapters, the
`mateu-bundle-maven-plugin`, the archetype), the .NET port and the Python port. The frontends and
renderers were reviewed separately.

The goal was not a percentage. It was that **every behaviour a user relies on is pinned by a test
that would fail if it broke**, with the security paths pinned in every backend. Percentages are
reported because a floor is what keeps the result from eroding.

## 1. Coverage, before and after

### Java (JaCoCo, line / branch, per module's own suite)

| Module | Before | After | Gate (BUNDLE lines) |
|---|---|---|---|
| shared/core | 84.4% / 69.7% | **84.6% / 70.0%** | 75% → **84%** |
| shared/uidl (own suite) | 37.3% / 14.9% | **40.0% / 20.8%** | none → **38%** |
| shared/uidl (own + core suites)¹ | — | 83.5% / 69.2% | — |
| shared/dtos (core suites)¹ | no tests | 78.0% / 56.9% | — (records; no own suite) |
| annotation-processor-core | **not measured**² | 73.5% / 53.5% | 70% per package (now real) + **72%** bundle |
| annotation-processor-indexer | **not measured**² | 67.8% / 65.8% | none → **65%** |
| mvc-core | 63.6% / 62.2% | 65.0% / 62.2% | none → **63%** |
| webflux-core | 75.5% / 67.6% | 78.3% / 67.6% | none → **76%** |
| micronaut-core | 54.0% / 43.1% | 56.6% / 43.1% | none → **55%** |
| quarkus-core | 63.7% / 50.0% | 72.2% / 56.6% | none → **70%** |
| helidon-mp-core | 68.0% / 50.0% | 70.1% / 50.0% | none → **68%** |
| mateu-bundle-maven-plugin | 25.1% / 20.3% | **59.9% / 50.3%** | none → **58%** |
| 5 framework annotation processors | no tests³ | no tests³ | — |

¹ uidl's interfaces' defaults (`CrudStore.find`, `FilterStateAssembler`, …) and the dtos records are
exercised by core's `TestMateu` suites, which a per-module JaCoCo report cannot attribute. Computed
with the JaCoCo CLI over `core/target/jacoco.exec` + `uidl/target/jacoco.exec`.
² **Bug in the gate**: both processor modules overwrote surefire's `argLine`, which carries the
JaCoCo agent, so no execution data was recorded and annotation-processor-core's "70% per-package
floor" was silently skipped ("missing execution data file"). Fixed (`@{argLine}`).
³ The generators run inside javac (in the Maven process), where JaCoCo cannot see them. What they
generate is compiled and exercised over HTTP by each adapter's parity suite (see §3).

### .NET (coverlet, net8.0, line / branch)

| Package | Before | After | CI floor (lines) |
|---|---|---|---|
| Mateu.Uidl | 93.3% / 72.6% | 93.4% / 72.7% | 92% |
| Mateu.Core | 92.5% / 80.0% | 93.3% / 80.4% | 92% |
| Mateu.Dtos | 99.0% / 100% | 99.0% / 100% | 97% |
| Mateu.AspNetCore | 92.0% / 72.7% | **98.1% / 86.9%** | 95% |
| **Total** | 93.1% / 79.3% (636 tests) | **93.8% / 79.8%** (654 tests) | |

### Python (coverage.py, lines + branches)

| Package | Before | After |
|---|---|---|
| mateu_core | 91.6% / 83.4% | 91.8% / 83.7% |
| mateu_fastapi | 86.2% / 79.2% | **94.2% / 88.5%** |
| mateu_uidl | 95.6% / 78.9% | 95.6% / 78.9% |
| mateu_dtos | 100% | 100% |
| **Total (combined)** | 91.1% (697 tests) | **91.3%** (716 tests) — CI floor **90%** |

## 2. Risk map

✅ pinned by a behaviour test that fails if it breaks · 🟡 partly (what is missing in the note) ·
❌ not pinned · n/a not applicable. "Adapters" = all five Java adapters over real HTTP.

| Feature | Java core | Java adapters | .NET | Python | Notes |
|---|---|---|---|---|---|
| CRUD lifecycle (new/edit/save/delete, drawer) | ✅ | 🟡 | ✅ | ✅ | Over HTTP only webflux `CreateJourneyIT`; the path is core's. |
| `CrudStore.find` defaults: search, filters by example, criteria, sort, paging | ✅ **new** | n/a | ✅ | ✅ | Field filters + `FilterCriterion` had no direct test (`CrudStoreFiltersAndCriteriaTest`). |
| Typed / range / multi-select filters | ✅ | n/a | ✅ | ✅ | |
| State hydration (typed values from the browser) | ✅ **new** | n/a | ✅ | ✅ | Found and fixed a bug (§4.6). |
| Wizards, branching, drafts | ✅ | n/a | 🟡 | 🟡 | Branching is not implemented in the ports (a feature gap, not a test gap). |
| Archetypes | ✅ | n/a | ✅ | ✅ | HeroSearch / ItemOverview are thin (structure only). None in the conformance corpus. |
| routes.yaml / mounts / home / RouteEntrySupplier | ✅ | 🟡 | ✅ | ✅ | No adapter test serves a YAML-only mount. |
| REST sources: catalogue, proxy, secrets | ✅ **new** | n/a | ✅ **new** | ✅ **new** | Real upstream in all three: secret header upstream only, never on the wire; JSON-escaped body; `${secret.HOME}` never reads `HOME`; 4xx/5xx surfaced; 204 = success. |
| YAML kinds: actions, types, translations, environments, access, sample data | ✅ | n/a | ✅ | ✅ | |
| YAML `type: Project` | ✅ | n/a | ❌ | ❌ | No loader in the ports (feature gap). |
| Live reload (off by default, on with `mateu.dev`) | ✅ | ✅ | ✅ | ✅ | |
| Documents: single use, expiry, bounded store, safe headers | ✅ | ✅ / 🟡 | ✅ | ✅ | Over HTTP single use + headers in all 5; expiry/bound tested at unit level (same code). Failing lazy producer → bare 500, **new** in the ports. |
| Security: principal → authorization | ✅ | ✅ **new** | ✅ | ✅ | Each adapter's framework principal (Spring Security, WebFlux exchange, Micronaut, JAX-RS `SecurityContext`, Quarkus `SecurityIdentity`) now proven to reach `@EyesOnly`. |
| Security: a forged/unsigned token grants nothing | ✅ | ✅ | ✅ | ✅ | |
| Security: refused action → 403, never runs | ✅ | ✅ **new** | ✅ **new (HTTP)** | ✅ | The adapters' `MateuForbiddenException` handlers had no test. |
| `@EyesOnly` / `@ReadOnlyUnless` / `@DisabledUnless` on the wire | ✅ | ✅ | ✅ | ✅ | **New conformance case** `access-annotations`. |
| CORS off by default / allow-list | ✅ | ✅ | ✅ **new** | ✅ | .NET leaves CORS to the host; pinned that the mount grants nothing by itself. |
| MCP off by default | ✅ | ✅ | ✅ **fixed** | ✅ **fixed** | The ports served it unconditionally (§4.1). |
| MCP tool calls: RBAC + error boundary | ✅ | ✅ **new** | ✅ **new** | ✅ **new** | Only `initialize` was checked over HTTP. |
| Error boundary (generic text + reference, user-facing shown) | ✅ | ✅ **new** | ✅ | ✅ | Over HTTP in all 5 adapters now. |
| Malformed request body → error toast, never a 500 | ✅ | — | ✅ **fixed** | ✅ | |
| Conformance corpus (26 cases, exact match) | ✅ | n/a | ✅ | ✅ | Each runner now fails if a corpus case is not wired (§3). |
| Annotation processors | 🟡 | ✅ (indirect) | n/a | n/a | Indexer + generic AP + lint have unit tests; the 5 framework generators only via the adapter suites. |
| Bundle plugin `bundle` goal (staticOnly, failOnEmpty…) | n/a | n/a | n/a | n/a | ✅ **new** `BundleMojoTest`; `openapi`/`server` goals 🟡 (their logic is tested in core). |

## 3. Tests added

**Java**
- `AdapterParityITFoundation` (+4 contracts, run by all five adapters):
  `refusesARestrictedActionToAnAnonymousCaller`, `anAuthenticatedPrincipalSeesAndRunsWhatItsRolesAllow`
  (each adapter's test app authenticates the `X-Parity-Roles` header the way its framework does —
  `ParityRolesAuthentication` per adapter; Quarkus uses `@TestSecurity`, hence the new
  `quarkus-test-security` test dependency), `answersAnUnexpectedErrorWithAReferenceNeverItsMessage`,
  `mcpToolCallsApplyTheSameRbacAndErrorBoundary`. Fixtures `FailingForm` and an `@EyesOnly` action on
  `RestrictedForm` in each adapter.
- `RestProxySecretsSyncTest` (5) — the proxied leg against a real upstream.
- `StateValueConversionHydrationTest` (8) — the write half of the state round trip.
- `CrudStoreFiltersAndCriteriaTest` (uidl, 11).
- `BundleMojoTest` (plugin, 6).
- `McpProjectionTest.aMessageKeepsItsSeverityAndTitle`.
- `WireConformanceTest.everyCaseOfTheCorpusHasAFixture` + the `access-annotations` fixture/golden.

**.NET** — `SecurityDefaultsOverHttpTests` (12, Kestrel host + a real upstream: MCP off/on/env,
parse error, MCP RBAC + error boundary, malformed body, reference-not-message, 403, `[EyesOnly]`
hidden, no CORS by default, proxy secret/JSON escaping/Content-Type/error/204);
`McpTests.A_message_keeps_its_severity_and_title`; `Every_case_of_the_corpus_is_wired` (+ allow-list
consistency); the `access-annotations` conformance fixture; failing lazy document.

**Python** — `test_security_defaults_over_http.py` (13, a real upstream + FastAPI: the same
security paths); `test_a_message_keeps_its_severity_and_title`; `test_every_case_of_the_corpus_is_wired`;
the `access-annotations` fixture; failing lazy document.

**CI** (`.github/workflows/run_tests.yml`) — the Java module step now also runs mvc, micronaut,
quarkus, helidon-mp and the bundle plugin (their suites ran nowhere in CI: the build step skips
tests), each with its coverage floor; .NET runs with coverlet and a per-package line floor; Python
runs under `coverage` with `fail_under = 90` (pyproject `[tool.coverage]`).

## 4. Bugs found and fixed (each with its test)

1. **The ports served MCP by default** (.NET `MapMateu`, Python `add_mateu`), against the
   documented "off unless enabled" security default. Now opt-in: `MateuOptions.Mcp` /
   `add_mateu(mcp=True)` / `MATEU_MCP_ENABLED`. Docs + CHANGELOG updated. *Behaviour change for
   port users who relied on it.*
2. **MCP tool calls in the ports bypassed the error boundary**: a failing action answered
   `"Error: <raw exception text>"` (a password in a message reached the agent). Now the same
   generic text + reference as sync; a malformed MCP message is a JSON-RPC parse error, not a 500.
3. **Proxied REST failures read as success in the ports**: a 4xx/5xx or transport error answered an
   empty `_restfetch`, so the renderer toasted "Saved" over a write that never happened (Java had
   fixed this). Now `_restfetchError {status, message}` with Java's texts.
4. **JSON injection in proxied bodies (ports)**: client values went into a JSON body template
   unescaped; Java escaped them. Now escaped when the request declares JSON.
5. **.NET dropped a declared `Content-Type`** (added to request headers, where it is not allowed), so
   a JSON body was sent as `text/plain`. Python **logged the resolved url, secret included**, on a
   refused proxy url. **.NET answered a malformed sync body with a raw 500.**
6. **Java hydration lost a whole multi-select**: a `List<Enum>` field receiving the comma-joined
   string a URL restore sends threw `ClassCastException`, and an enum array with one stale constant
   threw — hydration swallowed both and the field kept its initializer. The enum-aware converter
   (`FieldValueConverter.convertEnumCollection`, which documents exactly these cases) was never
   reached; `ActualValueExtractor` now hands enum collections to it.
7. **MCP projection lost every message's severity** (Java, .NET, Python): it read `type`, the wire
   says `variant`, so an agent saw failures and refusals as `info`, and the title was dropped.
8. **The annotation-processor coverage gate was vacuous** (§1, note ²).

## 5. What is left, and why

- **The Node MCP sidecar** (`frontend/mcp-server/projection.mjs`) has the same `variant`/`type`
  slip as bug 7. Out of this review's scope (frontend); a two-line fix with its test.
- **Framework annotation processors** (5) have no unit tests; JaCoCo cannot measure code that runs
  in javac. Their output is compiled and exercised over HTTP by each adapter's parity suite, which
  is the behaviour that matters. A golden-source test per template would catch a template edit
  earlier — worth it only if the templates start changing often.
- **Dev endpoints** (`POST /mateu/dev/reload`) are unauthenticated when `mateu.dev=true`, in every
  backend. Pinned as off by default; restricting them (e.g. to loopback) is a design decision, not a
  missing test.
- **Documents over HTTP**: expiry and the bounded store are pinned at the store level in all three
  backends; the HTTP path is the same code, so an HTTP test would add time, not information.
- **Port feature gaps** surfaced by the map (not test gaps): wizard branching and YAML
  `type: Project` exist only in Java; .NET has no CORS option of its own (ASP.NET's is the answer).
- **Conformance corpus**: still no CRUD-search, wizard, archetype or REST-source case — each needs
  identical fixtures in three servers and some (archetypes) differ in idiom. `access-annotations`
  closed the security hole in it.
- **`openapi` / `server` goals** have no mojo-level test; the derivation and the generator are tested
  in core (`OpenApiDerivationTest`, `ServerSkeletonTest`).
- **Residual line coverage** in core (≈15%) is dominated by defensive/catch branches and
  sub-20-line variant tails (CLAUDE.md's own assessment); no noise tests were written against them.

## 6. Verification (on the branch merged with master at v3.0-alpha.411+)

- `mvn -B install` of the whole backend (every module, adapters included; `verify` phase with all ten
  JaCoCo gates met): BUILD SUCCESS, 1914 Java tests, 0 failures. JDK 21.
- .NET: `dotnet test` (net8.0) 654/654; `dotnet build -c Release` 0 warnings / 0 errors
  (warnings-as-errors). The net10.0 leg was not run locally (no .NET 10 SDK on this machine); CI runs it.
- Python: 717 passed under coverage (91% total, floor 90%); `mypy` clean.
- Conformance: 26 cases match exactly in Java, .NET and Python, with empty allow-lists.
