# YAML-only federation (e2e SUT)

A console and two domains, **none with a line of UI code** — every screen, the console's app shell
and its menu are YAML definitions. Each Java file is only a Spring Boot `main`.

| Port  | What | Module |
|-------|------|--------|
| 18480 | the **console** — served; its menu is a local page plus two `RemoteMenu`s | `console/` |
| 18481 | **Orders** — a domain SERVED by its own backend, mounted at `/orders` | `orders/` |
| 18482 | **Catalog** — a domain shipped as a STATIC bundle (`mateu:bundle`, `specsOnly`), plus the JSON API both domains read (`api/`) | `catalog/` + `serve-static.mjs` |

The console reaches the static domain with a `RemoteMenu` whose `baseUrl` names the bundle's
manifest (`http://localhost:18482/manifest.json`): the browser reads that manifest and answers the
domain's loads from it, and its REST sources join the client catalogue. The served domain's sources
arrive with its app's metadata when the console asks it for its menu.

```bash
./run.sh            # build the three modules, start the three servers
cd ../.. && npx playwright test --project yaml-federation
./run.sh stop
```

Spec: `e2e/tests/yaml-federation/yaml-federation.spec.ts`. Findings and fixes:
`design/coverage/frontends.md` (the YAML-only federation verdict).
