# Mateu workshop — hands-on, half a day

*[Leer en español](README.es.md)*

You declare a UI once — in **Java, C# or Python**, or as **YAML** — and Mateu renders it: on the web
with two different design systems, on a phone, in a desktop app, for an AI agent. In this workshop you
**type**, you do not watch: every lab ends with something running on your machine.

**Audience**: developers who build business applications. Pick **one track** — Java, C# (.NET) or
Python. The language-neutral labs (renderers on the phone and the desktop, YAML, AI) are the same for
the three tracks; only the code labs differ.

**Mateu version**: every lab is pinned to **3.0-beta.64** — the release the
[starters](../starters) use. Nothing in the labs builds Mateu from source.

## Agenda

| Time | | Lab | What you leave with |
|---|---|---|---|
| 0:00 | 10′ | Welcome — [slides](slides.html) | What Mateu is, and how the afternoon goes |
| 0:10 | 35′ | [01 · Your first app](labs/01-first-app/guide.md) | A generated app running; a field and a screen of your own |
| 0:45 | 30′ | [02 · One UI, every renderer](labs/02-renderers/guide.md) | The same app on Vaadin and on Oracle Redwood; a UI on your phone and in the desktop app |
| 1:15 | 25′ | [03 · Test it like a user](labs/03-test-like-a-user/guide.md) | UI tests that open screens, type and press — no browser |
| 1:40 | 15′ | *Break* | |
| 1:55 | 35′ | [04 · UI as data](labs/04-ui-as-data/guide.md) | A YAML UI edited in the visual editor and shipped as a static bundle — no backend |
| 2:30 | 30′ | [05 · AI agents over MCP](labs/05-ai-agents/guide.md) | An agent that reads and operates your screens, and pushes a screen it wrote onto your open UI |
| 3:00 | 30′ | [06 · Sign-in](labs/06-sign-in/guide.md) | Sign-in with Keycloak; a field only a manager sees |
| 3:30 | 15′ | Wrap-up + [07 · Stretch labs](labs/07-stretch/guide.md) | Where to go next |

About **3 h 45 min** with the break. Each lab has **optional stretch steps** at the end for those who
finish early; skipping them never blocks the next lab.

## Before the day (do this at home — 20 minutes)

The room's network is not to be trusted: download everything beforehand.

**Everybody**

- An IDE with the Mateu plugin: **IntelliJ IDEA** (Settings › Plugins › Marketplace › "Mateu") or
  **VS Code** (Extensions › "Mateu"). The plugin brings the New Project wizard and the visual editor.
- **JDK 21+ and Maven 3.9+** — also for the C# and Python tracks: lab 04 builds a static bundle with a
  Maven plugin.
- **Node.js 20+** (lab 04 previews the bundle with `npx serve`).
- **Docker** (lab 06 starts Keycloak). Pull the image beforehand:
  `docker compose -f workshop/labs/06-sign-in/keycloak/compose.yml pull`.
