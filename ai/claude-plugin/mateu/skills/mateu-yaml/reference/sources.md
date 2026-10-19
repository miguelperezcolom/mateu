# The REST source catalogue (`sources.yaml`)

Every endpoint a screen reads or writes is **named once**; pages reference it by name
(`rowsSource: {ref: orders}`, `optionsSource: {ref: countries}`, `restAction: {source: {ref:
order-create}}`, a route's `data: order`). Names are **global** (not per mount). Re-pointing a
deployment is then an edit of this table (or an environment overlay), not of every screen.

```yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Sources
sources:
  - name: orders
    description: Orders, paged by the API
    source:
      url: /api/orders?page=${state.page ?? 0}&size=${state.size ?? 20}&q=${encodeURIComponent(state.searchText ?? '')}&status=${state.status ?? ''}
      itemsPath: content            # where the rows are in the response
    totalPath: totalElements        # on the ENTRY: declaring it says "the API paged/filtered"
    fields:
      customerName: customer.name   # flat column id → dot path in each row
    sample:                         # the RESPONSE the endpoint would return
      content:
        - {id: "1001", customer: {name: Acme}, status: OPEN, total: 120.5}
      totalElements: 1

  - name: order                     # one record, used by a route's `data: order`
    source: {url: "/api/orders/${state.id}"}
    sample: {id: "1001", customer: {name: Acme}, status: OPEN, total: 120.5}

  - name: countries                 # select options
    provenance: existing            # somebody else's API (never generated)
    source:
      url: https://restcountries.com/v3.1/all?fields=cca2,name
      valuePath: cca2
      labelPath: name.common

  - name: order-create              # a write
    source:
      url: /api/orders
      method: POST
      headers: {Content-Type: application/json}
      body: '{"customer":"${state.customer}","total":"${state.total}"}'
    sample: {id: "1003"}

  - name: order-delete              # a write with an API key: through the server
    source:
      url: https://api.example.com/orders/${state.id}
      method: DELETE
      proxy: true                   # fetched by the Mateu server, not the browser
      headers: {X-Api-Key: "${secret.ORDERS_KEY}"}
```

## Keys

Entry: `name`, `description`, `source` (the request — the YAML keys mirror the `RestSourceEntry`
record, which is why the request nests under `source:`), `totalPath`, `fields`, `provenance`
(`generate` = ours to build, `existing` = somebody else's, `auto` = inferred from the URL), `sample`
or `sampleFile` (JSON/YAML path relative to `specs/ui`).

Request (`source:`): `url`, `method` (default GET), `headers`, `body` (a template; values are
JSON-escaped when the request is JSON), `itemsPath`, `valuePath`/`labelPath` (options),
`proxy`, `sample`. A surface may declare an **inline** source with the same keys, or `{ref: x,
labelPath: …}` to reuse an entry and override part of it (what the surface declares wins).

## Writing

Writes are page **actions** that carry a `restAction` — see pages-and-components.md:

```yaml
buttons:
  - {type: Button, label: Create, actionId: create, buttonStyle: primary}
actions:
  - id: create
    validationRequired: true
    restAction:
      source: {ref: order-create}
      successMessage: Order created
      resultPath: ""                 # merge the response (e.g. the new id) into the state
      successRoute: orders/${state.id}
```

Delete the checked rows of a listing: `rowsSelectedRequired: true`, `confirmationRequired: true`
and `restAction: {forEachSelectedRow: true, source: {ref: order-delete}, successRoute: orders}`.

## Direct vs proxied

- **Direct** (default): the browser calls the API → the API must allow CORS for the UI's origin
  (or put both behind one origin). Works in a static bundle.
- **`proxy: true`**: the Mateu server makes the call (no CORS; the endpoint comes from the table the
  server holds, never from the request). **Required for `${secret.X}`** — resolved server-side from
  a `SecretsProvider` bean or the env var `MATEU_SECRET_X`; a direct source never sees secrets.
  Needs a backend, so `staticOnly` refuses it.

## Sample mode

`sample:` answers instead of the endpoint **only** in sample mode: always in the visual editor;
`mateu.sources.mock=true` in `application.properties` (or `-Dmateu.sources.mock=true` /
`MATEU_SOURCES_MOCK=true`) for a served app — the yaml starter's `Application.java` turns it on
until you set it to `false`, a code or code + YAML project has to set it itself; `-Dmateu.bundle.mock=true` for a
bundle (the static starter's `.mvn/maven.config`). In sample mode reads return a copy of the
sample, listings search/filter/sort/page it in memory, and **writes succeed without persisting**.
Outside sample mode samples are never sent to the browser.

## Limits

Selection, not transformation: no XML/CSV, no value formatting/joining, no offset arithmetic
(`${page}` interpolates, `page*size` does not), a 200 carrying an error is a success. When the API
is yours, make it serve the shape the screen needs.
