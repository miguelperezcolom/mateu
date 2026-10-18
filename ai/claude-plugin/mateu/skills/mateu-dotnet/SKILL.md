---
name: mateu-dotnet
description: Build Mateu UIs in C# on ASP.NET Core (Mateu.NET) — classes marked [UI] become forms, CRUDs, listings, wizards, dashboards and an app shell, served on the Mateu wire so any Mateu renderer draws them. Use when writing or fixing a C#/.NET Mateu app: Program.cs wiring, views, actions, Crud<T>, capability listings, [App]/[MenuItem] menus, security, tests. Triggers on [UI] attribute, Mateu.AspNetCore, Mateu.Uidl, AddMateu, MapMateu, Crud<T>, IListing, [MenuItem], MATEU_UI with .cs/.csproj files.
---

# Mateu in C# (.NET, ASP.NET Core)

Mateu.NET emits the **same wire** as the Java server (`POST /mateu/v3/sync/{route}` → a
`UIIncrement` JSON), so the stock renderers (Vaadin web, Redwood, React Native, IntelliJ) draw a
C# backend unchanged. You write plain classes; **never** write controllers, DTOs or frontend code
for the UI. Java (`@UI`) → skill `mateu`; YAML pages/routes → skill `mateu-yaml`; Python →
`mateu-python`.

## Setup

```bash
dotnet new web -n MyApp && cd MyApp
dotnet add package Mateu.AspNetCore --prerelease     # brings Mateu.Uidl, Mateu.Core, Mateu.Dtos
```

NuGet versions follow the Java release: `3.0-beta.N` → `3.0.0-beta.N`. Targets net8.0 and net10.0.
A class library holding only views references `Mateu.Uidl` alone.

```csharp
// Program.cs
using System.Reflection;
using Mateu.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMateu(Assembly.GetExecutingAssembly());   // scans for [UI]/[App] classes
var app = builder.Build();
app.MapMateu();               // POST /mateu/v3/sync/{route}; MapMateu(ui: "...") also serves the page
app.Run("http://localhost:8080");
```

- Views in another assembly: `AddMateu(typeof(Program).Assembly, typeof(MyView).Assembly)` —
  otherwise their routes are silently not found.
- **To see it in a browser** set `MATEU_UI` (or `MapMateu(ui: ...)`) to the `io.mateu:mateu-vaadin`
  jar of the same version (`https://repo1.maven.org/maven2/io/mateu/mateu-vaadin/<v>/mateu-vaadin-<v>.jar`)
  or its extracted `static/` folder. Without it the server answers the sync API only.
- Fastest start: the generator (VS Code "Mateu: New Project", IntelliJ New Project › Mateu, runtime
  ".NET") or copy `starters/dotnet` from https://github.com/miguelperezcolom/mateu.

## A screen is a class

```csharp
using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

[UI("signup-form"), Title("Sign up")]
public class SignupForm
{
    [Required, Section("Identity")] public string Name { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [ReadOnly] public string Greeting { get; set; } = "";

    [Button("Say hi")]
    public object Greet()
    {
        Greeting = $"Hi, {Name}";
        return new object[] { this, new Message("Greeted") };  // re-render + toast
    }

    [Toolbar("Save", ButtonStyle = "primary")] public Message Save() => new($"Saved {Name}");
    [Button] public string Cancel() => "/home";                 // a route → navigate
}
```

Public properties are state/fields (type → control: string, int/long, double/decimal, bool,
DateOnly, DateTime, TimeOnly, enum → dropdown, `List<Row>` → grid). Methods are actions; the
JSON action id is the camelCased method name.

## What an action returns

| Return | Effect |
|---|---|
| `void` / `null` | nothing changes on screen |
| `this` (or another routed `[UI]` view) | re-render in place with the new state |
| `new Message("…")` / any other `string` | toast (`MessageVariant.Error` etc. for variants) |
| `"/route"` (string starting with `/`) | navigate |
| `Drawer` / `Dialog` | open an overlay; close with `UICommandDto` commands |
| `PageBanner(s)` | banner(s) on the page |
| `new object[] { this, msg, … }` | several effects in one answer |

## Rules that bite

- **Actions are declared** (strict, always on): a wire action id only reaches a public method
  marked `[Button]`, `[Toolbar]`, `[Action]` (no button) or `[Fab]`, or one the view itself
  advertises (a component's `ActionId`, `[OnRowSelected]`, `[SubscribeTo]`). Anything else → 403.
- **Views are per request**: a fresh instance per call. Keep data in a static store or an injected
  service, never in instance state you expect to survive.
- `Crud<T>`: `Fetch` is the only abstract member, but **override `Save` and `Delete`** — their
  defaults refuse with "Not implemented". The id is the `Id` property, else mark it `[Id]`.
- `[Button]`/`[Toolbar]` re-check validation (`[Required]`, `[Range]`…) on the server.
- Mateu does not authenticate: identity comes from `HttpContext.User` (your ASP.NET auth).
- Mixing `using System.ComponentModel;` with `Mateu.Uidl` makes `[ReadOnly]` ambiguous — don't.

## References (read on demand)

- [views-and-actions.md](reference/views-and-actions.md) — field attributes, layout, validation,
  actions, overlays, events, page decorations.
- [crud-and-listings.md](reference/crud-and-listings.md) — `Crud<T>`, capability listings,
  filters, drawer editing, database pushdown, exports.
- [pages-and-shell.md](reference/pages-and-shell.md) — `[App]` shell + menu + home, wizards,
  archetypes (Dashboard, Welcome, Foldout, ItemOverview, CollectionDetail…), fluent components.
- [hosting-and-testing.md](reference/hosting-and-testing.md) — `AddMateu` options, identity,
  secrets, errors, CORS, YAML specs, how C# differs from Java, xUnit tests.

Canonical docs: https://mateu.io/csharp-user-manual/ · Rosetta (Java ↔ C# ↔ Python):
https://mateu.io/reference/language-rosetta/ · Parity: https://mateu.io/reference/parity/
