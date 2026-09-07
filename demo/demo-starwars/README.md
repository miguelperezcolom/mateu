# demo-starwars — a 100%-DSL Mateu app on an external API

**Example 1** of the progressive example suite. It exists to *document* how a Mateu app is built with
zero Java UI code, and to *validate* that the framework's "works without any Java class" principle
holds end to end.

## What it demonstrates

A complete Mateu application — mount, app shell, pages and its REST source catalogue — authored
**entirely as data** under `src/main/resources/specs/ui/`, reading live data from
[swapi.ec1.mateu.io](https://swapi.ec1.mateu.io) ([swapi-service](https://github.com/miguelperezcolom/swapi-service)),
a writable clone of the Star Wars API. The only Java is `StarwarsApplication`, a Spring Boot `main`
that boots the server; it declares nothing about the UI.

> It used to read the public `swapi.info` mirror. That mirror is **static** — it ignores query
> parameters (`?search=luke` returns all 82 people) — so every condition had to be evaluated in the
> browser over the whole collection. Against a real backend the search, the filters, the sort and the
> pager are answered by the **server**, which is what a listing does in an actual application.

```
specs/ui/
  starwars.ui.yaml   # the mount (type: UI) — served at "/"
  app.yaml           # the app shell (type: AppShell) — title, subtitle, top menu
  routes.yaml        # each URL bound to a page definition (no viewModel — no Java behind them)
  sources.yaml       # the REST source catalogue — each endpoint, named once
  people.yaml        # a type: Listing whose rows come from the `swapi-people` source
  planets.yaml       # …from `swapi-planets`
  films.yaml         # …from `swapi-films`
  species.yaml       # …and the other three collections the service publishes
  vehicles.yaml
  starships.yaml
```

**All six collections**, because the app is only a fair sample of the service if it shows the whole
of it: People (82), Planets (60), Species (37), Vehicles (39), Starships (36) and Films (6).

Each page is a `type: Listing` with a `rowsSource: { ref: … }`. The browser resolves the ref against
the catalogue and fetches the endpoint directly (the service sends `Access-Control-Allow-Origin: *`,
so no proxy is needed); each column reads its field by id. No server search action, no view model.

**The conditions travel to the server.** A source's url carries them through `${state.…}`
interpolation — the free-text search, each declared filter, the range bounds, the page and the sort —
and the entry declares `totalPath: totalElements`. That declaration is also the signal that the
server already searched, filtered and paged, so the renderer shows the page it was given instead of
re-filtering and re-slicing it. A blank parameter is ignored by the API, so an untouched filter costs
nothing.

**References show up as names.** The service serves `homeworldName` beside `homeworldId`, so the
People table has a Homeworld column without a request per row — a thing a static mirror of
URL-shaped references cannot give you.

**Search criteria** — each listing declares `searchable: true` and a `filters:` list, as data like
everything else: a text filter, a `multiSelect` (People's gender, Films' director) and a range
(`numberRange` on height/diameter/lifespan/cost/hyperdrive, `dateRange` on release date). A
multi-select reaches the API as one comma-joined parameter, which it reads as an OR.

Vehicle and starship **class** are plain text filters, not selects, and that is a modelling decision
rather than a shortcut: the data holds "wheeled walker" and "assault walker" as well as "walker", and
both casings of "starfighter", so the API matches them by containment and one word finds the family.
Species **classification** is a closed set of single words, so it is a multi-select matched exactly.

## A complete CRUD, still with no Java

Clicking a row goes to that character's **own URL** (`rowRoute: people/${row.id}`) — shareable, and
it survives a reload, which the old `masterDetail` pane never did. That page reads, writes and
deletes:

```yaml
# routes.yaml — the record's route names the source that fetches it
- route: people/:id
  definition: person.yaml
  data: swapi-person          # url: .../api/people/${state.id}
```
```yaml
# person.yaml — fields bind to the same state the record was merged into
buttons:
  - {type: Button, label: Save, actionId: save, buttonStyle: primary}
  - {type: Button, label: Delete, actionId: delete}
actions:
  - id: save
    validationRequired: true
    restAction: {source: {ref: swapi-person-update}, successMessage: Saved}
  - id: delete
    confirmationRequired: true
    restAction: {source: {ref: swapi-person-delete}, successMessage: Deleted}
```

`actions:` beside the layout is the door that was missing. An action carrying a `restAction` has
always travelled to the browser and been run there without a server round trip — but only a Java
`@RestAction` method could attach one, so a page with no class could read and never write.

**The write key never reaches the browser.** The write sources are `proxy: true`, so the SERVER makes
the call and resolves `${secret.SWAPI_WRITE_KEY}` from its environment. A direct write could not do
that: the client-side interpolator has no `secret` scope, deliberately. Run the demo with the key in
the environment:

```bash
SWAPI_WRITE_KEY=… mvn -s ../../settings.xml spring-boot:run
```

Without it the reads all work and a write comes back 401 — which is the API refusing, exactly as it
should.

This is the concrete pay-off of two recent pieces: **DSL-app enumeration** (a mount announced with no
class) and the **REST source catalogue** (`sources.yaml`).

## Run it

```bash
cd demo/demo-starwars
mvn -s ../../settings.xml spring-boot:run     # → http://localhost:8600
```

Open <http://localhost:8600> and click People / Planets / Films.

> When the API is unreachable the listings render their chrome (title, search, columns) but stay
> empty — that is the API, not Mateu.

## How it is validated

- **Unit (in CI):** `YamlUidlLoaderTest.parsesAListingBoundToAnExternalSourceByRef` pins that a
  `type: Listing` with a `rowsSource` ref deserialises — the authoring surface an app like this needs.
- **End-to-end:** `e2e/starwars-probe.mjs` drives this app in a real browser and asserts all six
  listings render rows mapped from the source, by URL and by menu click alike. It **intercepts** the SWAPI endpoints and answers them
  from local fixtures, so it validates *our* pipeline (mount → shell → listing → source → fetch →
  mapping → grid) deterministically, without depending on the live API's uptime:

  ```bash
  cd demo/demo-starwars && mvn -s ../../settings.xml spring-boot:run   # keep running
  cd e2e && node starwars-probe.mjs
  ```

  The fixtures answer the **paged envelope** and apply the query string themselves, so the checks
  also pin that the renderer takes the server's total and renders the page as given — the total is
  deliberately not the length of the array it was handed.
