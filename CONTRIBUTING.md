# Contributing to Mateu

Thanks for helping. This page is what you need to build the repository, find your way around it,
run the tests and get a change merged.

- Questions and ideas: [Discord](https://discord.gg/YFb9utDMYK) or a GitHub discussion/issue.
- Security problems: **never in a public issue** — see [SECURITY.md](SECURITY.md).
- Behaviour: [Code of conduct](CODE_OF_CONDUCT.md).

## Prerequisites

- **JDK 21** and **Maven 3.9** (3.9.x — the release pipeline pins 3.9.16).
- **Node 22+** (the CI uses 24) for the frontend monorepo, the docs site and the e2e suite.
- Optional: **.NET 8 SDK** (`backend/dotnet`), **Python 3.11+** (`backend/python`).

## Module map

```
backend/                      Maven reactor (version 0.0.1-MATEU in the tree; the release sets the real one)
  shared/uidl                 PUBLIC authoring API: annotations, interfaces, fluent records, data types
  shared/dtos                 the wire DTOs (UIIncrementDto, …)
  shared/core                 the engine (application / domain / infra) + archetypes/orchestrators
  shared/annotation-processor-*   indexer + the code shared by the framework processors
  shared/frontend/vaadin-lit  the web renderer's built assets (generated — see below)
  shared/frontend/redwood     the Redwood/VB renderer's built assets (generated)
  mvc · webflux · micronaut · quarkus · helidon-mp   one runtime adapter + annotation processor each
  dotnet/ · python/           the C# and Python server sides (same wire)
frontend/web/monorepo/        TypeScript: libs/mateu (shared lib) + apps/vaadin, apps/redwood, apps/visual-editor
frontend/app/                 native renderers: react-native, intellij-plugin
starters/                     the smallest app per runtime (the docs quickstart)
demo/                         runnable demos
e2e/                          Playwright suites + the SUT apps they run against
doc/                          the mateu.io site (Astro + Starlight)
conformance/                  the wire conformance corpus, run by all three backends
design/                       internal design notes (not published)
```

The repository's `CLAUDE.md` is the long-form architecture guide: read the section of the area you
touch before changing it.

## Build order

All paths from the repository root:

```bash
# 1. backend reactor → installs 0.0.1-MATEU into your local Maven repository
(cd backend && mvn install -DskipTests)

# 2. only if you changed frontend code: rebuild the renderer, copy it into the backend, reinstall it
(cd frontend/web/monorepo && npm ci)
(cd frontend/web/monorepo/apps/vaadin && npm run copy)    # → backend/shared/frontend/vaadin-lit
(cd backend/shared/frontend/vaadin-lit && mvn install)

# 3. anything that consumes the backend: starters, demos, e2e SUT apps
(cd starters && mvn package -Dmateu.version=0.0.1-MATEU)
(cd demo/demo-admin-panel && mvn spring-boot:run)
```

The renderer bundles under `backend/shared/frontend/*` are **generated and committed**. If you change
`frontend/web/monorepo`, regenerate them (`npm run copy`) in the same PR — CI's `bundle-freshness`
check fails otherwise.

## Tests

| What | Command |
|---|---|
| Core engine (≈1200 tests + coverage gate) | `cd backend/shared/core && mvn verify` |
| One test class | `cd backend/shared/core && mvn test -Dtest=LayoutSyncTest` |
| Generated JSON schemas (regenerate after changing a uidl record) | `cd backend && mvn -pl shared/uidl test -Dtest=UidlSchemaTest -Duidl.schema.write=true` |
| Shared frontend library | `cd frontend/web/monorepo/libs/mateu && npm run build && npm test` |
| End-to-end (Playwright) | see `e2e/README.md`: build `e2e/sut/modules/sample1`, start an SUT app, `cd e2e && npm test` |
| .NET | `cd backend/dotnet && dotnet test` |
| Python | `cd backend/python && pytest` |
| Docs site | `cd doc && npm ci && npm run verify` (build + broken-link check) |
| Docs code samples | `cd doc && npm run check:snippets` (see [Documentation snippets](#documentation-snippets)) |
| Starters | `cd starters && mvn package -Dmateu.version=0.0.1-MATEU && ./smoke-test.sh` |

Most behaviour is tested **in-JVM** with the core integration harness (`TestMateu`): one
`mateu.sync("/route")` exercises route resolution → instance creation → mapping → wire DTOs. Add a
`*SyncTest` next to the existing ones for a new feature.

## Documentation snippets

Every ` ```java `, ` ```csharp `, ` ```python ` and ` ```yaml ` block under
`doc/src/content/docs` is checked against the **current** sources — `npm run check:snippets` in
`doc/` (`-- --lang java --only ux-patterns/` to narrow it), and the `snippets` job of
`.github/workflows/docs.yml` on every PR that touches the docs or the authoring APIs (uidl, core,
the Python and .NET ports, the specs schema):

- **Java** compiles against mateu-uidl + mateu-core (install them first:
  `cd backend && mvn -pl shared/core,shared/test -am install -DskipTests`). Samples leave their imports out;
  the checker infers them, wraps fragments (class bodies, statements, expressions, a type header,
  bare annotations) and allows `{ ... }` / `// …` elisions. A type the page declares in another
  block is visible; a type nobody declares and Mateu does not have (`ProductService`) is assumed to
  be the app's.
- **C#** compiles against `backend/dotnet/src` (needs the .NET 10 SDK); **Python** is type-checked
  with mypy against `mateu-ui` (`pip install "./backend/python[dev,all]" jsonschema`, or point
  `MATEU_SNIPPETS_PYTHON` at an interpreter that has them).
- **YAML** that declares a top-level `type:` (or a `$schema`) is validated against
  `backend/shared/uidl/specs-schema.json`, with unknown keys rejected.

A sample that fails is wrong about the API: fix the sample — or, if the docs are right, the API.
Only a deliberate sketch that is not meant to compile (a constructor signature, pseudo-code, a
"before — no longer compiles" example) opts out, by adding `nocheck` to the fence:
` ```java nocheck `. Use it sparingly; the header comments of `doc/scripts/check-snippets.mjs` and
`doc/scripts/snippets/*` describe exactly what each checker tolerates.

## Making a change

1. Open an issue first for anything bigger than a fix, so the approach can be agreed.
2. Branch from `master`. Keep the PR focused; one feature or fix per PR.
3. A feature that is visible on the wire is expected to land on **all three backends** (Java, .NET,
   Python) and on the renderers, or to say in the PR which ones it leaves for later and why.
4. Add or update tests, and the docs page under `doc/` (with a screenshot generated by
   `e2e/screenshot.mjs` when it is visual).
5. Public API (see [Stability & versioning](https://mateu.io/reference/stability-and-versioning/)):
   the 3.x API is **frozen** since `3.0-beta.1` — never remove, rename or re-type a stable element in
   place: add the replacement, deprecate the old one naming it, and add the change to
   [CHANGELOG.md](CHANGELOG.md). The build enforces it: japicmp in `mvn verify` (Java —
   `mvn verify -pl shared/uidl` / `shared/core` from `backend/`), `PublicSurfaceTests` (.NET) and
   `test_api_freeze.py` / `test_public_surface.py` (Python). A compatible addition in .NET/Python is
   re-pinned with `MATEU_API_WRITE=true` (commit the rewritten file); a deliberate Java break (end of a
   deprecation period) needs a reviewed entry in `backend/api-compat/japicmp-exclusions.properties`.
6. Fill in the pull request template; CI must be green.

## Sign your commits (DCO)

Contributions are accepted under the [Developer Certificate of Origin](https://developercertificate.org/):
by signing off a commit you certify you wrote it or otherwise have the right to submit it under the
project's licence (Apache-2.0). Add the sign-off with `-s`:

```bash
git commit -s -m "fix(core): …"
# adds:  Signed-off-by: Your Name <you@example.com>
```

Every commit of a PR needs it; `git rebase --signoff master` adds it to commits you already made.

## Commit messages

Conventional-commit style, scoped by area: `feat(core): …`, `fix(redwood): …`, `docs: …`,
`build(demos): …`. Explain **why** in the body.

## Desktop installers

The desktop app's installers (`./gradlew buildInstaller` in `frontend/app/intellij-plugin`) are built
by CI (`.github/workflows/desktop.yml`) on every release. Do not build them on your own machine to try
them — download them from the release instead. They package a whole IntelliJ distribution, touch
system locations on macOS (the dmg's drag-to-install link points at `/Applications`) and need signing
secrets to be useful. In that build script, never use Kotlin's `File.deleteRecursively()`: it follows
symbolic links. Use `deleteTree()`, which removes a link as a link (CI checks for it).

## Releases

Maintainers cut releases; GitHub Actions (`.github/workflows/buid-and-publish.yml`) build, test and
publish everything. The recipe:

```bash
# a release of the current line (v3.0.1 now, v3.0-rc.N before the GA):
gh release create v3.0.1 --title "Mateu v3.0.1" --notes "…" --latest=false
# a backport to an older minor, or a pre-release of a later line:
gh release create v3.0.2 --title "Mateu v3.0.2" --notes "…" --latest=false
gh release create v3.1-rc.1 --title "Mateu v3.1-rc.1" --notes "…" --prerelease
```

`--latest=false` because the release must not become GitHub's "Latest" before its installers are
there: installed desktop apps poll `releases/latest/download/mateu-desktop-update.json`, and the docs
and `mateu.io/add` link to `releases/latest`. The workflow's `latest-mark` job makes it Latest at the
end, once the desktop app, the APK and SHA256SUMS are attached — and only when it is the newest
final of its line (`scripts/release-line.mjs`). Forgetting the flag is caught: `latest-hold` hands
"Latest" back to the previous release first. If a part fails, the release does not become Latest;
fix the part (re-run the failed jobs) and then run `gh release edit <tag> --latest` by hand.

A release that is not the newest of its line (a backport `v3.0.2` published after `v3.1.0`, or a
re-run of an older release) publishes its packages to Maven Central, PyPI, NuGet and npm (npm under
the dist-tag `release-3.0`, never `latest`) but ships nothing that would reach users as an update:
no over-the-air phone update, no IDE plugins, no desktop app, no example repin. A pre-release of a
later line (`v3.1-rc.1`) does the same. PyPI, NuGet and npm publish only after the Maven Central
deploy succeeded, so a port never gets a number Java does not have.

After a release reaches Central, the workflow's `bump-examples` job opens a PR that moves the
starters and the start-here demos to it (`scripts/bump-example-version.sh <version>` by hand). On
the first final release of a line (the GA) the same script also moves the Python package's
`Development Status` classifier to Production/Stable and the supported-versions row of
`SECURITY.md` to `3.0.x` — check the PR. Before tagging the GA, read `CHANGELOG.md`'s
`[Unreleased]` section: it becomes the release's section.
