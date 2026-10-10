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
      -DarchetypeVersion=<release> -DgroupId=com.acme -DartifactId=my-app -Dauthoring=yaml
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

Open http://localhost:8080: an app shell with a **Products** listing — search, a status filter,
sorting and paging — over sample data.

## What you got

```
my-app/
├── pom.xml                       Spring Boot + mateu-mvc + the renderer
├── AGENTS.md, CLAUDE.md          guidance for AI assistants
└── src/main/
    ├── java/…/Application.java   boots the server — nothing else
    └── resources/specs/ui/
        ├── app.ui.yaml           the mount: this app at "/", its routes, its home
        ├── routes.yaml           each route bound to a definition
        ├── app.yaml              the app shell: title and menu
        ├── products.yaml         a page: the listing
        ├── sources.yaml          the REST endpoints, named once, with sample data
        └── project.yaml          project settings (the renderer)
```

The listing reads its rows from a **named source**:

```yaml
# products.yaml
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
[sample mode](/java-ui-definition/rest-source-catalogue/#sample-data-designing-without-an-api) on.
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

## No backend at all: the static flavour

Choose **YAML only, static (no backend)** instead (`-Dauthoring=static`) and the same `specs/ui`
is bundled at build time into plain files:

```bash
mvn package                        # → target/mateu-bundle/: index.html, manifest.json, assets/
npx serve -s target/mateu-bundle   # preview it at http://localhost:3000
```

Deploy `target/mateu-bundle/` to any static host with an SPA fallback. The browser calls the APIs
named in `sources.yaml` itself, so they must allow your site's origin (CORS); `.mvn/maven.config`
ships the sample data (`-Dmateu.bundle.mock=true`) until they exist. The build fails if a screen
still needs a server. See [A 100 % static UI](/java-user-manual/build/static-ui/).

## Next

- [Route registry](/java-ui-definition/route-registry/) — routes, parameters, nested routes.
- [REST source catalogue](/java-ui-definition/rest-source-catalogue/) — endpoints, field mapping,
  writes, sample data.
- [The YAML app shell](/java-ui-definition/yaml-app-shell/) — menus, home route, header actions.
- Need behaviour on the server for a screen? Bind a Java view model to its route
  (`viewModel:` in `routes.yaml`) — the **Code + YAML** flavour starts that way.
