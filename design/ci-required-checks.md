# Required checks for `master` — recommendation (2026-10-10)

Today branch protection requires exactly one check, `e2e` (strict, from GitHub Actions). Everything
else (`backend-tests`, `frontend-lib`, `renderer-vb`, the Python legs, the examples) can be red and
the PR still merges, which is how `master` has carried red jobs.

## Recommendation

Require **three aggregator checks** and nothing else from these workflows:

| Check name    | Workflow               | Runs on                                         |
|---------------|------------------------|-------------------------------------------------|
| `ci-ok`       | `run_tests.yml` (Tests)| every PR                                        |
| `examples-ok` | `examples.yml`         | every PR (path filter inside, see below)        |
| `docs-ok`     | `docs.yml`             | every PR (path filter inside, see below)        |

Optionally add the four `Analyze (java-kotlin|javascript-typescript|python|csharp)` checks of
`codeql.yml` (runs on every PR to master). Keep them out at first: they have failed on master for
reasons unrelated to the code (a 10 s connect timeout to api.github.com while uploading the SARIF,
2026-09-29), and code-scanning alerts already gate through the Security tab.

Then **remove `e2e` from the required list** — `ci-ok` covers it (and every other job of the
workflow). Keep it until `ci-ok` has been green on a few PRs, then swap in one edit.

Settings: GitHub Actions as the source (app id 15368), "Require branches to be up to date" as today.

## Why aggregators, not job names

- **A required check that never reports blocks the PR forever.** Before this change `examples.yml`
  and `docs.yml` used a trigger-level `paths:` filter, so on a PR that touched neither, the
  workflow did not run and its checks never appeared — requiring `java-starters-and-demos` or
  `build` would have blocked every such PR. They now run on every PR; a small `changes` job
  (`scripts/ci-changes.sh`, PR file list from the API, fails *open*) decides whether the real jobs
  run, and the `*-ok` job always reports: green when each job passed **or was skipped by that
  filter**, red when one failed or was cancelled.
- **Job names drift.** A matrix leg is its own check (`python (3.11)`, `python (3.12)`, …), so adding
  an interpreter, renaming a job or splitting one silently changes what is required. The
  aggregator's `needs:` list lives next to the jobs, in the same file, reviewed in the same PR.
- `run_tests.yml` has no path-gated jobs today, so `ci-ok` is equivalent to requiring all nine jobs —
  but it stays correct if one ever gets an `if:`.

Rule for contributors (also written above each aggregator): **a new job in one of these workflows
must be added to its aggregator's `needs:`**, or it is not gating anything.

## Stability before requiring

The jobs `ci-ok` aggregates and their known flakes, as of this change:

| Job               | Flake seen (last ~150 PR runs)                                   | Status |
|-------------------|------------------------------------------------------------------|--------|
| `intellij-plugin` | "Could not find bundled plugin with ID: 'com.intellij.java'" — 5 runs, all with a cold Gradle cache and a swallowed `ClosedFileSystemException` on `plugins/java/lib/java-impl.jar` while the IntelliJ Platform Gradle Plugin indexes the IDE (JetBrains/intellij-platform-gradle-plugin#2192) | fixed: cached + validated layout index (warmed on master by `warm-caches.yml`), one retry on that exact signature (`scripts/intellij-gradle.sh`) |
| `renderer-vb`     | `page.goto(..., networkidle)` 60 s timeout (Oracle CDN); skeleton check racing a fixed 6 s sleep | fixed: probes wait on the app's ready signal with one bounded retry (`e2e/vb-ready.mjs`) |
| `e2e`             | none — every failure seen was the same spec failing on all five adapters (real); Playwright already retries twice on CI | — |
| `backend-tests`, `python*`, `frontend-lib`, `bundle-freshness`, `tooling-tests` | none — failures seen were real (dependency bumps, a doc-comment warning-as-error, stale bundles) | — |

Dependabot PRs that bump Maven majors fail `backend-tests`/`e2e`/`renderer-vb` for real (e.g. Helidon
4.x BOM without the MP server version, Micronaut `NullMarked`); with `ci-ok` required they simply
cannot merge until fixed, which is the point.

## Applying it

```bash
gh api -X PATCH repos/miguelperezcolom/mateu/branches/master/protection/required_status_checks \
  -f strict=true \
  -f 'checks[][context]=ci-ok'       -F 'checks[][app_id]=15368' \
  -f 'checks[][context]=examples-ok' -F 'checks[][app_id]=15368' \
  -f 'checks[][context]=docs-ok'     -F 'checks[][app_id]=15368'
```

This REPLACES the list (so `e2e` drops out); during the transition add
`-f 'checks[][context]=e2e' -F 'checks[][app_id]=15368'` to keep it.
(or Settings → Branches → master → "Require status checks to pass", search for the three names —
they only appear in the picker after they have run once on a PR.)
