# Mateu 3.0.0 — release notes (draft)

> Draft for the maintainer, for `gh release create v3.0-rc.1 --notes-file …` and then `v3.0.0`.
> Everything below the line is the text of the release; the [RC process](#the-rc-process) section is
> for the maintainer and is left out of the published notes. Before publishing: replace the
> `3.0-beta.51` references with the last beta actually released, and check the Known issues list
> against [the page](https://mateu.io/reference/known-issues/).

---

**Mateu 3.0 is the first General Availability release of the 3.x line.** It closes the
`3.0-alpha.*` series and the 51 betas that followed it (`3.0-beta.1`, 18
October 2026, to `3.0-beta.51`, 4 November 2026).

## What Mateu 3.0 is

A **model-driven UI system**: you declare a UI once and Mateu renders it — forms, CRUDs, listings,
navigation, wizards, dashboards and whole app shells — with no frontend code for a typical business
app.

- **Declare it as code or as data.** As **code** in Java (an `@UI` class), C# (`[UI]`) or Python
  (`@ui`); or as **data** — YAML under `specs/ui/` (`type: UI` mounts, `routes.yaml`, page
  definitions, `sources.yaml` REST sources, app shells). Both feed the same wire model, and one app
  can mix them.
- **Render it anywhere.** In the browser with the **Vaadin** renderer or the **Oracle Redwood /
  Visual Builder** renderer; on the phone with the **React Native** app (iOS, Android); on the desktop
  with the **Mateu desktop app** (macOS, Windows, Linux) and in **IntelliJ IDEA**. Every renderer
  speaks the same wire (`/mateu/v3/sync`), so any server serves any renderer.
- **Serve it or ship it.** A UI can be **served** by a backend — Spring MVC, Spring WebFlux, Quarkus,
  Micronaut or Helidon MP in Java, ASP.NET Core in .NET, FastAPI in Python — or exported as a
  **static bundle** to any CDN, with no backend at all.
- **Federate it.** A shell can aggregate UI modules in-process (by Maven dependency) or independent
  services at runtime (`RemoteMenu`, micro frontends resolved in the browser or in the server), each
  team releasing its own part.

## Get it

| | |
|---|---|
| **Java** | `io.mateu:mateu-bom:3.0.0` on Maven Central — Java 21+, Spring Boot 4, Quarkus 3, Micronaut 4, Helidon MP 4 |
| **.NET** | `Mateu.AspNetCore` `3.0.0` on NuGet — `net8.0` and `net10.0` |
| **Python** | `pip install "mateu-ui[server]==3.0.0"` — Python 3.11+, FastAPI |
| **New project** | IntelliJ **File › New › Project › Mateu**, VS Code **Mateu: New Project…**, or the `io.mateu:mateu-archetype` Maven archetype — all three generate from the same starters |
| **Apps** | the desktop installers and the Android app are attached to this release; the IntelliJ plugin and the VS Code extension are published with it |

## What is stable, what is not

The full statement is [Support policy › How mature each part is](https://mateu.io/reference/support-policy/#how-mature-each-part-is-in-30).

- **Stable** — covered by [Stability & versioning](https://mateu.io/reference/stability-and-versioning/):
  no breaking change within 3.x, every change goes add-then-deprecate, and the build enforces it
  (japicmp for Java, pinned public surfaces for .NET and Python). That covers the Java authoring API
  (`mateu-uidl`) and the archetypes, the five Java adapters, YAML authoring and its schemas, static
  bundles, the wire (`wireVersion` 3.x, additive) and the Vaadin and Redwood renderers.
- **Experimental** — APIs marked `@Experimental` may still change in a minor. The exact list, type by
  type, is generated from the code:
  [Stable and experimental API, by package](https://mateu.io/reference/stability-and-versioning/#stable-and-experimental-api-by-package).
- **Supported with documented gaps** — the **.NET** and **Python** servers. They get the same fixes
  and API rules, emit the same wire (the shared conformance corpus — 53 cases — matches exactly in the
  three servers), but do not cover the whole Java surface yet; every gap is a row of the
  [feature parity matrix](https://mateu.io/reference/parity/). The native renderers (React Native,
  IntelliJ / desktop app) are listed there too.
- **Preview** — not part of the 3.0 promise; behaviour, files and commands may change in any release:
  - the **Figma → YAML** pipeline (contract, library plugin, converter);
  - the **visual editor** (IntelliJ, VS Code, browser);
  - the **VS Code extension**.

  What they write is ordinary `specs/ui/**` YAML, which is stable.

**.NET 8.** Microsoft ends support for .NET 8 on 10 November 2026. Mateu **3.0 keeps the `net8.0`
target**; **3.1 drops it**. Move your app to .NET 10 before upgrading to 3.1.

## Highlights of the 3.0 line

- **One declaration, many renderers** over one documented, versioned wire, with a generated
  `wire-schema.json` and a conformance corpus every producer and renderer runs in CI.
- **Code-first and data-first are equals**: routes, REST sources, action catalogues, field types,
  translations, environments and app shells can each be authored in YAML or in code, merged into one
  table (YAML wins).
- **Page archetypes** for whole screens — Dashboard, CollectionDetail, GeneralOverview, Foldout,
  ItemOverview, HeroSearch, SmartSearch, TodoList, Calendar, Gantt, DataManagement, Welcome, Wizard,
  ImportWizard — and Redwood page templates in YAML (`template:`); layout and page **inference**
  (`@AutoLayout`, `@AutoPage`).
- **CRUDs and listings** built from capability interfaces (`Listing`, `Navigable`, `Editable`,
  `Creatable`, `Deletable`), with a smart search bar, typed filters, inline editing, drawers,
  aggregates and grouping, optimistic locking, bulk actions and exports.
- **External REST without a backend of your own**: a named source catalogue (`sources.yaml`), REST
  options/data/listings/actions, and a server-side proxy that keeps secrets off the browser — plus a
  derived OpenAPI contract and a generated Spring Boot server skeleton.
- **Secure by default**: strict action mode, CRUD writes gated server-side, CORS and MCP off unless
  enabled, identity only from what the host framework authenticated, one error boundary with
  reference ids in the three servers.
- **Accessibility and slow-network resilience** built into every renderer (web, Redwood, React
  Native, IntelliJ): live-region announcements, focus management, skip links; retries for reads,
  never for writes, offline banners and plain-language errors.
- **Native apps**: a hub or fixed-variant phone app and desktop app (QR / `mateu://` links, OIDC
  sign-in, over-the-air updates), Material 3 on Android.
- **AI**: an MCP surface to operate and author screens, live UI push to an open session, the AI chat
  panel (Follow mode), and the `mateu` Claude Code / Codex plugin with its skills.

## New since the last beta

- **Progress and notifications as patterns.** A `LongTask` reports a task (title, text, fraction or
  "12 of 300", state) and each renderer shows it its own way: a modal progress when it blocks, a
  task center for background work, IntelliJ's own background tasks. Tasks can be cancelled (only by
  the caller who started them), retried, and offer a result action or land in the inbox when done
  (`@Experimental`). `Message` gains persistence (`toast`, `sticky`, `inbox`), actions and a dedup
  key; the inbox groups, filters, resolves and acts on entries, and `LiveNotifications.publish`
  pushes changes to the user's open sessions. Inbox actions only reach the caller's own entries.
  Java, .NET and Python.
- **Figma.** The library uses Figma's native slots and component properties for every component, and
  ships with a self-test. It is published as the
  [Mateu UI Kit](https://www.figma.com/community/file/1701264060329352693/mateu-ui-kit) on Figma
  Community. **Import from Figma** turns a file into `specs/ui` pages and routes in one step:
  `mvn io.mateu:mateu-bundle-maven-plugin:figma`, IntelliJ or VS Code. Still a preview.
- **The Mateu Explorer** — every component, page template, archetype, behaviour and distributed-UI
  pattern running live with its code, at [explorer.mateu.io](https://explorer.mateu.io) (preview).
  Building it found and fixed a series of framework bugs.
- **Performance.** Mateu's own assets are served gzip-compressed by every Java adapter and by the
  .NET and Python servers: a Vaadin first load on Fast 3G with a 4× CPU slowdown goes from 14.4 s to
  4.6 s to first content (2.6 MB → 0.65 MB of JavaScript). Static bundles write pre-compressed `.gz`
  siblings. Record shapes are read once per class, which roughly halves the server time of a simple
  request. Method and numbers: `design/performance/baseline-2026-11.md`; a first-load budget runs
  in CI.
- **Security: locked fields.** A field that a YAML partial or business component locks
  (`eyesOnly`, `readOnlyUnless`…) never takes a client-posted value, also when the partial is drawn
  inside a Java page, and access keys are applied per caller. Java, .NET and Python.

## Upgrading

- **From a 3.0 beta**: set the Mateu version to `3.0.0` (the BOM, `<mateu.version>`, the NuGet and
  PyPI pins). The **alpha-era APIs that the betas deprecated are removed in 3.0.0** — the list, with
  the replacement of each, is the **Removed** section of
  [CHANGELOG.md](https://github.com/miguelperezcolom/mateu/blob/master/CHANGELOG.md). Compile against
  the last beta first and clear its deprecation warnings: code that builds on the last beta with no
  deprecation warning should build on 3.0.0 unchanged. APIs introduced during the betas that are still settling
  are marked `@Experimental` instead.
- **From an alpha**: read [Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/)
  first — every rename and removal of the alpha series in one place — then follow the beta steps.
- **YAML `$schema`**: generated projects now point `$schema` at the schemas of the release they target
  (`https://raw.githubusercontent.com/miguelperezcolom/mateu/v<version>/backend/shared/uidl/…`), not
  master. Update yours the same way when you upgrade, so your editor validates against your version.
- **npm `mateu-vaadin`**: the package on npm (`0.0.15`) is not maintained. Load the renderer from a
  Mateu app (`/assets/mateu-vaadin.js`), as in [Embedded UI](https://mateu.io/java-user-manual/use-cases/embedded-ui/).

## Known issues

The maintained list, each item with its workaround, is
[Known issues](https://mateu.io/reference/known-issues/). The ones most likely to matter:

- **The Windows desktop installer is not code-signed.** SmartScreen stops it on first run ("Windows
  protected your PC"). Check the file against this release's assets (each one lists its SHA-256),
  then choose **More info ▸ Run anyway**. Details:
  [Installing on Windows](https://mateu.io/native/desktop-app/#windows).
- **A servlet context path or a prefix-stripping proxy is not supported** — serve Mateu at the
  host root.
- **Redwood renders in light theme only.**
- **Multi-value fields do not read `optionsSource`** (single-select fields do).
- **The .NET and Python servers** lack the Java features listed in the
  [parity matrix](https://mateu.io/reference/parity/#what-is-still-java-only) — among them the
  editable-view orchestrators, YAML app shells and the static-bundle exporter.

## Thanks

To everyone who ran the alphas and betas in real projects and reported what broke.

---

## The RC process

1. **`v3.0-rc.1`** — tag it from master once the API-removal and `@Experimental` work and the plugin
   range fix are merged and the required checks (`ci-ok`, `examples-ok`, `docs-ok`) are green. It
   publishes like any release: Maven `3.0-rc.1`, NuGet `3.0.0-rc.1`, PyPI `3.0.0rc1`, IntelliJ
   `3.0-rc.1`, VS Code `2.999.1` (`scripts/plugin-versions.sh`). Merge the "Point the examples at
   3.0-rc.1" PR the release workflow opens.
2. **At least one week with no blocker.** A blocker is a regression from the last beta, a security
   issue, a data-loss bug, or a stable API that must change before it is frozen. A blocker gets
   fixed and released as `v3.0-rc.N+1`, and the week starts again. Anything else waits for `3.0.1`.
3. **`v3.0.0`** — tagged on master with no code change since the last RC other than its
   examples-bump PR (versions come from the tag).
   Publish with these notes; the IDE plugins go out as `3.0.0` in both marketplaces. Then merge the
   bump PR, which points the starters, the quickstart, the AI plugin and the generated projects'
   `$schema` at `3.0.0`.
