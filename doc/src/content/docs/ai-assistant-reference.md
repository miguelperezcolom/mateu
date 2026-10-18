---
title: Use Mateu with AI assistants
description: Context files for Claude, Gemini, Cursor, and other AI tools to generate correct Mateu code.
---

AI coding assistants generate much better Mateu code when they have the API in their context. This page provides ready-to-use reference files for the most common tools.

## Projects ship their own guidance

A project created from the [New Project front doors](/java-create-your-project/) (IntelliJ, VS Code,
the Maven archetype) — and every [starter](https://github.com/miguelperezcolom/mateu/tree/master/starters)
— carries an **`AGENTS.md`**: what the project is, its layout, how to run it, where its UI is
declared and the rules an assistant must respect. Its **`CLAUDE.md`** imports it (`@AGENTS.md`), so
Claude Code reads the same text as Codex, Cursor, Copilot and the other tools that read
`AGENTS.md`. Each flavour gets its own: a YAML-only project's assistant is told to edit `specs/ui`
and not to add Java UI classes.

## Reference files

| File | Size | Best for |
|---|---|---|
| [Compact reference](https://mateu.io/mateu-ai-compact.md) | ~2 500 tokens | Day-to-day code generation, tools with small context windows |
| [Full reference](https://mateu.io/mateu-ai-full.md) | ~9 000 tokens | Thorough assistance, broad feature coverage, Gemini 1.5 / Claude Projects |
| [llms-full.txt](https://mateu.io/llms-full.txt) | the whole site | Tools that ingest a documentation site in one file (generated from these pages at build time) |

Both files are plain Markdown — paste them directly, link to them, or download them.

---

## How to use with each tool

### Claude Code / Claude Agent SDK

Install the **`mateu` plugin** from the marketplace in the Mateu repository — a family of
**skills** that activate as soon as you ask for Mateu work (*"create a CRUD for…"*, *"a YAML listing
over our REST API"*, *"start a new Mateu app"*, *"run and screenshot this screen"*) and load their
references on demand (progressive disclosure), so they cost almost nothing until needed:

```text
/plugin marketplace add miguelperezcolom/mateu
/plugin install mateu@mateu
```

Projects made by the New Project generators already enable it in `.claude/settings.json`. Skills:
`mateu` (Java), `mateu-screen`, `mateu-yaml` (YAML specs and static bundles), `mateu-dotnet`,
`mateu-python`, `mateu-scaffold`, `mateu-run`, `mateu-federation` — what each does, and the rest of
the AI tooling (AGENTS.md, llms.txt, the JSON Schemas, MCP), is in
[Build UIs with AI](/build-uis-with-ai/). With the Claude Agent SDK, load the same skills from
[`ai/claude-plugin/mateu/skills`](https://github.com/miguelperezcolom/mateu/tree/master/ai/claude-plugin/mateu/skills)
(the plugin directory is the single source; inside the Mateu repository `.claude/skills/` links to it).

### Claude Projects (claude.ai)

1. Open [claude.ai](https://claude.ai) and create or open a **Project**.
2. In the project's **Instructions** section, paste the compact or full reference.
3. Every conversation in that project will have Mateu context automatically.

### Gemini Gems (gemini.google.com)

1. Open [Gemini](https://gemini.google.com) and click **Explore Gems → New gem**.
2. Paste the reference file content in the **Instructions** field.
3. Save the Gem as "Mateu developer". Use it for every Mateu coding session.

Gemini 1.5 Pro and 2.0 Flash both have large enough context windows for the full reference.

### ChatGPT / Custom GPT

1. Go to [chatgpt.com](https://chatgpt.com), open **Explore GPTs → Create a GPT**.
2. In the **Configure** tab, paste the reference in the **Instructions** field.
3. Or, in any regular conversation, paste the compact reference at the start and then ask your question.

### Cursor (cursor.sh)

Add a `.cursor/rules` file (or `.cursorrules` at the project root) with the compact reference content. Cursor will include it as context in every AI request for that project.

```
# In .cursor/rules or .cursorrules
[paste the contents of mateu-ai-compact.md here]
```

### GitHub Copilot

Copilot reads `/.github/copilot-instructions.md` for project-level context. Copy the compact reference there:

```bash
mkdir -p .github
curl -o .github/copilot-instructions.md https://mateu.io/mateu-ai-compact.md
```

### Any other tool

Paste the compact reference at the start of your conversation before your first question. Most models will retain it for the session.

---

## What to ask

Once the context is loaded, you can ask directly:

```
Create a CRUD for a Product entity with id, name, price, and active fields.
```

```
Add a wizard with 3 steps: account details, plan selection, and a success screen.
```

```
Build a dense multi-zone check-in form with @Compact and @Zones.
```

```
Add a @Banner that warns when the service is in maintenance mode.
```

```
Create a custom listing for orders with a status filter and server-side pagination.
```

---

## llms.txt

Mateu publishes an [`llms.txt`](https://mateu.io/llms.txt) at the site root following the [llms.txt proposal](https://llmstxt.org/). AI crawlers and tools that support the standard can discover the reference files automatically from there.
