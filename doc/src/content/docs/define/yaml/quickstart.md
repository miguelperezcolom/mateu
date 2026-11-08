---
title: "Quickstart: YAML only"
description: "A Mateu app with no UI code — the UI is YAML under specs/ui, served by Spring Boot or bundled into static files for a CDN."
---

A Mateu app whose UI is **data**: a few YAML files under `src/main/resources/specs/ui/`. You write
**no code** — the only Java is the Spring Boot main class the generator gives you, and the static
flavour has none at all.

You need **Java 21** and **Maven 3.9+**.

## 1. Create the project

Pick one front door ([all of them](/java-create-your-project/) generate the same project):

- **IntelliJ IDEA**: File › New › Project… › **Mateu**, authoring **YAML only, served by a backend**.
- **VS Code**: command palette › **Mateu: New Project…** › **YAML only, served by a backend**.
- **Maven**:

  ```bash
  mvn archetype:generate -DarchetypeGroupId=io.mateu -DarchetypeArtifactId=mateu-archetype \
      -DarchetypeVersion=MATEU_VERSION -DgroupId=com.acme -DartifactId=my-app -Dauthoring=yaml
  ```

:::caution[The archetype needs a JDK 21–25]
Maven's archetype plugin runs a Groovy script that cannot read newer class files: on JDK 26+ it
fails with *"BUG! exception in phase 'semantic analysis' … Unsupported class file major version
70"* and leaves a half-generated folder (`variants/`, `generator/`). Delete that folder and rerun
with `JAVA_HOME` pointing at a JDK 21–25. The IDE wizards have no such limit.
:::

