---
title: Build UIs with AI
description: Generate Mateu UIs with Claude Code, Codex or Antigravity CLI — shared skills, AGENTS.md in every project, plain-text references, JSON Schemas and the MCP endpoint.
---

A Mateu UI is a **model**, not front-end code: a class with annotations, or a few YAML files. That
is the shape an AI assistant generates best — few tokens, a closed vocabulary, and a result that
either validates or does not. This page lists what Mateu gives an assistant so that what it writes
is right the first time.

| You use | Give it | It knows |
|---|---|---|
| Claude Code | the **`mateu` plugin** | the whole API through skills that load on demand |
| Codex | the **`mateu` plugin** from the repository marketplace | the same eight skills, references and scripts |
| Antigravity CLI | the generated **`mateu` plugin** | the same eight skills, packaged for Antigravity |
| any assistant, in a Mateu project | the project's **`AGENTS.md`** (already there) | this project's layout, how to run it, the rules |
| any assistant / chat | **`llms.txt`**, **`llms-full.txt`**, the AI references | the docs, as plain text |
| an assistant writing YAML | the **JSON Schemas** | every key of every file kind, mechanically checked |
| an agent operating a running app | the **MCP endpoint** | the app's screens as tools |

## The Claude Code plugin

The Mateu repository is a Claude Code **plugin marketplace**. Install the plugin once:

```text
/plugin marketplace add miguelperezcolom/mateu
/plugin install mateu@mateu
```

(From a terminal: `claude plugin marketplace add miguelperezcolom/mateu` and
`claude plugin install mateu@mateu`. Pin a release with `miguelperezcolom/mateu#vMATEU_VERSION`.)

