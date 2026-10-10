# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, Copilot…) working in this project.
`CLAUDE.md` imports this file, so both conventions read the same text.

## What this is

A [Mateu](https://mateu.io) app on **ASP.NET Core (C#, .NET 8)**. Mateu is a **model-driven UI
system**: you declare the model once — classes annotated `[UI]` — and Mateu derives the forms,
CRUD screens, navigation and app shell. There is no frontend code to write: this backend answers
the Mateu wire (`POST /mateu/v3/sync/{route}`) and any Mateu renderer renders it.

## Layout

```
MateuStarter.csproj     the project; references Mateu.AspNetCore + Mateu.Uidl
Program.cs              AddMateu(assembly) discovers every [UI]/[App] class; MapMateu() serves the wire
Products.cs             the model (Product) and the UI (a Crud<Product> mounted with [UI("products")])
```

## Run

```bash
dotnet run                   # sync API on http://localhost:8080 (MATEU_URL overrides it)
```

## Rules to respect

- **View models are per request.** A `[UI]` class is instantiated fresh for every request: keep
  shared data in a static store or an injected service, never in instance fields you expect to
  survive between requests.
- A CRUD is a `Crud<T>` overriding `Fetch`, `Get`, `Save` and `Delete`.
- Field behaviour comes from attributes (`[Required]`, `[Range]`, Mateu's `[Section]`, `[Tab]`,
  `[ReadOnly]`…); methods become actions. Check the docs before inventing an API.
- Do not hand-write controllers or frontend code for the UI — declare the model.

## References

- Docs: https://mateu.io (C# user manual: https://mateu.io/csharp-user-manual/).
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md and
  https://mateu.io/mateu-ai-full.md (Java-first; https://mateu.io/reference/language-rosetta/
  maps every annotation to its C# attribute).
- Source and Claude Code skills: https://github.com/miguelperezcolom/mateu (`.claude/skills/`).
