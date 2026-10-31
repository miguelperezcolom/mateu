# demo-space — a 100%-YAML Mateu app over a space-exploration API

The successor of [`demo-starwars`](../demo-starwars) as Mateu's showcase: the same authoring model —
mount, shell, routes, a REST source catalogue and pages, **all YAML, no Java UI** — on a theme whose
pictures can actually be used. Every photograph is an asset of the
[NASA Image and Video Library](https://images.nasa.gov): not copyrighted in the US, credited on every
record and listed on the **Credits** page. The only Java is `SpaceApplication`, a Spring Boot `main`.

It reads [space-service](https://github.com/miguelperezcolom/space-service) — NASA missions,
astronauts, spacecraft with their component trees, launch sites, launches, the solar system as a
tree, and (synthetic) mission tasks and budget lines — and is built to exercise **as much of Mateu as
YAML can express**, on the **Vaadin** and the **Redwood** renderers alike.

## Run it

```bash
# 1. the API (its own repository), on :8122, writable with the key "localdev"
cd space-service && mvn spring-boot:run -Dspring-boot.run.arguments=--space.write-key=localdev

# 2. the demo on the Vaadin renderer, on :8602
cd demo/demo-space
MATEU_SECRET_SPACE_WRITE_KEY=localdev mvn spring-boot:run

# 2'. the same YAML on the Redwood renderer (-Predwood swaps the renderer dependency), on :8603
MATEU_SECRET_SPACE_WRITE_KEY=localdev mvn -Predwood spring-boot:run -Dspring-boot.run.arguments=--server.port=8603
```

Without the key every read works and every write comes back 401 — the API refusing, as it should.
The key never reaches the browser: the write sources are `proxy: true`, so the Mateu server makes
the call and resolves `${secret.SPACE_WRITE_KEY}` from `MATEU_SECRET_SPACE_WRITE_KEY`.

**Pointing it elsewhere.** Every source is authored against `http://localhost:8122`.
`specs/ui/environments/public.yaml` is a Mateu *environment* that rebases every source on another
host — edit its base url (one search & replace) and run with `MATEU_ENVIRONMENT=public`. The
catalogue itself never changes between environments (see `doc/…/deploy/environments.md`).

## What it demonstrates, page by page

| Feature | Route(s) | Vaadin | Redwood |
|---|---|---|---|
| **App shell**: grouped menu (`Menu` + `submenu`), header action, the palette's **global search** over every collection (`globalSearch` → `/api/search`), the **inbox** (`notifications` → tasks in progress), mobile QR | every page | ✅ | ✅ |
| **WelcomePage** template: banner + CTAs, featured missions as picture cards, area tiles | `welcome` | ✅ | 🟡 the featured-missions listing is not drawn (bug 4) |
| **DashboardLandingPage**: KPI scoreboard (clickable `MetricCard`s), bar / line / pie / doughnut charts | `dashboard` | ✅ | ✅ |
| **HeroSearchPage**: one search box over five collections (`/api/search`), each hit opening its own record (`rowRoute: ${row.route}`), filter by kind | `search` | ✅ | ✅ |
| **Smart filter & search listing**: server-side search, filters (text, multi-select, select from a REST source, yes/no, **date range**, **number range**), sort, paging, picture + caption cell, bulk delete of checked rows | `missions`, `astronauts`, `spacecraft`, `tasks`, `launch-sites`, `budget` | ✅ | ✅ |
| **Picture cards** (`gridLayout: cards`) | `astronauts`, `welcome`, `search` | ✅ | ✅ |
| **Grouped listing** (`groupBy`) | `tasks` | ✅ | ✅ |
| **Master-detail** (`gridLayout: masterDetail`) | `launches` | ✅ | ✅ (as a table, documented) |
| **MultimediaContentPage**: banner, sections with photo, facts, rich-text objectives, crew, a **gallery listing over the record's own array** (`itemsPath: gallery`), sources | `missions/:id` | 🟡 banner not interpolated (bug 1) | 🟡 the gallery is hoisted out of its section; the photo section and the rich text are not drawn (bugs 4–6) |
| **AdvancedCreateEditPage** (edit) with **every field type**: text, textarea, rich text, select (inline / REST source), radio, **multi-select** (crew), date, **date range**, **money**, toggle, image, link; `detail` slot; `timestamp` | `missions/:id/edit` | 🟡 REST-sourced selects show blank (bug 2) | 🟡 the date-range field is not drawn (bug 7) |
| **AdvancedCreateEditPage** (create), `titlePlaceholder`, `initialValue` | `missions/new` | ✅ | ✅ |
| **GuidedProcessPage** — the wizard *Plan a mission* (five steps, one form, creates on the last) | `plan` | ✅ (steps as tabs) | ✅ `oj-sp-guided-process` |
| **DataManagementPage**: compact striped listing, docked end + bottom panels | `mission-control` | ✅ | ✅ |
| **Gantt** (mission durations) and **Timeline** (milestones, each opening its mission) in a **TabLayout** | `timeline` | ✅ | ✅ |
| **Kanban** board of tasks, a card opening its task | `board` | ✅ | ✅ |
| Create / edit / delete a task: header **badges**, **kpis**, overline, slider, combobox, shared fields via a **Partial** | `tasks/new`, `tasks/:id` | 🟡 mission select blank (bug 2) | ✅ |
| **Calendar**: launches coloured by outcome, UTC times, day labels, month/week/day/list views, an event opening its mission | `calendar` | ✅ | ✅ |
| **Map**: launch pads as markers, active ones in green, the sites listed under it | `sites-map` | ✅ | ✅ |
| **GeneralOverviewPage**: header **record switcher** (from a REST source), kpis, `info` slot with the photo, a nested listing of the launches from the site | `launch-sites/:id` | ✅ | 🟡 the nested listing is hoisted and the page drawn twice (bug 4) |
| Simple edit form: numbers with min/max, toggle | `launch-sites/:id/edit` | ✅ | ✅ |
| **ItemOverviewPage**: portrait (4:3 `photo`), key facts, status **badge**, tabs (biography as rich text, flights, record) | `astronauts/:id` | ✅ | ✅ |
| Edit form with header **avatar**, rich text, dates, delete with confirmation | `astronauts/:id/edit` | ✅ | ✅ |
| **FoldoutPage**: overview + fold-out panels, one of them a **tree** of the spacecraft's components | `spacecraft/:id` | ✅ | ✅ (tree as a table) |
| **Tree** listings (`gridLayout: tree`): spacecraft → subsystem → instrument; Sun → planets → moons; server-side search keeping the matching branches | `components`, `solar-system` | 🟡 works, with a stray `children` column (bug 3) | 🟡 flat table of the roots (documented Redwood gap) + the stray column |
| **CollectionDetailPage**: the bodies list beside the selected body (shared list via a **Partial**), `noSelection` empty state | `bodies`, `bodies/:id` | ✅ | ✅ |
| Page **banner** (`banners`), charts above a filtered listing | `budget` | ✅ | ✅ |
| A listing over a bare array (no envelope): searched and paged in the browser | `credits` | ✅ | ✅ |

✅ = verified by `e2e/space-probe.mjs` plus screenshots; the writes — wizard create (incl. multi-select
crew, money, date), edit-save on both renderers, bulk delete — were driven in a browser against the
live API. 🟡 = renders, with the defect noted.

## How the data gets onto the page

- **Listings, selects, the record switcher, the shell's search and inbox read the API live**, through
  `sources.yaml`. A listing's url carries the search, every filter, the range bounds, page, size and
  sort (`${state.…}`), and `totalPath: totalElements` tells the renderer the server did the work.
- **A record page** names the source that fetches it on its route (`data: space-mission`); the id
  comes from the path.
- **Writes** are `restAction`s over proxied sources. Their JSON bodies interpolate the form state;
  the API reads that leniently (empty string = null, id lists from `"[5, 11]"`, a money value or a
  date range from their printed form) — see space-service's README.
- **Charts, KPIs, the Kanban, the Calendar, the Map, the Gantt and the Timeline carry their data**:
  in YAML none of them reads a REST source. `scripts/snapshot.py` copies it from the API into the
  pages, between `# >>> generated:` markers (and writes `partials/crew-field.yaml`, the crew
  multi-select's options). Re-run it after changing the API's seed:
  `python3 scripts/snapshot.py` (or `SPACE_API=… python3 scripts/snapshot.py`).

## What YAML cannot express (yet)

- **Live data for charts, boards, calendars, maps, Gantt and timelines** — only listings, option
  fields and the shell's sources read REST. Hence the snapshot script.
- **A click that carries its item into a YAML action.** A Kanban card, a calendar event and a timeline
  item each have their own `actionId`, so the snapshot gives each its own action (`open-task-12` →
  `Navigate tasks/12`). A **map marker** has only the map's `markerActionId` (the marker id arrives
  as `_markerId`, and a `Navigate` step cannot read it), so the sites are also listed under the map.
- **Paging months on a Calendar** — the ‹ Today › toolbar belongs to the Java `CalendarPage`
  archetype; the YAML page shows five memorable months as tabs instead.
- **A multi-select fed by a REST source** — `optionsSource` is read by single selects only, so the
  crew's options are inline (generated).
- **Hiding a column** — needed for the tree workaround below.
- The wizard runs **client-side as one form**: no per-step validation round trip or branching.

## Mateu bugs found (3.0-beta.25)

1. **Vaadin: a `MultimediaContentPage` banner is not interpolated.** `title: ${state.name}` (also
   overline, subtitle) shows literally; Redwood interpolates it. Repro: `missions/6` (or
   demo-starwars `films/1`).
2. **Vaadin: a `select` with an `optionsSource` whose values are numbers never shows the current
   value.** `mapItemsToOptions` keeps the raw number and `vaadin-select` matches values as strings.
   Repro: `{type: FormField, id: missionId, stereotype: select, optionsSource: {ref: space-mission-options}}`
   on `tasks/1` (record `missionId: 25`) — blank; Redwood shows "Artemis III". demo-starwars'
   homeworld combo has the same shape. (Saving without touching it keeps the value.)
3. **A `gridLayout: tree` listing over a `rowsSource` loses its children.** `mapItemsToRows` keeps
   only the declared column ids, so `children` is dropped and only the roots show. Workaround here: a
   `children` column — which then renders `[object Object],…`, as a column cannot be hidden.
   Repro: `components.yaml` without that column.
4. **Redwood: a `Listing` nested inside a templated page is hoisted out of it.** On a
   `GeneralOverviewPage` the listing is drawn at the top and the whole page again below it
   (`launch-sites/4`); on a `MultimediaContentPage` it leaves its section (`missions/6`); on a
   `WelcomePage` it is not drawn (`welcome`). Vaadin keeps it in place.
5. **Redwood: an `Image` (and the `Text` beside it) inside a `mateu-section` Card of a
   `MultimediaContentPage` is not drawn** — the section stays empty (`missions/6`, "Photograph").
6. **Redwood: a read-only `html` field inside a `MultimediaContentPage` section shows the raw markup**
   (`missions/6`, Objectives); the same field in an `ItemOverviewPage` tab renders it (`astronauts/5`).
7. **Redwood: a form field with `dataType: dateRange` is not drawn** (`missions/6/edit`, "Launch
   window"; the wizard's Schedule step).
8. **Redwood: the app requests `ojtabbar.js` from Oracle's CDN (JET 18.1.0-2510.3) and gets a 404**
   on every page; tabs still render.
9. **A `Partial` inside a `GuidedProcessPage` step is not expanded** — it renders as nothing, and the
   log says `No mapper renders io.mateu.uidl.data.Partial`. Workaround: the crew field is written out
   in `plan.yaml` (generated).
10. **`encodeURIComponent` in a source url now encodes twice**: Mateu encodes every query value where
    it lands, so `search=${encodeURIComponent(state.searchText)}` sends `Sample%2520Return` and the
    search finds nothing for any text with a space. demo-starwars' `sources.yaml` still wraps every
    value this way. (Here the wrappers are removed.)
11. **Vaadin: `Avatar.image` is not interpolated** (`image: "${state.thumbnail}"` is requested
    literally, 404) — demo-starwars' starship foldout uses the same shape.
12. **YAML anchors/aliases are not resolved** in specs files: `space-missions: *api` in an
    environment re-points nothing (the log still counts it). Hence the repeated base url.

Minor: the money field's currency defaults to EUR when it starts empty (the wizard), and the window
title of a record page is its id (`SetWindowTitle "55"`).

## How it is validated

- **Unit:** `EveryRouteRendersTest` posts every route to `/mateu/v3/sync` and fails on a
  "Page not found" — what an unreadable definition turns into. `mvn verify`; needs no API.
- **End-to-end:** `e2e/space-probe.mjs` opens every route in a real browser, on either renderer,
  against the live API, and checks each shows its data with no "Unsupported component", "Unknown
  field type" or uninterpolated `${state.…}`. Bugs 1 and the Redwood tree gap are reported as
  `KNOWN`, not as failures.

  ```bash
  cd e2e && node space-probe.mjs                                    # Vaadin, :8602
  cd e2e && BASE=http://localhost:8603 WAIT=25000 node space-probe.mjs   # Redwood
  ```