The plugin carries **skills** — focused guides the assistant loads when the task needs them.
Ask for the work in your own words (*"add a CRUD for suppliers"*,
*"a listing of orders from our REST API, with sample data until it exists"*, *"start a Mateu app on
Quarkus"*) and the right one activates; you can also call one by name, e.g. `/mateu:mateu-yaml`.

| Skill | Use it for |
|---|---|
| `mateu` | Screens in **Java**: `@UI` classes, CRUDs (`AutoCrud`, capability listings), forms and actions, wizards, dashboards and the other archetypes, fluent component trees, app shells, the annotation catalogue and its gotchas. |
| `mateu-screen` | A new screen when you have not named the archetype: three business questions pick the page family, the family picks the class. |
| `mateu-yaml` | UIs as **data**: `type: UI` mounts, `routes.yaml`, page definitions, `sources.yaml` and the other `specs/ui` file kinds, the app shell, partials, the JSON Schemas — and **static bundles** with no backend. |
| `mateu-dotnet` | Screens in **C#** on ASP.NET Core: `[UI]` classes, `Crud<T>`, the app shell, `AddMateu`/`MapMateu`. |
| `mateu-python` | Screens in **Python** on FastAPI: `@ui` classes, `Crud[...]`, the app shell, `add_mateu`. |
| `mateu-scaffold` | A new Java project or module and its Maven wiring (the annotation processors, the renderer) — and fixing "it compiles but nothing renders". |
| `mateu-run` | Build, run and screenshot a screen to see it render for real. |
| `mateu-federation` | Composing several apps or modules into one console (`@Menu`, `RemoteMenu`, micro-frontends). |

The skills are plain Markdown in
[`ai/claude-plugin/mateu/skills`](https://github.com/miguelperezcolom/mateu/tree/master/ai/claude-plugin/mateu/skills)
— the canonical source used by all three packages. Keep each skill's references, examples and
scripts together with its `SKILL.md`.

## Codex

Use a Codex CLI version that exposes `codex plugin` (check `codex plugin --help`). Add the
repository marketplace, then install the plugin:

```bash
codex plugin marketplace add miguelperezcolom/mateu --ref master \
    --sparse .agents/plugins --sparse ai/claude-plugin/mateu
codex plugin add mateu@mateu
codex plugin list --marketplace mateu --json
```

The sparse paths keep the download focused on the catalog and the complete plugin. For a
reproducible install, replace `master` with a release tag or commit **that contains the Codex
catalog and manifest**. Earlier tags do not acquire these files retroactively.

For a local checkout instead:

```bash
codex plugin marketplace add /absolute/path/to/mateu
codex plugin add mateu@mateu
```

In supported desktop clients, select the Mateu source in the Plugins Directory and install
the plugin there. Adding a marketplace makes it discoverable; it is separate from installation.
Start a new session after installation. Ask for a task normally or use the skill selector
(`/skills` or `$` in Codex CLI/IDE), for example `$mateu:mateu-yaml` for the plugin's YAML skill.

To refresh the repository catalog, run `codex plugin marketplace upgrade mateu`, then use
`codex plugin add mateu@mateu` to install the selected version and verify it with `plugin list`.
The Codex manifest loads the existing `skills/` directory; there is no second authored skill set.
See [OpenAI's packaging documentation](https://developers.openai.com/plugins/build/plugins).

## Antigravity CLI

From a checkout of the Mateu version you want, use Node 22+ to generate an installable bundle:

```bash
node scripts/package-antigravity-plugin.mjs
node scripts/check-ai-plugin.mjs --antigravity ai/antigravity-plugin/mateu
agy plugin install ./ai/antigravity-plugin/mateu
agy plugin list --json
```

The builder needs no npm packages or network access. It writes an ignored, generated directory
with `plugin.json`, all eight skill folders, their supporting files, `LICENSE.txt`, and
`package-info.json` recording the source version and SHA-256 hashes. Antigravity's manifest
uses its documented `name` and `description` fields; the source version is recorded separately.
The bundle can be moved outside the checkout before installation.

The output defaults to `ai/antigravity-plugin/mateu`; use `--output /path/to/mateu-plugin` to
choose another location. Rebuilding replaces an earlier generated bundle and removes stale
files. The builder refuses to replace an unrelated directory or overlap its source.

Start a new Antigravity session and use `/skills` to inspect the loaded skills. Ask for work
normally or invoke `/mateu-yaml`, `/mateu-screen`, or another skill by name. To update, check out
the desired Mateu revision, rebuild, verify, and reinstall the generated bundle. Follow the CLI's
prompt if an installed plugin must be uninstalled before reinstalling.

This installation uses a **local plugin directory**. Do not pass the monorepo root or assume a
GitHub `tree/…` URL selects a plugin subdirectory. See
[Antigravity's plugin documentation](https://antigravity.google/docs/plugins).

## Installation checks and official directories

After installing, confirm that the plugin lists all eight skills. Try authoring a small Java or
YAML screen, then ask the assistant to run it and capture it using `mateu-run`. The language skill
must find its reference files, and the run skill must find its bundled screenshot script.
Running builds or screenshots also needs the relevant runtime, Node/Playwright and browser
dependencies, plus permission to start local processes and download any missing dependencies.
Installing the skill package alone does not provide those tools or prove that an app renders.

For maintainers, validate the source and generated package without calling a model:

```bash
node scripts/package-antigravity-plugin.mjs
node scripts/check-ai-plugin.mjs --antigravity ai/antigravity-plugin/mateu
node --test scripts/ai-plugin-package.test.mjs
```

Edit skills only in `ai/claude-plugin/mateu/skills`. CI checks the two marketplace paths,
Claude/Codex metadata and version agreement, package contents, and release version updates.
Run the builder again after changing a skill or bumping the source version.

Repository distribution is separate from a listing in an official directory. OpenAI offers a
[skills-only submission path for Claude plugins](https://developers.openai.com/plugins/guides/submit-claude-plugin);
Antigravity links its marketplace interest form from the
[Marketplace guide](https://antigravity.google/docs/marketplace). Those submissions require their
own review; the repository catalogs do not submit or approve a listing.

## Projects come AI-ready

A project created by any of the [New Project front doors](/java-create-your-project/) — IntelliJ
**New Project › Mateu**, VS Code **Mateu: New Project…**, the `io.mateu:mateu-archetype` Maven
archetype — and every [starter](https://github.com/miguelperezcolom/mateu/tree/master/starters)
carries:

- **`AGENTS.md`** — what the project is, its layout, how to run it, where its UI is declared and the
  rules an assistant must respect (a view model is per request; actions must be declared; Mateu does
  not authenticate…). It is specific to the flavour: a YAML-only project's assistant is told to edit
  `specs/ui` and not to add UI classes, a C# project's how its attributes work. Codex, Cursor, Copilot
  and the other tools that read `AGENTS.md` pick it up as is.
- **`CLAUDE.md`** — one line, `@AGENTS.md`, so Claude Code reads the same text.
- **`.claude/settings.json`** (projects made by the generators) — it registers this marketplace and
  enables the `mateu` plugin. When you open the project in Claude Code and trust the folder, the
  marketplace is added for you; install the plugin once with `/plugin install mateu@mateu`.

`AGENTS.md` provides project context; it does not install skills. The Claude settings apply only
to Claude Code. In Codex and Antigravity CLI, install the plugin explicitly as described above.

## Docs as plain text: llms.txt and friends

| File | What it is |
|---|---|
| [`/llms.txt`](https://mateu.io/llms.txt) | The index of the documentation ([llmstxt.org](https://llmstxt.org) convention): what Mateu is and a link to every important page. |
| [`/llms-full.txt`](https://mateu.io/llms-full.txt) | **Every** page of this site in one text file, generated from the docs at build time. Large — for tools that ingest a whole site. |
| [`/mateu-ai-compact.md`](https://mateu.io/mateu-ai-compact.md) | A curated ~2 500-token reference: the annotations, patterns and return types used day to day. |
| [`/mateu-ai-full.md`](https://mateu.io/mateu-ai-full.md) | The curated complete reference (~9 000 tokens). |

How to load them in Claude Projects, Gemini, ChatGPT, Cursor and others:
[AI assistant reference](/ai-assistant-reference/).

## JSON Schemas: validate what the assistant writes

Every YAML file under `specs/ui` is described by a JSON Schema **generated from the records the
server reads**, so it cannot fall behind the code:

| Schema | Covers |
|---|---|
| [`specs-schema.json`](https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json) | Every `specs/ui` file kind (`type: UI`, `Routes`, `AppShell`, sources, actions, types, translations, environments, `Project`, pages) — use this one. |
| [`uidl-schema.json`](https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/uidl-schema.json) | The component catalogue (a page's component tree). |
| [`routes-schema.json`](https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/routes-schema.json), [`sources-schema.json`](https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/sources-schema.json) | The route registry and the REST source catalogue alone. |

Point the editor at it (the IntelliJ plugin and the VS Code extension do so for you), or start each
file with the schema key, as the starters do:

```yaml nocheck
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
```

(The loaders ignore the `$schema` key. In an editor without the Mateu extension the comment form
`# yaml-language-server: $schema=<same URL>` works too.)

For an assistant the schema is a **check**, not a hint: validate each generated file against it
before running anything (the `mateu-yaml` skill ships a validator script). A definition the server
cannot parse shows up as *Not found* on screen, with the reason only in the server log (`WARN Could
not read the definition specs/ui/…`, or on the page itself with `-Dmateu.dev=true`) — and an
unknown key is ignored silently by both the schema and the loader, so check key spellings too. Generating whole UIs from a prompt, validated against these schemas with a repair
loop, is described in [Prompt-to-app](/reference/prompt-to-app/). Editor setup:
[YAML pages › IntelliSense](/define/yaml/pages/#intellisense-setup).

## Agents that operate the running app: MCP

The other direction: an agent **using** an app instead of writing it. Every Mateu backend can serve
its screens as MCP tools (`POST /mateu/mcp`, off by default — `mateu.mcp.enabled=true`), and a
zero-dependency sidecar covers any backend over the public wire. See
[Agent operability (MCP)](/reference/agent-operability/).

## Check the result for real

An assistant's "it compiles" is not "it renders". Ask it to run the app and load the screen — the
`mateu-run` skill does it, screenshot included — or post to the sync endpoint and look at the
answer:

```bash
curl -s -X POST http://localhost:8080/mateu/v3/sync/products \
     -H 'Content-Type: application/json' \
     -d '{"route":"/products","consumedRoute":"","actionId":"","componentState":{}}'
```

(`consumedRoute: ""` asks for the page itself; without it a route under an app shell answers with
the shell.)
