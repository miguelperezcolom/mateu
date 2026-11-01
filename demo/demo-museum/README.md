# demo-museum — three art museums in one UI, 100% YAML

A Mateu app authored **entirely as data** (`src/main/resources/specs/ui/`) over
[museum-service](https://github.com/miguelperezcolom/museum-service): public-domain artworks of
**The Metropolitan Museum of Art**, **SMK – Statens Museum for Kunst** (Copenhagen) and the
**Cleveland Museum of Art**, with synthetic exhibitions, loans, conservation tasks and daily visits.
The only Java is `MuseumApplication`, a Spring Boot `main`.

It replaces the Star Wars theme of [`demo-starwars`](../demo-starwars) for one reason: **the pictures
are legitimately usable.** Every artwork is a public-domain work whose image its museum publishes
under CC0 (the Met, Cleveland) or the Public Domain Mark (SMK). The images are not copied — each
record links the museum's own image URL (IIIF / CDN) and carries its credit line and a link to the
work's page; see museum-service's `CREDITS.md` and `/api/credits`.

The goal is to exercise as much of Mateu as YAML can express, on **both renderers** — every Redwood
page template, server-side listings, master-detail, forms with every field type, a guided process,
a kanban, a calendar, a map, charts and a tree.

## Run it

```bash
# 1. the API (port 8121), with a write key
cd museum-service
mvn spring-boot:run -Dspring-boot.run.arguments=--museum.write-key=localdev

# 2a. this app on the Vaadin renderer (port 8601)
cd demo/demo-museum
MATEU_SECRET_MUSEUM_WRITE_KEY=localdev mvn spring-boot:run

# 2b. …or on the Redwood renderer (Oracle JET/Spectra from Oracle's CDN), on another port
MATEU_SECRET_MUSEUM_WRITE_KEY=localdev mvn spring-boot:run \
  -Dmateu.renderer=mateu-redwood -Dspring-boot.run.arguments=--server.port=8611
```

One jar serves one renderer: the pom's `mateu.renderer` property picks `mateu-vaadin` (default) or
`mateu-redwood`. Without the write key every read works and every save answers 401 — the API
refusing, as it should.

### Pointing it at another museum-service

Every endpoint is declared once, in [`sources.yaml`](src/main/resources/specs/ui/sources.yaml),
against `http://localhost:8121`. To use a public deployment, do not edit it: activate the
[`public` environment](src/main/resources/specs/ui/environments/public.yaml), which re-points every
source. Its base URL is written **once**, as the YAML anchor `&museum-api` — change that line.

```bash
MATEU_ENVIRONMENT=public mvn spring-boot:run
```

(Mateu's environments override sources by name and have no "every source" wildcard, hence the
anchor: one value, aliased by each entry.)

## What it demonstrates, and where

| Functionality | Route | Definition |
|---|---|---|
| App shell: grouped top menu, logo, home route, global search (⌘K) over a REST source | every page | `app.yaml` |
| **WelcomePage** template — banner, calls to action, tiles | `/welcome` | `welcome.yaml` |
| **DashboardLandingPage** — scoreboard + chart panels (line, doughnut, bar, pie); header KPIs **live** from `/api/stats` through the route's `data:` | `/dashboard` | `dashboard.yaml` |
| **HeroSearchPage** — one search over every collection; each hit opens what it is (`rowRoute: ${row.route}`) | `/search` | `search.yaml` |
| Listing with server-side **search, filters** (text, multi-select, select from a REST source, yes/no, money and year **ranges**), sort, **paging**, row selection + bulk delete | `/artworks` | `artworks.yaml` |
| **AdvancedCreateEditPage** — sections + anchor navigator + detail slot; the **field-type catalogue**: text, textarea, rich text, integer, number, select (inline enum / REST options), toggle, checkbox, image, link | `/artworks/new` | `artwork-new.yaml` |
| **ItemOverviewPage** — photo + key facts panel, tabs; header badge, KPIs, back arrow | `/artworks/:id` | `artwork.yaml` |
| **MultimediaContentPage** — banner over media sections, a **carousel** | `/artworks/:id/gallery` | `artwork-gallery.yaml` |
| Edit with Save / Delete (proxied PUT / DELETE), timestamp in the header | `/artworks/:id/edit` | `artwork-edit.yaml` |
| **CollectionDetailPage** — list + detail, selection in the URL; a partial shared by two pages | `/artists`, `/artists/:id` | `artists.yaml`, `artist.yaml`, `partials/artists-list.yaml` |
| **Master-detail** listing | `/museums` | `museums.yaml` |
| **GeneralOverviewPage** — record switcher fed by a REST source, previous/next arrows, KPIs, info slot, an embedded listing filtered by the record | `/museums/:id` | `museum.yaml` |
| **Map** — the three museums on OpenStreetMap | `/map` | `map.yaml` |
| **Tree** — museum → department → gallery, a listing in tree layout over a REST source | `/collection` | `collection.yaml` |
| Listing filtered by a REST-fed select | `/departments` | `departments.yaml` |
| Listing with a **date range**, a status multi-select and a money range | `/exhibitions` | `exhibitions.yaml` |
| **FoldoutPage** — overview + fold-out panels (works as cards, loans, budget metrics) | `/exhibitions/:id` | `exhibition.yaml` |
| Create / edit with **date** fields and a **radio** group | `/exhibitions/new`, `/exhibitions/:id/edit` | `exhibition-new.yaml`, `exhibition-edit.yaml` |
| **Calendar** — every exhibition as a multi-day event, month/agenda views; an event opens the show | `/calendar` | `calendar.yaml` (generated) |
| **DataManagementPage** — the loans as a data view with docked panels (a **timeline** of the workflow) | `/loans` | `loans.yaml` |
| **GuidedProcessPage** — the *request a loan* **wizard** (4 steps, one form, a proxied create) | `/loans/new` | `loan-new.yaml` |
| A record whose status select walks a workflow | `/loans/:id` | `loan.yaml` |
| **Kanban** — the conservation board; a card opens the live task | `/conservation` | `conservation.yaml` (generated) |
| Listing **grouped** by status | `/conservation/tasks` | `conservation-tasks.yaml` |
| Create / edit sharing a list partial; **slider**, radio, select | `/conservation/tasks/new`, `/conservation/tasks/:id` | `task-new.yaml`, `task-edit.yaml`, `partials/task-fields.yaml` |
| Date-range + number-range filters, money and integer columns | `/visits` | `visits.yaml` |

### Live, and snapshot

Listings, records, selects, the record switcher, the global search and the dashboard's header KPIs
read museum-service **live**. Three components cannot: a YAML `Chart`, `Kanban` and `Calendar` carry
their data in the definition (they have no `source:`), and a `MetricCard` does not interpolate
`${state…}` on Vaadin. For those, [`scripts/snapshot.py`](scripts/snapshot.py) reads the API once
and writes `calendar.yaml`, `conservation.yaml` and `partials/generated/*`. Every card and event
opens the **live** record, so what you edit is always current. Re-run it after the seed changes:

```bash
python3 scripts/snapshot.py            # museum-service on :8121
```

## What YAML could not express (and why)

| Wanted | What happens | Why |
|---|---|---|
| Kanban, calendar and charts fed by the API | snapshot (above) | `Kanban`, `Calendar`, `Chart` take inline data only |
| A map pin that opens the museum | the buttons under the map do it | `markerActionId` is one action for every pin; the clicked id arrives as `_markerId`, and a YAML `Navigate` step's route is not interpolated |
| Editing an exhibition's works (M:N) | shown, not edited | a `multiSelect` (or `combobox`) does not read an `optionsSource`; only `select` does |
| `money` inputs in forms that save | `number` inputs labelled USD; `money` in read-only views and columns | a money field's value is `{value, currency, locale}`, and a proxied write body can only interpolate flat `${state.x}` |
| A `dateRange` *input* in a form | two `date` fields | the range stereotypes are filter widgets; their two values have no place in a write body |
| Live dashboard MetricCards | header `kpis` are live; the cards are a snapshot | `MetricCard` did not interpolate `${state…}` on Vaadin before 3.0-beta.30 (#958) |
| A tree from a REST source on Redwood | flat on Redwood (Vaadin draws the tree) | Redwood's listing does not draw `gridLayout: tree` for a source; rows keep their `children` since 3.0-beta.30 (#959) |
| The artist's works beside the artist on Redwood | drawn since 3.0-beta.30 (#960) | a `Listing` nested in a templated page now stays in its slot and loads its rows |
| The works and loans in the exhibition's foldout on Redwood | drawn since 3.0-beta.31 (#972) | a `Listing` inside a foldout panel is drawn there, with its rows |

Renderer differences worth knowing: Redwood does not draw the dashboard's header `kpis` (its
template takes the title and subtitle only), drops a `Text` with `container: h2` inside a section,
and ignores image `style`; Vaadin shows the guided process as one tab per step, Redwood as Spectra's
own `oj-sp-guided-process`.

## How it is validated

```bash
cd e2e
node museum-probe.mjs                              # every route renders its data — Vaadin, :8601
BASE=http://localhost:8611 node museum-probe.mjs   # the same on Redwood
node museum-writes-probe.mjs                       # the write paths, checked against the API
```

`museum-probe.mjs` opens each of the 28 routes in a real browser and checks it shows the data it is
about (not chrome). `museum-writes-probe.mjs` fills forms — the loan wizard, a task status, an
artwork edit and create, a new exhibition — and asks museum-service whether each write landed.
Both run against the live API on purpose: what they check is that the YAML and the API agree.
