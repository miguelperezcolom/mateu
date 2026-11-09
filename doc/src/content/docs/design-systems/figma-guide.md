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
  `order.yaml`. A frame whose name starts with `_` is a draft and is skipped.
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
- **Shared blocks.** A frame named `partial:<name>` is written once to `partials/<name>.yaml` and
  referenced from every page that contains it.
- **Notes.** Hidden layers and layers whose name starts with `#` are never read.

### Older libraries

Files designed before the library had native slots and properties still convert:

- the `#config` line inside an instance (`fieldId=email; required=true`) is still read — a property,
  when both exist, wins;
- a Section whose content slot is empty takes the layers that **follow** it in the same frame, up to
  the next Section.

Accepting the library update gives old instances the slots and properties; both spellings can live in
one file.

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
`routes.yaml`, `sources.yaml`, the app shell — are never touched. Do not edit a generated file:
change the design and convert again.

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

**Netlify**: create a personal access token (*User settings › Applications*). The next publish
updates the same site. The site's title comes from the panel's **Title** field, which starts as the file's name.

**Cloudflare Pages**: Cloudflare's API cannot be called from a Figma plugin (it does not allow
cross-origin calls), so the plugin goes through a small Worker that lives in **your own** account:

1. Create a Worker on the free plan and paste `design/figma/publish/cloudflare-relay/worker.js`. It
   stores nothing and forwards only the Pages API.
2. Create an API token with *Cloudflare Pages: Edit*.
3. In the panel, give the Worker's URL, your account ID, the token and a project name.

If your network cannot reach `workers.dev`, or you would rather not run a Worker, choose **Download a
zip** and drop it on a Cloudflare Pages project.

Tokens stay on your device (Figma's client storage), never in the Figma file. Routes, data and
button settings do travel in the file, so write nothing secret there.

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
