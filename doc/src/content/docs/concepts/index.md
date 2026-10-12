---
title: "Concepts"
description: "The ideas every Mateu UI shares, whatever it is authored in, rendered by or served from: its building blocks (mount, app shell, routes, pages, partials, actions, data sources, state and triggers, plus the cross-cutting ones), the model and its wire, and federation."
---

These concepts apply to every Mateu UI. It doesn't matter whether the UI is written in YAML, Java,
C# or Python, rendered in a browser, on a phone or in IntelliJ, or served by a backend or shipped as
a static bundle. The language-specific manuals only change the **syntax**. The vocabulary below stays
the same.

## Start here: what a Mateu UI is made of

**[What a Mateu UI is made of](/concepts/building-blocks/)** is the map. It names every building
block, shows how the blocks connect in one diagram, and describes each one with the same template:
what it is, what it's for, where it lives, how you author it, and how it behaves when served versus
static. The pages below follow the same order.

## The building blocks

| Block | In one line | Page |
|---|---|---|
| **Mount** | a UI at a base path (`type: UI` or `@UI`) | [Routes & mounts](/concepts/routes-and-mounts/) |
| **App shell & menu** | the chrome, plus menu leaves that route somewhere or run an action | [App shell and menus](/concepts/app-shell-and-menus/) |
| **Routes** | URL → layout + optional view model + parameters (`routes.yaml`) | [Routes & mounts](/concepts/routes-and-mounts/) |
| **Pages & components** | a layout definition (a component tree) plus an optional view model | [Pages and components](/concepts/pages-and-components/) |
| **Partials** | a named piece of layout, spliced in wherever it is used | [Partials](/define/yaml/partials/) |
| **Actions** | flows of steps, REST calls or server methods, run by id (`actions.yaml`) | [Actions](/concepts/action-catalogue/) |
| **Data sources** | named REST endpoints, with sample data (`sources.yaml`) | [Data sources](/concepts/data-sources/) |
| **State & triggers** | `state` / `data` / `appState` / `appData`, `${…}`, rules and triggers | [State, scopes and triggers](/concepts/state-and-triggers/) |

And the cross-cutting blocks, which apply wherever something references them:

| Block | Page |
|---|---|
| **Field types** (`types.yaml`) | [Field types](/java-ui-definition/field-types/) |
| **Translations** (`translations/<locale>.yaml`) | [Translations](/define/yaml/translations/) |
| **Environments** (`environments/<name>.yaml`) | [Environments](/deploy/environments/) |
| **Access** (`access`, `eyesOnly`, `readOnlyUnless`, `disabledUnless`) | [Permissions](/define/yaml/permissions/) |
| **Project settings** (`project.yaml`) | [Project settings](/define/yaml/project-settings/) |

## Pages and patterns

Business screens fall into a few families: a listing, a record, a form, a guided process, a
dashboard and a landing page. Mateu has a starting point for each, and a catalogue of patterns on
top of them (wizards, master-detail, drawers, Gantt, planning boards…).

- [The Mateu Way](/the-mateu-way/): the six families and their starting points.
- [Page templates](/ux-patterns/page-templates/) and
  [choosing one](/ux-patterns/choosing-a-page-template/).
- [UX patterns](/ux-patterns/): the full catalogue.

## The model and the wire

Every authoring path produces the same building blocks. Every renderer consumes them, and they
travel as JSON (the **wire**) between whatever produced them and whatever renders them.

- [The model](/mateu-about/the-model/): producers, consumers and the rules that keep them in step.
- [The wire](/reference/wire-specification/): the versioned contract, and how a declaration
  becomes wire.
- [How Mateu works](/mateu-about/how-mateu-works/): the request cycle when a server is involved.
- [The authoring rule](/authoring-rule/).

## Federation

Several UIs, owned by different teams and built on different stacks, can be composed into one
console. A shell owns the chrome and the menu, and each domain owns its screens.

- [UI federation](/mateu-about/ui-federation/)
- [Shell and remote menus](/mateu-about/shell-and-remote-menus/)
- [Mateu in microservices](/mateu-about/microservices/) and the
  [case study](/case-study-microservices/)
- [Embedding Mateu](/mateu-about/embed/) in another web application
