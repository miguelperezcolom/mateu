---
title: "Figma, step by step"
description: "Set up the Mateu component library in Figma, design screens with it, and turn the design into a running Mateu app — for a designer and a developer working together."
---

This guide takes a designer and a developer from nothing to a running screen designed in Figma. How
the pieces fit together, and the reference of what the library holds, is on
[Figma design-to-code](/design-systems/figma/). The pipeline is a **preview** in Mateu 3.0.

Who does what:

| Step | Who |
|---|---|
| [0. Get the Mateu UI Kit](#0-get-the-mateu-ui-kit-the-quick-way) | anyone (the quick way) |
| [1. Build the library](#1-build-the-library-once) | developer (once per Mateu version) — or skip it with step 0 |
| [2. Publish it](#2-publish-the-library) | whoever owns the team's Figma |
| [3. Design screens](#3-design-screens) | designer |
| [4. Convert the design](#4-convert-the-design) | developer |
| [5. Serve it](#5-serve-the-pages) | developer |

## 0. Get the Mateu UI Kit (the quick way)

The library is published on Figma Community as **[Mateu UI Kit](https://www.figma.com/community/file/1701291643502429777)**. Open it and
*Open in Figma* (Figma calls it **duplicating**): you get your own copy of the components in your
Drafts, with no plugin to build and on any Figma plan, the free Starter included. Then go to
[2. Publish the library](#2-publish-the-library) to share it with your team, or straight to
[3. Design screens](#3-design-screens) to design in that same file.

A duplicate is a **copy**: it does not receive later updates of the Community file. When a newer
Mateu adds or changes components, duplicate the kit again (or build the library yourself, step 1, to
match the exact Mateu version you run). The kit's description says which Mateu version it matches.

## 1. Build the library (once)

Build it yourself when you want the library to match your exact Mateu version, or to change it.

You need **Figma Desktop** on macOS or Windows — development plugins cannot be imported in the
browser — and Node 20 or later.

1. Build the plugin from the Mateu repository:

   ```bash
   cd design/figma/plugin
   npm ci
   npm run build        # → dist/code.js
   ```

2. In Figma Desktop, create a new, **empty design file** for the library — for example
   "Mateu library". Use it only for this.
3. *Main menu › Plugins › Development › Import plugin from manifest…* and pick
   `design/figma/plugin/manifest.json`.
4. Run *Plugins › Development › Mateu Library Generator › Generate the library*. It creates (or
   replaces) one page per category — `Mateu · Field`, `Mateu · Layout`, `Mateu · Display`,
   `Mateu · Page Templates`… — with one component or variant set per Mateu component. When it ends,
   it tells you how many properties and native slots it created.

:::danger[Never run the generator in a design file]
The generator **deletes and redraws** every `Mateu · <Category>` page of the file it runs in. Run
it only in the dedicated library file, never in a file with screens.
:::

5. Optional but recommended: run *Plugins › Development › Mateu Library Generator › Mateu Library
   Self-test*. It adds a `Mateu · Self-test` page that tries every component — every slot takes a
   child, every property is editable, every variant switches, every component is **publishable** —
   and draws a table of the results at the top. Any row in red is something to report.

At the bottom of many components you will see one or two rows of small grey text: the **props
row** (`fieldId`, `actionId`, `route`…, each showing its value — its own name until you set it) and
the **flags row** (`required`, `readOnly`…, each shown only while it is on). They mirror the
component's properties: Figma only publishes a component whose properties all drive a layer, so
every property has one. They are never read as content; leave them as they are.

## 2. Publish the library

1. Move the library file into a **team project** and *Assets › Publish library*. Publishing a team
   library needs a Figma **Professional, Organization or Education** plan. The publish dialog must
   list **all ~160 components** (standalone components plus variant sets); if it lists fewer, see
   [If something does not look right](#if-something-does-not-look-right).
2. In each design file: *Assets › Libraries* and **enable** "Mateu library".

On the free **Starter** plan there are no team libraries. Design in the library file itself, on a
page of your own (call it "Screens", say): the converter skips the `Mateu · …` pages, so only your
screens are read. Do not re-run the generator on that file once it holds screens without moving
them first.

**After updating Mateu**: rebuild the plugin (step 1.1), re-run *Generate the library* in the library
file, re-publish, and **accept the library update** in every design file (Figma offers it in
*Assets*). Instances placed with an older library keep working — see
[Older libraries](#older-libraries).

## 3. Design screens

In your design file, with the library enabled:

- **One top-level frame per page.** Its name becomes the YAML file name: a frame `Order` gives
  `order.yaml` (letters of any script are kept: `Заказы` gives `заказы.yaml`; a `/` makes a folder).
  A frame whose name starts with `_` is a draft and is skipped. A Figma **Section** only organises
  the canvas: each frame inside it is a page of its own. A frame named like a specs/ui file that is
  not a page — `Routes`, `Sources`, `Project`, `Actions`, `Types`, `Components`, or a frame under
  `translations/`, `environments/`, `partials/` — is written as `routes-page.yaml` (and so on), with
  a warning, so it never lands on your route table.
- **Use library instances only** (from the *Assets* panel). Free-drawn rectangles and vectors are
  decoration and are ignored; plain frames are layouts (horizontal or vertical, by their
  auto-layout); a plain text is a text (a heading from 18 px).
- **Slots — drag into them.** The dashed areas of a component are slots: a Section's content, a
  page template's toolbar, body, KPI band… Drag library instances into a slot, or select it and use
  its **+**. The toolbar slot offers the Button first. The grey caption inside a slot is only a hint;
  delete it or leave it. The order inside the slot is the order on the page.
- **Properties — the right panel.** Select an instance: its labels, titles and config are in the
  right panel. Set `fieldId` (the field's id in the page state), `label`, `required`, `readOnly`
  for fields; `actionId` or `route` for buttons (`people/${state.id}/edit`); `rowsSource.ref` for a
  listing; `stereotype` on a text or number field (`email`, `money`…) and `optionsSource.ref` on a
  select or radio group, the name of the source its options come from… Variants (style, size,
  theme) are there too. A text left as its placeholder (`Label`,
  `Title`) is not read.
- **Page templates.** For a standard page, start from a `Mateu/Page Templates/<type>` instance
  (`ItemOverviewPage`, `WelcomePage`, `DashboardLandingPage`…), as the screen itself or inside the
  screen frame, and fill its slots. A screen without a template is a free page: a `Mateu/Page/Header`
  instance gives it a title and a toolbar.
- **Shared blocks.** A frame named `partial:<name>` is written once to `partials/<slug>.yaml` and
  referenced by that slug from every page that contains it (`partial:Species List` →
  `partials/species-list.yaml`, `ref: species-list`).
- **Switches that are on by default.** A `HorizontalLayout` spaces its items and a `FoldoutPanel`
  opens on its own unless told otherwise; turn on their **`unspaced`** / **`folded`** property to
  say otherwise (an off switch is never written, so turning `spacing` off does nothing). A library
  generated before these two properties existed lacks them: run the library plugin again.
- **Line breaks.** A Shift+Enter inside a text layer is kept as it is.
- **Notes.** Hidden layers and layers whose name starts with `#` are never read.

### Select and radio options

A `Mateu/Field/Select` (in every variant: select, combobox, searchable, treeSelect, listBox,
multiSelect) and a `Mateu/Field/RadioGroup` have an **`options`** property in the right panel. Type
the choices there, separated by commas:

| You type | The field offers (value → label) |
|---|---|
| `Spain, France, Portugal` | `spain` → Spain, `france` → France, `portugal` → Portugal |
| `es=Spain, fr=France` | `es` → Spain, `fr` → France |
| `pcs=Pieces; box=Boxes of 12, sealed` | `pcs` → Pieces, `box` → Boxes of 12, sealed |

- A plain label gets its value made from it: lower case, accents dropped, spaces and symbols turned
  into `-` (`Opción A` → `opcion-a`, `United Kingdom` → `united-kingdom`).
- Write `value=Label` when the value must be a particular code (`es=Spain`). Both kinds can be mixed.
- When a label has a comma in it, separate the items with `;` instead: as soon as the text has a `;`,
  only `;` separates.
- The value is what the form keeps and sends when the user picks the option.
- Left as it comes (it shows `options`, its own name), the field has no options of its own; a
  developer can still give it some in the YAML (`options:` or `optionsSource:`).
- The option texts the component draws (the RadioGroup's "Opción A / Opción B", the Select's "Value")
  are only a picture: they are never read.

The converter warns about an item it cannot read (`a=` with no label, a label with no letters or
digits such as `★`, the same value twice) and leaves that item out.

### Older libraries

A `#config` line inside an instance (`fieldId=email; required=true`) — what the plugin writes for a
prop Figma refuses as a property — is read too; a property, when both exist, wins. Fields go INTO a
Section's content slot: a layer next to a Section is not its content.

## 4. Convert the design

### The token

1. In Figma: *Settings › Security › Personal access tokens › Generate new token*, with the scope
   **File content: Read only** — nothing else.
2. Keep it in a file only you can read, never in the repository:

   ```bash
   mkdir -p ~/.mateu-secrets
   pbpaste > ~/.mateu-secrets/figma-token     # or paste it with an editor
   chmod 600 ~/.mateu-secrets/figma-token
   ```

3. Never commit the token, and never paste it in a chat, an issue or a pull request. Revoke it in the
   same Figma settings when you are done.

### The two commands

The file key is the part of the design file's URL after `/design/` (or `/file/`):
`https://www.figma.com/design/<FILE_KEY>/My-screens`.

```bash
# 1. download the design file as JSON
curl -sf -H "X-Figma-Token: $(cat ~/.mateu-secrets/figma-token)" \
     "https://api.figma.com/v1/files/<FILE_KEY>" > design.json

# 2. write the pages into your app's specs/ui (Node 20+, nothing to install)
node design/figma/to-yaml/bin/figma-to-yaml.mjs design.json --out src/main/resources/specs/ui
```

It prints one line per file written and one per **warning**. A warning is something the converter
left out because the schema does not describe it — an unknown property, a value with no YAML
counterpart, a Java-only page template — and says which layer it comes from; fix it in Figma and
convert again.

Add `--clean` to delete, first, the pages a previous conversion wrote (files that start with the
converter's `# Generated from the Figma frame …` header). Hand-written files in the same folder —
`routes.yaml`, `sources.yaml`, the app shell — are never touched: a file the converter did not
write is never written over either (a warning names it; `--force` overwrites it). Do not edit a
generated file: change the design and convert again.

Put a page template straight inside the screen frame: one inside a wrapper frame is read as
content, and the converter warns about it.

## 5. Serve the pages

A generated `order.yaml` is a page definition. In an app created from the YAML starter (see the
[YAML quickstart](/define/yaml/quickstart/)), register it in `specs/ui/routes.yaml`:

```yaml
routes:
  - route: order
    layout: order.yaml
```

and, to reach it from the menu, add an entry to the app shell (`specs/ui/app.yaml`):

```yaml
menu:
  - type: RouteLink
    label: Order
    route: order
```

**A button's `actionId` only names an action.** A generated page has no code behind it, so an action
nobody declares does nothing when clicked. Declare it in your own `specs/ui/actions.yaml` (see
[the action catalogue](/concepts/action-catalogue/)), which the converter never touches, or bind a
view model to the route; the converter warns about every id it cannot find there. `required` fields
are enforced by an action that declares `validationRequired: true`:

```yaml
type: Actions
actions:
  - id: save
    validationRequired: true
    restAction:
      source: {ref: contact-save}
      successMessage: Saved
```

**What a design draws as a value is an illustration.** The `Value` of a `PropertyRow` or a
`PlainText` is not written to the YAML: the real value comes from the page state (a route's `state:`
or `data:`, a view model). Use a `Mateu/Display/Text` for text that really is fixed.

Then run the app (`mvn spring-boot:run`) and open `http://localhost:8080/order`. The same files work
on a .NET or Python backend, or as a [static bundle](/deploy/static-ui/) with no backend. What a
design cannot say — the REST sources that feed a listing, the routes, actions beyond `actionId` /
`route` — goes in your own files: see [Routes and mounts](/concepts/routes-and-mounts/) and
[Data sources](/concepts/data-sources/).

## 6. Publish straight from Figma, with no backend

A design can **be** the UI: a static site with no server behind it, published from inside Figma. The
**Mateu Publish** plugin (`design/figma/publish/plugin`) reads the open file, needs no Figma token,
no Java and no repository, and uploads the site to Netlify or Cloudflare Pages, or gives you a zip.

1. Install **[Mateu Publish](https://www.figma.com/community/plugin/1701394446386459820/mateu-publish)** from Figma Community. To run your own build instead:
   `cd design/figma/publish && npm ci && npm run build`, then import `plugin/manifest.json` in Figma
   Desktop (*Plugins › Development › Import plugin from manifest…*).
   A file you can edit is enough: a file you can only view has to be duplicated first.
2. Run it in your design file. The panel starts from a working proposal for what a design cannot say:
   - **Screens and routes**: one per top-level frame. A frame answers the route the screens navigate
     to with a parameter: `artworks/${row.id}` is answered by the frame `artwork`, at `artworks/:id`.
   - **Data**: the rows of each listing. They are published as a file of the site, or read from a
     public API if you give its URL. A listing over a file shows no search box: a file cannot search.
   - **What each button does**: confirm with a message, go to a screen, or send the form to a URL.
     A primary button validates the required fields first.
3. Choose where to publish.

What the design draws as a field's value (a `PropertyRow`'s `Value`) is the data here: there is no
other source for it.

:::caution[Everything in a site with no backend is public]
The site runs in the visitor's browser. An API it calls, and anything that call needs, can be read
by anyone. Never put a key or a secret in a URL. If an action needs one, it needs a server: use
[section 5](#5-serve-the-pages).
:::

**Netlify**: create a personal access token (*User settings › Applications*). Each Figma file
keeps its own site: the first publish of a file creates one, the next publishes of that file update
it, and another file never replaces it. The line above the **Publish** button says what will happen
("replaces this file's Netlify site: https://…" or "creates a new Netlify site"); **Publish as a new
site instead** forgets this file's site, and when Netlify no longer knows it (deleted, or a token of
another account) the panel offers a new one. The site's title comes from the panel's **Title**
field, which starts as the file's name.

If you published with an earlier version of the plugin, it kept one site for all your
files: the panel offers that site once, and only updates it if you say the open file is the one
published there.

**Cloudflare Pages**: Cloudflare's API cannot be called from a Figma plugin (it does not allow
cross-origin calls), so the plugin goes through a small Worker that lives in **your own** account:

1. Create a Worker on the free plan and paste `design/figma/publish/cloudflare-relay/worker.js`. It
   stores nothing, forwards only the Pages API and answers only the plugin (a web page calling it is
   refused). Keep it on its `https://<name>.<account>.workers.dev` address: the plugin may reach
   nothing else, so a custom domain does not work.
2. Create an API token with *Cloudflare Pages: Edit*.
3. In the panel, give the Worker's URL, your account ID, the token and a project name. The project
   is this file's, like a Netlify site; the link shown after publishing is the address Cloudflare
   gave it (another one than `<project>.pages.dev` when that name is taken).

If your network cannot reach `workers.dev`, or you would rather not run a Worker, choose **Download a
zip** and drop it on a Cloudflare Pages project.

Tokens stay on your device (Figma's client storage), never in the Figma file; which site a file
publishes to stays on your device too. Routes, data and button settings do travel in the file, so
write nothing secret there. When a setting cannot be saved (a file you can only view), the panel says
so: it lasts until you close the plugin. Name the fields a form sends with letters, digits, `_` and
`-` only: another id stops the publish and says which. A source's rows are published as
`data/<name>.json`, the name made plain (`My list` → `data/my-list.json`).
## Check the whole pipeline (end to end)

Before you design a real app, it is worth checking once that every link of the chain works for you:
the kit in your Figma, the download, the converter and the running app. There are three ways, from
the most hands-on to the fully automatic.

### By hand, the first time

1. **Get the kit**: duplicate the [Mateu UI Kit](https://www.figma.com/community/file/1701291643502429777)
   ([step 0](#0-get-the-mateu-ui-kit-the-quick-way)).
2. **Design one screen**: on a new page of that file, add a frame called `contact`. Into it drag a
   `Mateu/Page/Header` instance (set its `title` to "New contact" and drop a `Mateu/Actions/Button`
   into its toolbar slot), then a `Mateu/Layout/Section` with two `Mateu/Field/TextField` instances
   in its content slot. In the properties panel give each field a `fieldId` (`name`, `email`) and a
   `label`, and switch `required` on for `email`.
3. **Import it**: [make a token](#the-token), then run the [two commands](#the-two-commands) with
   the file's key, writing into the `specs/ui` folder of an app made from the YAML starter.
4. **Run it**: add the route (`- route: contact` / `layout: contact.yaml`) to `routes.yaml`, start
   the app and open `http://localhost:8080/contact`.
5. **What to check**: the converter printed no warning, and the page shows the title, the button,
   the section and both fields, with "Email" marked as required. The button does nothing yet: what
   an `actionId` does is the developer's part (an entry in `actions.yaml`, see
   [below](#what-ci-checks-and-refreshing-it-from-a-real-file)); once it is declared with
   `validationRequired: true`, pressing it with Email empty shows a validation message.

### With the plugin's Self-test and Sample Screens commands

The plugin ([step 1](#1-build-the-library-once)) has two commands that do this at scale:

- **Mateu Library Self-test** checks the library itself — run it in the library file: every
  component, slot, property and variant, and whether Figma will publish every component (see
  [Checking the library](/design-systems/figma/#checking-the-library-self-test)).
- **Mateu Sample Screens** checks the library the way a designer uses it. Run it in any file that
  has the kit — a duplicate of the Community file, or a file with the published library enabled. On
  a page `Screens (sample)` (replaced on each run) it builds six screens out of library instances
  only, exactly as a designer would: instances dropped into slots, ids and labels set in the
  properties panel, variants picked:

  | Frame | What it is |
  |---|---|
  | `contact` | a free form: a page header with Save and Cancel, two sections with a text field, a required email, a select, a date, a money amount and a checkbox |
  | `artwork` | an `ItemOverviewPage`: a photo, the key facts as property rows, two tabs |
  | `artworks` | a `Listing` reading the source `artworks`, searchable, whose rows open `artworks/${row.id}` |
  | `dashboard` | a `DashboardLandingPage`: three metric cards and two panels |
  | `onboarding` | a `GuidedProcessPage` with three steps |
  | `welcome` | a `WelcomePage` with three calls to action over two tiles |

  When it ends it says how many instances it made and whether anything was refused; the plugin
  console has the details. If it says the kit is not in the file, duplicate the kit (or enable the
  library) and run it again.

Download that file and convert it like any design: the six pages must come out with no warning.

### What CI checks, and refreshing it from a real file

The repository runs the same six screens on every pull request that touches the Figma side
(`design/figma/e2e`, job *figma-e2e*): each `design/figma/e2e/*.figma.json` is converted to YAML,
served by a small YAML app on the Mateu release the YAML starter uses, and checked in a browser —
every screen renders with no error, Save is refused while a required field is empty and then sends
the form, the listing shows rows and a row opens its record, the search narrows the rows, the tabs
and the guided process's steps switch, and the calls to action navigate.

The app around the pages is what a developer adds to any design: `routes.yaml` (one route per frame,
the record route fetching the row with `data:`), `sources.yaml` (the `artworks` source the listing
names) and `actions.yaml`, which says what the designer's `actionId: save` does — validate the form
and post it. A designer names an action; a developer defines it.

To run it yourself (JDK 21, Maven and Node 22 or later):

```bash
cd design/figma/e2e
npm ci && npx playwright install chromium
npm test         # the fixtures convert, with no warning
npm run e2e      # convert, build, start on a free port, run the browser checks
npm run e2e:serve   # the same app, left running, to look at the screens yourself
```

The committed `sample-screens.figma.json` is built from the plugin's own plan of the six screens
(`npm run fixture` rewrites it). To check a REAL file instead — one where you ran *Mateu Sample
Screens*, or composed the six frames yourself — download it as the real fixture:

```bash
npm run e2e:refresh -- https://www.figma.com/design/<FILE_KEY>/...   # or just the file key
```

It reads the token from `FIGMA_TOKEN`, else `~/.mateu-secrets/figma-token`, and never prints it. It
writes `downloaded-sample-screens.figma.json` (only the page with the screens and the components they use),
and `npm test` and `npm run e2e` then check both fixtures. The frames must be named `contact`,
`artwork`, `artworks`, `dashboard`, `onboarding` and `welcome`.

The sample's `country` select takes its choices from its `options` property
(`Spain, France, Portugal, United Kingdom`, see [Select and radio options](#select-and-radio-options)).
The browser check opens it, sees those four options, picks France and checks that Save posts
`country: france`.

## If something does not look right

- **Publish (or *Assets*) shows fewer components than the library has**: Figma silently skips a
  component with a property bound to no layer, or a text property with an empty default. A library
  generated before the props/flags rows has that problem (it published 88 of 161). Rebuild the
  plugin, re-run *Generate the library*, then run the **Self-test**: its *Publish* column must say
  `yes` for every row, and the toast counts `publishable N/N`. A `NO` names the property at fault.
- **A warning names a layer**: the layer's name and node id are in the message; find it in Figma
  with the node id in the URL (`?node-id=`).
- **A component cannot take children or a property does not appear**: re-run *Generate the library*
  with the current plugin, re-publish and accept the update; then run the **Self-test** and check its
  table.
- **A warning says an instance "is not a Mateu component"**: a component the current Mateu has
  removed (`ContentLayout`, for example, which older copies of the kit still draw). Replace it in the
  design with what its page recommends.
- **Slot content is missing from the YAML**: send the developers the downloaded `design.json` (it
  contains no token), so the converter can be checked against it.
