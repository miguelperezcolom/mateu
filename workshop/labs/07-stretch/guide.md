# Lab 07 · Stretch labs (whenever you have time)

*[Español](guide.es.md)* · Pick any; none depends on another.

## A. Start from another template (Java)

*New Project › Mateu* has a template gallery. Generate one next to your workshop project and read
what it declares:

- **Dashboard + listings** — KPIs and charts computed from the data, a read-only searchable Orders listing.
- **Wizard-driven intake** — a multi-step request wizard with a branching step and a review.
- **Operations: board + calendar** — a kanban board whose cards move on the server, and the same tasks on a calendar.

Each one is a few classes; run it and count the frontend code (zero).

## B. The same app on another Java runtime

Generate the Product CRUD on **Quarkus**, **Micronaut**, **Helidon MP** or **Spring WebFlux** and copy
your `Quote` into it. The classes do not change; only the runtime and its annotation processor do.

## C. Let your AI assistant build a screen

The Mateu Claude Code plugin knows the API (the generated project already enables it in
`.claude/settings.json`; trust the folder, then `/plugin install mateu@mateu`). Ask:
*"Add a Customers CRUD with name, e-mail and a VIP flag, a menu entry, and a UI test for it."* Then
run `mvn test` / `dotnet test` / `pytest` — the harness of lab 03 checks what it wrote.

## D. Drive a user's live session from the server — *coming in the next release*

> **Not in 3.0-beta.64.** At the time of writing this is being built on a branch and has not reached
> `master` or a release. Do not try it on the workshop's version.

The plan: an agent paired with a user's open UI (as in lab 05) reads the screen the user is looking
at (`mateu_get_session_screen`), fills fields in it (`set_session_fields`) and runs an action
(`run_session_action`) — the user watches it happen and keeps the last word. When it ships, this lab
will walk through it on the Quote screen.

## E. The desktop app as an MCP server — *coming in the next release*

> **Not in 3.0-beta.64.** It exists on a branch, not in a release.

An opt-in in the desktop app's *Settings › Mateu › AI agents (MCP)* will make the desktop app itself
an MCP server, so an agent can operate the UIs you have open in it.

## F. Ship your YAML UI to the phone

Deploy lab 04's `target/mateu-bundle` to any https static host (Netlify drop, GitHub Pages with an
SPA fallback, S3…) and add its address in the Mateu app: the phone draws the same static UI natively.
(The desktop app does not open static bundles.)
