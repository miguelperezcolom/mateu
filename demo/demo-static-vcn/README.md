# demo-static-vcn — a 100 % static Mateu UI (the «static VCN slice»)

P5 · S0 of [`design/maui-parity-plan.md`](../../design/maui-parity-plan.md): proof that Mateu serves a
UI with **no backend of its own** — page definitions read by the browser, data straight from a REST
API — the way OCI's console (MAUI) does, built only from what Mateu already has.

The same slice of a cloud console, authored **two ways**:

| | `java/` | `yaml/` |
|---|---|---|
| Authored as | `@UI("")` shell + view models (`@RestListing`, `@RestData`, `@RestAction`) bound in `routes.yaml` | `routes.yaml` + definitions (`type: AppShell`, `Listing`, `Form`) + `sources.yaml` |
| Built by | `mvn -Pbundle package` → `mateu:bundle` **pre-renders** the wire | `mvn -Pbundle package` → `mateu:bundle` with `specsOnly`: the definitions ship **raw** |
| In the browser | answers each load from `manifest.json` | **expands** each definition at runtime (the client-side expander) |
| Static-safety | `staticOnly`: the build fails if a route still needs a server | same |

Both give the same screens:

1. **VCN listing** over the API, with free-text search, a declared filter (State), client-side paging
   and a status column; a row opens the record by URL (`rowRoute`).
2. **VCN detail** loaded by `:id` (`@RestData` / the route's `data:` source), deep-linkable.
3. **Subnets of a VCN**, a second listing scoped by the parent id. A *linked route*
   (`vcns/:id/subnets`), not a routed tab: routed tabs are P1 of the plan and not in master yet.
4. **Delete** with a confirmation, a `DELETE` the browser makes itself, a toast, and the listing
   re-fetched.

## The pieces

- `external-api/server.mjs` — **the external API**. A tiny dependency-free REST server standing in for
  somebody else's API (`GET/DELETE /api/vcns[/:id]`, `GET /api/vcns/:id/subnets`, CORS on,
  `POST /__reset` for the tests). It is not a Mateu backend and knows nothing about Mateu.
- `serve-static.mjs` — a dumb static file server with an SPA fallback (what Netlify's `_redirects`,
  an S3/CloudFront error document or nginx `try_files` give you). Files only.
- `java/`, `yaml/` — the two authorings. Each has a Spring Boot `main` only so the same screens can
  also be served LIVE for comparison (`mvn spring-boot:run`, :8795 / :8794); the deliverable is
  `target/mateu-bundle/`.

## Run it

```bash
./run-static.sh          # builds both sites, starts :8790 (API), :8791 (Java), :8792 (YAML)
open http://localhost:8791/vcns/7     # a deep link, served from files
./run-static.sh stop
```

(With a locally built Mateu in a private repo: `MVN_OPTS_EXTRA=-Dmaven.repo.local=$HOME/.m2-x ./run-static.sh`.)

The e2e (Playwright, Vaadin renderer) runs the same spec against both sites and fails if anything
calls `/mateu/v3/**`:

```bash
cd ../../e2e && npx playwright test --project static-vcn-java --project static-vcn-yaml --workers=1
```

Pointing the sites at another API is an edit of `sources` in `target/mateu-bundle/manifest.json` — no
rebuild. Everything else about hosting a static UI (CORS, auth, what cannot be static yet) is in the
guide: `doc/.../java-ui-definition/static-ui.md`.
