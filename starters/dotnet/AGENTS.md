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
Shell.cs                the app shell: [App] title + [MenuItem] menu (Home, Products); IHomeRouteSupplier picks the home page
Home.cs                 the home page: a Welcome with a "Browse products" call to action ([UI("home")])
Products.cs             the model (Product) and a Crud<Product> mounted with [UI("products")]
```

## Run

```bash
dotnet run                   # sync API on http://localhost:8080 (`--urls` or MATEU_URL override it)
MATEU_UI=mateu-vaadin-<version>.jar dotnet run   # + the web page at http://localhost:8080
```

To see the app in a browser, point `MATEU_UI` (or `app.MapMateu(ui: ...)`) at the web renderer:
the `io.mateu:mateu-vaadin` jar of your Mateu version from Maven Central
(`curl -LO https://repo1.maven.org/maven2/io/mateu/mateu-vaadin/<version>/mateu-vaadin-<version>.jar`),
or its extracted `static/` folder. The server then serves the page and its assets like a Java app.
Without it the server answers the sync API only — run a renderer against it instead, e.g. from a
Mateu checkout `MATEU_BACKEND=http://localhost:8080 npm run dev` in `frontend/web/monorepo/apps/vaadin`,
or the React Native app with `EXPO_PUBLIC_MATEU_BACKEND_URL=http://localhost:8080`.

## Rules to respect

- **View models are per request.** A `[UI]` class is instantiated fresh for every request: keep
  shared data in a static store or an injected service, never in instance fields you expect to
  survive between requests.
- A CRUD is a `Crud<T>` overriding `Fetch`, `Get`, `Save` and `Delete` — the `Save`/`Delete`
  defaults REFUSE ("Not implemented"), so a CRUD that writes must override both. The entity's id is
  its `Id` property, or the one marked `[Id]`.
- **Actions are declared.** Only a `[Button]`/`[Toolbar]`/`[Action]`/`[Fab]` method, or an action id
  the view itself names (a fluent button, a trigger), runs; any other action id answers 403. An
  action that changes fields re-renders the view by returning `this`.
- `using System.ComponentModel;` next to `using Mateu.Uidl;` makes `[ReadOnly]` ambiguous — use
  Mateu's (qualify it or drop the other using).
- Field behaviour comes from attributes (`[Required]`, `[Range]`, Mateu's `[Section]`, `[Tab]`,
  `[ReadOnly]`…); methods become actions. Check the docs before inventing an API.
- Do not hand-write controllers or frontend code for the UI — declare the model.

## References

- **Claude Code plugin `mateu`** (the skills that know this API): `/plugin marketplace add
  miguelperezcolom/mateu`, then `/plugin install mateu@mateu`. A project made by the New Project
  wizards already enables it in `.claude/settings.json` — trust the folder and install it once.
  Skills for this project: `mateu-dotnet` (C# screens, Crud<T>, the app shell), `mateu-run` (run + screenshot), `mateu-yaml` (YAML specs). Guide: https://mateu.io/build-uis-with-ai/
- Docs: https://mateu.io (C# user manual: https://mateu.io/csharp-user-manual/).
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md and
  https://mateu.io/mateu-ai-full.md (Java-first; https://mateu.io/reference/language-rosetta/
  maps every annotation to its C# attribute).
- Source: https://github.com/miguelperezcolom/mateu
