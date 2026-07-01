---
title: Use Mateu with AI assistants
description: Context files for Claude, Gemini, Cursor, and other AI tools to generate correct Mateu code.
---

AI coding assistants generate much better Mateu code when they have the API in their context. This page provides ready-to-use reference files for the most common tools.

## Reference files

| File | Size | Best for |
|---|---|---|
| [Compact reference](https://mateu.io/mateu-ai-compact.md) | ~2 500 tokens | Day-to-day code generation, tools with small context windows |
| [Full reference](https://mateu.io/mateu-ai-full.md) | ~9 000 tokens | Thorough assistance, broad feature coverage, Gemini 1.5 / Claude Projects |

Both files are plain Markdown — paste them directly, link to them, or download them.

---

## How to use with each tool

### Claude Code / Claude Agent SDK

Mateu ships a family of ready-made **skills** under `.claude/skills/`. When you run
Claude Code (or the Claude Agent SDK) inside a project that contains them, the right
skill activates automatically as soon as you ask for Mateu work — *"create a CRUD
for…"*, *"start a new Mateu app"*, *"run and screenshot this screen"* — and loads its
references on demand (progressive disclosure), so they cost almost nothing until needed.

- **In the Mateu repo:** they are already there — just ask.
- **In your own project:** copy the `.claude/skills/` folder into your repo, or into
  `~/.claude/skills/` to make the skills available in every project.

| Skill | Use it for |
|---|---|
| `mateu` | Writing screens: CRUD, forms and actions, wizards, editor/partial-form views, fluent component trees, shells and federation, custom adapters / web components / CSS, and the full annotation catalogue. |
| `mateu-scaffold` | Wiring the Maven build: the two-step annotation processing (indexer + framework AP), the renderer dependency, the Spring Boot main class — and fixing "compiles but nothing renders". |
| `mateu-run` | Building in the right order, running the app, and screenshotting a route (Playwright) to see it render. |
| `mateu-federation` | Composing several `@UI` modules by Maven (build-time) or independent services by `RemoteMenu` (runtime). |

Each skill is a set of focused references the agent reads only when relevant, and stays in
sync with the compact and full references below.

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
