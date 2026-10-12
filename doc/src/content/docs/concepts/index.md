---
title: "Concepts"
description: "The ideas every Mateu UI shares, whatever it is authored in, rendered by or served from: the model and its wire, pages, routes and mounts, data sources, actions and federation."
---

These concepts apply to every Mateu UI, whether it is written in YAML, Java, C# or Python, rendered
in a browser, a phone or IntelliJ, and served by a backend or shipped as a static bundle. The
language-specific manuals only change the **syntax**; the vocabulary below stays the same.

## The model and the wire

A screen is a **component tree**, reached by **routes**, inside an **app shell**. That triple is the
model. Every authoring path produces it, every renderer consumes it, and it travels as JSON — the
**wire** — between whatever produced it and whatever renders it.

- [The model](/mateu-about/the-model/) — producers, consumers and the rules that keep them in step.
- [The wire](/reference/wire-specification/) — the versioned contract, and how a declaration
  becomes wire.
- [How Mateu works](/mateu-about/how-mateu-works/) — the request cycle when a server is involved.

## Pages and patterns

Business screens fall into a few families — a listing, a record, a form, a guided process, a
dashboard, a landing page. Mateu has a starting point for each, and a catalogue of patterns on top
(wizards, master-detail, drawers, Gantt, planning boards…).

- [The Mateu Way](/the-mateu-way/) — the six families and their starting points.
- [Page templates](/ux-patterns/page-templates/) and
  [choosing one](/ux-patterns/choosing-a-page-template/).
- [UX patterns](/ux-patterns/) — the full catalogue.

## Routes and mounts

A **mount** is a UI served at a base path. Inside it, **routes** bind a URL to a layout, an optional
view model and parameters. Routes are relative to the mount, so two domains can both have an
`orders` screen and still be composed into one console.

- [Routes & mounts](/concepts/routes-and-mounts/) — `routes.yaml`, parameters, nested routes, home
  pages, and how code-declared routes join the same table.

## Data sources

A screen that reads or writes data names an **endpoint** once, in a catalogue, and refers to it by
name everywhere. That is what lets a static bundle call your APIs directly, a server proxy them
with secrets kept off the browser, and a deployment re-point them without touching the screens.

- [Data sources](/concepts/data-sources/) — the REST source catalogue, field mapping, writes,
  sample data.
- [Environments](/deploy/environments/) — one catalogue, several deployments.

## Actions

Buttons, menu entries, row clicks and keyboard shortcuts all run **actions**. An action either runs
on a server (a method of a view model) or in the browser (a REST call or a flow declared as data) —
the screen does not need to know which.

- [Actions](/concepts/action-catalogue/) — client-runnable actions declared once and run by id.
- In code: [actions in Java](/java-ui-definition/actions/), and the
  [Language Rosetta](/reference/language-rosetta/) for C# and Python.

## Federation

Several UIs, owned by different teams, on different stacks, can be composed into one console: a
shell owns the chrome and the menu, each domain owns its screens.

- [UI federation](/mateu-about/ui-federation/)
- [Shell and remote menus](/mateu-about/shell-and-remote-menus/)
- [Mateu in microservices](/mateu-about/microservices/) and the
  [case study](/case-study-microservices/)
- [Embedding Mateu](/mateu-about/embed/) in another web application
