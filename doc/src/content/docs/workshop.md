---
title: "Hands-on workshop"
description: "Half a day of guided labs for Java, C# and Python developers: generate an app, run it on Vaadin and Oracle Redwood, on the phone and the desktop app, test it like a user, ship a YAML UI with no backend, let an AI agent operate it, and add a sign-in."
---

A **half-day, hands-on workshop**: attendees type, they do not watch, and every lab ends with
something running on their own machine. It lives in the repository, in
[`workshop/`](https://github.com/miguelperezcolom/mateu/tree/master/workshop) — guides in **English
and Spanish**, a short deck, and a `start/` and a `solution/` project for every code lab.

**Who it is for**: developers who build business applications, in one of three tracks — **Java**,
**C# (.NET)** or **Python**. The language-neutral labs (renderers on the phone and the desktop, YAML,
AI) are shared by the three tracks; only the code labs differ.

## The labs

| | Lab | What you leave with |
|---|---|---|
| 35′ | **01 · Your first app** | A generated app running; a field and a screen of your own |
| 30′ | **02 · One UI, every renderer** | The same app on Vaadin and on Oracle Redwood; a UI on your phone and in the desktop app |
| 25′ | **03 · Test it like a user** | UI tests that open screens, type and press — no browser ([the harness](/quality/testing-your-uis/)) |
| 35′ | **04 · UI as data** | A YAML UI edited in the [visual editor](/define/yaml/visual-editor/) and shipped as a static bundle — no backend |
| 30′ | **05 · AI agents over MCP** | An agent that reads and operates your screens, and pushes a screen it wrote onto your open UI ([agent operability](/reference/agent-operability/)) |
| 30′ | **06 · Sign-in** | [Sign-in](/deploy/sign-in/) with Keycloak; a field only a manager sees |
| — | **07 · Stretch labs** | Other templates and runtimes, your AI assistant building a screen |

About three and three-quarter hours with a break. Start at
[`workshop/README.md`](https://github.com/miguelperezcolom/mateu/blob/master/workshop/README.md)
([en español](https://github.com/miguelperezcolom/mateu/blob/master/workshop/README.es.md)); the
deck is `workshop/slides.html` (`slides.es.html`), opened in any browser.

## Before the day

Everybody: an IDE with the Mateu plugin (IntelliJ IDEA or VS Code), JDK 21+ and Maven 3.9+ (lab 04
builds a static bundle with a Maven plugin), Node.js 20+, Docker, the
[Mateu app](/native/mateu-app/) on a phone and the [desktop app](/native/desktop-app/), and an AI
coding agent that speaks MCP. C#: the .NET 10 SDK. Python: Python 3.11+. The workshop's lab 00 is a
five-minute checklist with the command that proves each item.

The phone and desktop labs use the public demo UIs (`museums.ec1.mateu.io`, `space.ec1.mateu.io`,
`frontoffice.ec1.mateu.io`), so they never depend on the room's network reaching a laptop.

## How it is kept honest

- The `start/` and `solution/` projects are **generated from the starters** — the same generator as
  the New Project wizards and the Maven archetype — plus a small overlay per lab, never kept by hand.
- `workshop/verify.sh` builds and tests every lab's start and solution in the three languages against
  the published release; `scripts/bump-example-version.sh` moves the labs with the starters after each
  release.
- Each guide says which steps are not in the pinned release yet (they are marked **coming in the
  next release**) and which known gaps apply.