- **A phone with the Mateu app**: [App Store](https://apps.apple.com/app/mateu/id6829227403) ·
  Android: [become a tester](https://mateu.io/native/android-testers/) or install the `-android.apk`
  of the [latest release](https://github.com/miguelperezcolom/mateu/releases/latest).
- **The Mateu desktop app** (macOS, Windows, Linux): the `mateu-desktop-…` installer of the
  [latest release](https://github.com/miguelperezcolom/mateu/releases/latest). On macOS the first
  launch of an unsigned build needs right-click › Open.
- **An AI coding agent that speaks MCP** for lab 05 — Claude Code, Codex, Cursor, VS Code Copilot
  agent mode… Any will do; the guide shows Claude Code's commands.
- This repository: `git clone https://github.com/miguelperezcolom/mateu.git` (the labs are in
  `workshop/labs`).

**Java track**: nothing else (JDK 21 + Maven, above).

**C# track**: the **.NET 10 SDK** (`dotnet --list-sdks` shows `10.0.x`). Then download the two web
renderers once — your app serves the one you point `MATEU_UI` at:
`workshop/tools/fetch-renderers.sh` (writes `workshop/renderers/mateu-vaadin.jar` and
`mateu-redwood.jar`).

**Python track**: **Python 3.11+** and `pip`. Download the renderers too
(`workshop/tools/fetch-renderers.sh`), and warm the package cache:
`pip download -d /tmp/wheels mateu-ui==3.0.0b64 fastapi uvicorn pytest httpx "pyjwt[crypto]"`.

**Check it all**: [lab 00 · Setup check](labs/00-setup/guide.md) — five minutes, the same list with
the command that proves each item.

## How the labs are organised

```
workshop/
  README.md, README.es.md     this page
  slides.html, slides.es.html the short deck (open in a browser; ← → to move)
  labs/
    00-setup/                 guide.md + guide.es.md — the checklist
    01-first-app/             guide.md + guide.es.md
      java/   start/ solution/   ← a complete project each, generated from starters/spring-mvc
      dotnet/ start/ solution/   ← from starters/dotnet
      python/ start/ solution/   ← from starters/python
    02-renderers/             java/ start/ solution/ (C# and Python change no code: the renderer is a file)
    03-test-like-a-user/      java/ dotnet/ python/
    04-ui-as-data/            start/ solution/  — shared by the three tracks (YAML, no language)
    05-ai-agents/             java/ dotnet/ python/
    06-sign-in/               java/ dotnet/ python/ + keycloak/ (compose file and realm)
    07-stretch/               guide only
  tools/
    build-labs.mjs            regenerates every start/ and solution/ from the starters
    steps/                    what each lab adds (the only hand-written lab code)
    fetch-renderers.sh        downloads mateu-vaadin.jar and mateu-redwood.jar for C# and Python
  verify.sh                   builds and tests every lab, start and solution, in the three languages
```

- **Every lab starts from the previous lab's solution.** Fell behind? Open the lab's `start/` and
  carry on: it is exactly where you should be.
- **`start/` and `solution/` are generated**, never kept by hand: `tools/build-labs.mjs` runs the New
  Project generator — the same engine as the IntelliJ and VS Code wizards and the Maven archetype —
  over `starters/`, then copies the step overlays of `tools/steps/<language>/<lab>/` on top. Change a
  starter and the labs follow.
- Each guide says **what to type**, **what you should see**, and ends with a **✅ checkpoint**: if
  you see it, move on; if not, compare with `solution/`.

## For the instructor

- `workshop/verify.sh` builds and tests every lab's start and solution against the published
  release (Maven Central, NuGet, PyPI) — run it before the session and in CI. It reports a track whose
  toolchain is missing as SKIPPED, never as passed.
- After a release, `scripts/bump-example-version.sh <version>` moves the starters **and** the labs;
  `node workshop/tools/build-labs.mjs --check` (run by `verify.sh`) fails if they drifted apart.
- Phones and desktops: lab 02 uses the **public demo UIs** (`museums.ec1.mateu.io`,
  `space.ec1.mateu.io`, `frontoffice.ec1.mateu.io`, CORS open) so they never depend on the room's
  network reaching a laptop. Opening the attendee's own laptop app on the phone is an optional step.
- Print or project the QR codes of the public UIs from `labs/02-renderers/guide.md`.
- **Known gaps at this version** (stated in the guides too): on C# and Python the Redwood renderer
  draws the shell but not the screens (Java is fine); the desktop app's own MCP server, driving a live
  session from the server and the header's user menu are on `master` or a branch, not in the release.
- **What a machine checked and what it did not**: every lab's start and solution compile and pass
  their tests (`verify.sh`); the screens, the Redwood switch, the static bundle, the MCP endpoint and
  the push onto an open UI, and the Keycloak sign-in were run end to end in a browser. The phone and
  desktop steps need a human with the device: the public UIs' addresses, manifests and the QR codes
  (decoded back) were checked, the apps themselves were not driven.