It is the [`starters/yaml`](https://github.com/miguelperezcolom/mateu/tree/master/starters/yaml)
project of the repository, which CI builds and boots on every change.

## 2. Run it

```bash
cd my-app
mvn spring-boot:run
```

Open http://localhost:8080: an app shell with a menu (**Home**, **Products**) opening on a home
page, whose **Browse products** button leads to a listing — search, a status filter, sorting and
paging — over sample data.

## What you got

```
my-app/
├── pom.xml                       Spring Boot + mateu-mvc + the renderer
├── AGENTS.md, CLAUDE.md          guidance for AI assistants
└── src/main/
    ├── java/…/Application.java   boots the server — nothing else
    └── resources/specs/ui/
        ├── app.ui.yaml           the mount: this app at "/", its routes, its home (`home: home`)
        ├── routes.yaml           each route bound to a definition
        ├── app.yaml              the app shell: title and menu
        ├── home.yaml             a page: the home, with a call to action to the products
        ├── products.yaml         a page: the listing
        ├── sources.yaml          the REST endpoints, named once, with sample data
        └── project.yaml          project settings (the renderer)
```

The home page is a hero whose button navigates — its `actionable` is a `RouteLink`, so there is
nothing behind it to run:

```yaml
# home.yaml
pageType: landing
type: VerticalLayout
fullWidth: true
horizontalAlignment: STRETCH
content:
  - type: HeroSection
    title: My app
    subtitle: Every screen here is declared as data, in src/main/resources/specs/ui.
    centered: true
    content:
      - type: Button
        label: Browse products
        buttonStyle: primary
        actionable:
          type: RouteLink
          route: products
```

The listing reads its rows from a **named source**:

```yaml
# products.yaml
pageType: collection
type: Listing
title: Products
searchable: true
rowsSource:
  ref: products
columns:
  - {type: GridColumn, id: id, label: Id, identifier: true}
  - {type: GridColumn, id: name, label: Name}
  - {type: GridColumn, id: status, label: Status, dataType: status}
```

```yaml
# sources.yaml
sources:
  - name: products
    source:
      url: /api/products
    sample:
      - {id: P-001, name: Espresso machine, price: 249.0, status: AVAILABLE}
```

Until your API exists the source answers with its `sample:` — the generated main class turns
[sample mode](/concepts/data-sources/#sample-data-designing-without-an-api) on.
Point `url` at your API and run with `-Dmateu.sources.mock=false` to go live.

## 3. Add a screen

A screen is a definition file plus a route and, if it belongs in the menu, a menu entry:

1. Create `specs/ui/orders.yaml` — in IntelliJ **New › Mateu › Page…** or in VS Code
   **Mateu: New File…** start it from a page template, then edit it in the **visual editor**.
2. Add the route in `routes.yaml` (**Add Route…** in both IDEs):

   ```yaml
     - route: orders
       layout: orders.yaml
   ```
3. Add it to the menu in `app.yaml`:

   ```yaml
     - type: RouteLink
       label: Orders
       route: orders
   ```

Every file carries a `$schema` line, so both IDEs validate and complete it.

## 4. Open a record and create one

The listing becomes a CRUD with two more pages and three more lines: a **row route** opens a record
page that loads the row by its id, and a **New** button leads to a form whose save is a REST call.

1. In `products.yaml`, make the rows open their record and add the button:

   ```yaml
   rowRoute: products/${row.id}
   toolbar:
     - {type: Button, label: New, buttonStyle: primary, actionable: {type: RouteLink, route: products/new}}
   ```

2. In `routes.yaml`, the two pages. The record route's `:id` seeds the page state, so the `product`
   source below reads it as `${state.id}`; `data:` names the source the page loads on entry:

   ```yaml
     - route: products/new
       layout: product-new.yaml
     - route: products/:id
       layout: product.yaml
       data: product
   ```

3. In `sources.yaml`, the two endpoints (with sample answers until the API exists):

   ```yaml
     - name: product
       source:
         url: /api/products/${state.id}
       sample: {id: P-001, name: Espresso machine, price: 249.0, status: AVAILABLE}
     - name: product-create
       source:
         url: /api/products
         method: POST
         body: '{"id": "${state.id}", "name": "${state.name}", "price": ${state.price}}'
       sample: {ok: true}
   ```

4. `product.yaml`, the record — read-only fields named like the response's keys:

   ```yaml
   type: Form
   title: ${state.name}
   subtitle: Product
   toolbar:
     - {type: Button, actionId: backToList, label: Back to products, actionable: {type: RouteLink, route: products}}
   content:
     - type: FormLayout
       content:
         - {type: FormField, id: id, label: Id, readOnly: true}
         - {type: FormField, id: name, label: Name, readOnly: true}
         - {type: FormField, id: price, label: Price, readOnly: true}
         - {type: FormField, id: status, label: Status, readOnly: true}
   ```

5. `product-new.yaml`, the form. Its **Save** runs the `create` action, which the page declares
   under `actions:` — a REST call, then a message and back to the listing:

   ```yaml
   type: Form
   title: New product
   confirmOnNavigationIfDirty: true
   toolbar:
     - {type: Button, label: Cancel, actionable: {type: RouteLink, route: products}}
     - {type: Button, label: Save, buttonStyle: primary, actionId: create}
   content:
     - type: FormLayout
       content:
         - {type: FormField, id: id, label: Id, dataType: string, required: true}
         - {type: FormField, id: name, label: Name, dataType: string, required: true}
         - {type: FormField, id: price, label: Price, dataType: number}
   actions:
     - id: create
       validationRequired: true
       restAction:
         source: {ref: product-create}
         successMessage: Product created
         successRoute: products
   ```

Restart (or rebuild) and click a row, then **New**. In sample mode two things are expected: every
record shows the **same** sample (a `sample:` is one fixed response, whatever `${state.id}` is), and
a save shows *Product created* without storing anything. Point the sources at your API to see real
records. Editing and deleting are more actions of the same kind (`method: PUT` / `DELETE` on a
source) — see [Writing from YAML](/deploy/static-ui/#what-a-static-screen-is-made-of).

## No backend at all: the static flavour

Choose **YAML only, static (no backend)** instead (`-Dauthoring=static`) and the same `specs/ui`
is bundled at build time into plain files:

```bash
mvn mateu-bundle:dev               # http://localhost:3000, rebuilt and reloaded on every save
mvn package                        # → target/mateu-bundle/: index.html, manifest.json, assets/
npx serve -s target/mateu-bundle   # preview the finished bundle at http://localhost:3000
```

`mateu-bundle:dev` keeps serving the last good bundle when a save breaks the build, and
`-Dmateu.dev.liveReload=false` turns the page reload off (the rebuilds go on). See
[Develop with live reload](/deploy/static-ui/#develop-with-live-reload).

Deploy `target/mateu-bundle/` to any static host with an SPA fallback. The browser calls the APIs
named in `sources.yaml` itself, so they must allow your site's origin (CORS); `.mvn/maven.config`
ships the sample data (`-Dmateu.bundle.mock=true`) until they exist. The build fails if a screen
still needs a server. See [A 100 % static UI](/deploy/static-ui/).

## Next

- [Route registry](/concepts/routes-and-mounts/) — routes, parameters, nested routes.
- [REST source catalogue](/concepts/data-sources/) — endpoints, field mapping,
  writes, sample data.
- [The YAML app shell](/define/yaml/app-shell/) — menus, home route, header actions.
- Need behaviour on the server for a screen? Bind a Java view model to its route
  (`viewModel:` in `routes.yaml`) — the **Code + YAML** flavour starts that way.
