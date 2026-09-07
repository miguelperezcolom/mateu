# demo-starwars — a 100%-DSL Mateu app on an external API

**Example 1** of the progressive example suite. It exists to *document* how a Mateu app is built with
zero Java UI code, and to *validate* that the framework's "works without any Java class" principle
holds end to end.

## What it demonstrates

A complete Mateu application — mount, app shell, pages and its REST source catalogue — authored
**entirely as data** under `src/main/resources/specs/ui/`, reading live data from the public
[Star Wars API](https://swapi.info). The only Java is `StarwarsApplication`, a Spring Boot `main`
that boots the server; it declares nothing about the UI.

```
specs/ui/
  starwars.ui.yaml   # the mount (type: UI) — served at "/"
  app.yaml           # the app shell (type: AppShell) — title, subtitle, top menu
  routes.yaml        # each URL bound to a page definition (no viewModel — no Java behind them)
  sources.yaml       # the REST source catalogue — each SWAPI endpoint, named once
  people.yaml        # a type: Listing whose rows come from the `swapi-people` source
  planets.yaml       # …from `swapi-planets`
  films.yaml         # …from `swapi-films`
```

Each page is a `type: Listing` with a `rowsSource: { ref: … }`. The browser resolves the ref against
the catalogue, fetches the endpoint directly (swapi.info sends `Access-Control-Allow-Origin: *`, so no
proxy is needed), and each column reads its field by id. No server search action, no view model.

**Search criteria** — each listing declares `searchable: true` and a `filters:` list, as data like
everything else: a text filter, a `multiSelect` (People's gender, Films' director) and a range
(`numberRange` on height/diameter, `dateRange` on release date). swapi.info is a **static mirror**
that ignores query parameters — `?search=luke` returns all 82 people, verified — so the conditions
are evaluated over the fetched rows by the renderer, which is what a listing reading somebody else's
endpoint has to do when there is no `CrudStore.find` to ask. Point `sources.yaml` at an endpoint that
does filter server-side and its url can carry `${searchText}` instead, with no change to the pages.

**Person detail** — the People page is a `gridLayout: masterDetail` listing: clicking a person shows
their full record in the detail pane, entirely from the already-fetched rows (no re-fetch, no id).
This is the fully-declarative detail that swapi.info's shape allows: its list rows carry no numeric
id — only a `url` and `name` — so a re-fetch-by-id route is not expressible in pure YAML here.

> A separate URL-addressable detail route (a page bound to a `data:` source that fetches one record)
> is the natural next step, but it currently surfaces two framework gaps on the **definition-only**
> (no view model) path: a route's `data:` source is not wired there, and query params do not reach
> page state. Tracked as a follow-up; master-detail is the working detail today.

This is the concrete pay-off of two recent pieces: **DSL-app enumeration** (a mount announced with no
class) and the **REST source catalogue** (`sources.yaml`).

## Run it

```bash
cd demo/demo-starwars
mvn -s ../../settings.xml spring-boot:run     # → http://localhost:8600
```

Open <http://localhost:8600> and click People / Planets / Films.

> The Star Wars API is a free, community-run service and is sometimes slow or down. When it is
> unreachable the listings render their chrome (title, search, columns) but stay empty — that is the
> API, not Mateu.

## How it is validated

- **Unit (in CI):** `YamlUidlLoaderTest.parsesAListingBoundToAnExternalSourceByRef` pins that a
  `type: Listing` with a `rowsSource` ref deserialises — the authoring surface an app like this needs.
- **End-to-end:** `e2e/starwars-probe.mjs` drives this app in a real browser and asserts the three
  listings render rows mapped from the source. It **intercepts** the SWAPI endpoints and answers them
  from local fixtures, so it validates *our* pipeline (mount → shell → listing → source → fetch →
  mapping → grid) deterministically, without depending on the live API's uptime:

  ```bash
  cd demo/demo-starwars && mvn -s ../../settings.xml spring-boot:run   # keep running
  cd e2e && node starwars-probe.mjs
  ```
