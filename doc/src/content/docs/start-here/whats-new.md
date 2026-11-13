---
title: "What's new in 3.0"
description: "Mateu 3.0 at a glance for someone meeting it at the GA: what it is, and the main things the 3.0 line brings, each with a link to its page."
---

Mateu 3.0 is the first General Availability release of the 3.x line. This page is for someone who
meets Mateu now: what it is in a few lines, then the main things 3.0 brings, each with a link to
read more. The full list of changes is the
[CHANGELOG](https://github.com/miguelperezcolom/mateu/blob/master/CHANGELOG.md).

:::tip[See it running]
The [Mateu Explorer](https://explorer.mateu.io) shows every component, page template, archetype,
behaviour and distributed-UI pattern running live, next to the code that renders it. It is itself a
Mateu app. (A preview: it is built on the release pinned in `demo/demo-explorer`, `3.0-beta.64` today.)
:::

## What Mateu is

You define a business UI once, and Mateu draws it.

- **Define it as code or as data.** Write it in Java (`@UI`), C# (`[UI]`) or Python (`@ui`), or as
  YAML files under `specs/ui/`. The [visual editor](/define/yaml/visual-editor/) in IntelliJ and
  VS Code writes that YAML for you, and a [Figma](/design-systems/figma/) design can be converted
  to it. All of them produce the same model.
- **Render it anywhere.** On the web with [Vaadin](/design-systems/vaadin/) or
  [Oracle Redwood](/design-systems/oracle-redwood/), on phones with the
  [Mateu app](/native/react-native/), and on the desktop with the
  [Mateu desktop app](/native/desktop-app/) or inside IntelliJ. Every renderer reads the same
  [wire](/reference/wire-specification/).
- **Serve it or ship it.** A backend serves it: Spring Boot MVC or WebFlux, Quarkus, Micronaut or
  Helidon MP, ASP.NET Core or FastAPI. Or you export it as a [static bundle](/deploy/static-bundle/)
  that runs from a CDN with no backend at all.
- **Federate it.** UIs owned by different teams or services
  [compose into one console](/mateu-about/ui-federation/).

[What is Mateu](/mateu-about/what-is-mateu/) explains the idea in more detail, and
[Choose your path](/start-here/choose-your-path/) helps you pick a starting point.

## Highlights

### Page templates

A YAML `Form` can fill one of the Redwood page templates with `template:`: item overview, welcome,
dashboard landing, general overview, collection detail, foldout, multimedia content, advanced
create/edit, guided process, data management and hero search. The template decides the layout and
the look; you fill its fields and slots. Every renderer draws it; the Redwood renderer uses Oracle's
own Spectra page template wherever one exists.
[Page templates](/ux-patterns/page-templates/) ·
[`template:` in YAML](/define/yaml/pages/#page-templates--template)

### Archetypes

In code, a whole screen can start from an archetype class: `AutoCrud`, `Wizard`, `Dashboard`,
`Welcome`, `HeroSearch`, `SmartSearchPage`, `TodoList`, `CalendarPage`, `CollectionDetail`,
`GeneralOverview`, `ItemOverview`, `Foldout`, `GanttPage`, `DataManagement` and `ImportWizard`.
Mateu can also infer some of them from the fields a plain class declares (`@AutoPage`).
[The Mateu Way](/the-mateu-way/) · [Page types](/ux/page-types/) ·
[Layout inference](/ux-patterns/layout-inference/)

### UX patterns

About a hundred patterns are documented, each with its solution in Mateu. A few that are new or
much changed in 3.0:

- **Progress and notifications.** A `LongTask` reports a task, and each renderer shows it its own
  way: a modal progress for a blocking task, a task center for background ones (cancel, retry,
  "open the result"), and the platform's own background tasks in IntelliJ. The notification inbox
  groups, filters and resolves entries, offers actions on them, and can be pushed live to the
  user's open sessions. [Long-running jobs](/ux-patterns/long-running-jobs/) ·
  [Notification inbox](/ux-patterns/notification-inbox/)
- **Command center.** A full-screen palette with navigation, global search, recent screens and the
  AI chat, opened from a button that is always there. [Command center](/ux-patterns/command-center/)
- **App context.** A selector on the app header (active hotel, company, fiscal year) whose value
  every request carries. [App context](/ux-patterns/app-context/)
- **Smart search.** Listings filter through one search bar with typed filters (ranges,
  multi-select) shown as chips, and saved views. [Smart search](/ux-patterns/smart-search/) ·
  [Filters and listings](/ux-patterns/filters-and-listing/)

The [UX guide](/ux/) and the [pattern catalogue](/ux-patterns/) list the rest.

### Figma → YAML (preview)

The Mateu component library is published on Figma Community as the
[Mateu UI Kit](https://www.figma.com/community/file/1701291643502429777): duplicate it,
design your screens with it, and import the file in one step from Maven, IntelliJ or VS Code. Each
screen frame becomes a YAML page, and each new page is added to `routes.yaml`. The library uses
Figma's native slots and component properties. This pipeline is a preview: it may change in any
release, but the YAML it writes is ordinary, stable YAML.
[From Figma](/design-systems/figma/) · [Import from Figma](/design-systems/figma-import/)

### Federation and micro frontends

A shell can include other UI modules in the same process (a Maven dependency), or other services at
runtime through remote menus. A page can embed another service's screen as a micro frontend,
resolved in the browser or, new in 3.0, by the server before the page is sent. A content slot
fills a part of a page from a content service.
[UI federation](/mateu-about/ui-federation/) ·
[Using external Mateu UIs](/java-user-manual/build/using-external-mateu-uis/) ·
[Micro frontend](/java-ui-definition/components/micro-frontend/) ·
[Content slot](/java-ui-definition/components/content-slot/)

### MCP: authoring and live UI push

The MCP endpoint lets an agent operate a running app's screens. It can also author them: list the
components, read their schema, and validate and preview YAML (saving it is allowed only in dev
mode). With live push turned on, an agent can send a screen to a UI that is open in a browser, the
phone app or the IDE. Both are off unless you turn them on.
[Agent operability](/reference/agent-operability/) · [Build UIs with AI](/build-uis-with-ai/)

### The phone app and the desktop app

The Mateu app for iOS and Android is a hub: you add UIs to it with a QR code or a link, and it
draws them in Material Design 3, with sign-in through your identity provider and over-the-air
updates. The desktop app (macOS, Windows, Linux) does the same on a computer. Both can also be
built as a "fixed" app bound to one UI, under your own name.
[Mobile app](/native/react-native/) · [Desktop app](/native/desktop-app/) ·
[App stores](/deploy/mobile-app-stores/)

### Performance

Mateu's own assets are now served gzip-compressed by every Java adapter, and by the .NET and
Python servers when they serve the page. On a throttled
mobile connection (Fast 3G with a 4× slower CPU), the first content of a Vaadin page appears about
three times sooner: 14.4 s before, 4.6 s after, with 0.65 MB of JavaScript instead of 2.6 MB. A
static bundle writes pre-compressed `.gz` files beside its assets, for hosts that serve them as
they are. Request handling on the server also got faster (for example, a simple form's request
takes about half the time).

### Security defaults

- **Strict action mode** is the default: a request can run only an action the screen offers.
- **CRUD writes are checked on the server**, so a read-only or non-deletable listing refuses the
  write even if a client sends it.
- **CORS and MCP are off** unless you configure them.
- **Mateu does not authenticate.** The caller's identity comes only from what your framework
  authenticated.
- **Secrets stay on the server:** `${secret.X}` is resolved only on proxied REST calls.
- **An unexpected error shows a reference id**, never a stack trace, unless you turn detailed
  errors on. The same texts in the three servers.

[Security](/java-user-manual/advanced/security/) ·
[Access & permissions in YAML](/define/yaml/permissions/)

### .NET and Python

ASP.NET Core (`Mateu.AspNetCore` on NuGet) and FastAPI (`mateu-ui` on PyPI) are full Mateu
servers. They emit the same wire as Java, checked by a shared conformance corpus that all three
servers must match exactly, so every renderer draws them. They do not cover the whole Java surface
yet; the [parity matrix](/reference/parity/) lists every gap.
[C# manual](/csharp-user-manual/) · [Python manual](/python-user-manual/)

## What is stable

The Java API, YAML authoring, static bundles, the wire and the Vaadin and Redwood renderers are
stable within 3.x. APIs marked `@Experimental` may still change in a minor release.
[Stability & versioning](/reference/stability-and-versioning/) ·
[Support policy](/reference/support-policy/) · [Known issues](/reference/known-issues/)
