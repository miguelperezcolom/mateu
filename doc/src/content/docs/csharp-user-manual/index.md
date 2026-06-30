---
title: "C#"
description: "Build Mateu apps with a .NET / C# server — annotate C# classes and any Mateu renderer renders them, with zero client changes."
---

Mateu has a **C# server-side implementation** (Mateu.NET). You annotate plain C# classes, and the
**existing renderers** (web, JavaFX, Compose) render them with **zero client changes** — exactly as
they render the Java backend.

## How it works

Every Mateu renderer speaks one protocol: `POST /{baseUrl}/mateu/v3/sync/{route}` in, a
`UIIncrement` JSON tree out. So the C# side does **not** re-implement the whole framework — it
**emits the same JSON**. An ASP.NET Core minimal API hosts the `sync` endpoint; a reflection mapper
turns your annotated classes into the Mateu component tree; `System.Text.Json` polymorphism produces
the `type` discriminators the renderers expect.

The implementation lives at [`backend/dotnet`](https://github.com/miguelperezcolom/mateu/tree/master/backend/dotnet)
(`DESIGN.md` for the plan, `README.md` for status).

## Run it

```bash
# .NET 8 SDK required (e.g. via https://dot.net/v1/dotnet-install.sh --channel 8.0)
cd backend/dotnet
dotnet run --project samples/Mateu.Demo   # serves on http://0.0.0.0:8593
dotnet test                               # golden-JSON tests
```

Point any Mateu renderer at it — e.g. set the Compose app's `mateu.baseUrl=http://localhost:8593`.
The server binds to `0.0.0.0`, so the iOS simulator (`localhost:8593`) and Android emulator
(`10.0.2.2:8593`) reach it too.

## Projects

| Project | Role |
|---|---|
| `src/Mateu.Uidl` | Public API — attributes (`[UI]`, `[Title]`, `[Button]`, …) + data types (`Message`) |
| `src/Mateu.Dtos` | The wire model — `UIIncrementDto`, `ComponentDto` + metadata (polymorphism on `type`) |
| `src/Mateu.Core` | The engine — `MateuRegistry`, `ReflectionMapper`, `SyncHandler` |
| `src/Mateu.AspNetCore` | `AddMateu()` / `MapMateu()` — DI + the `POST /mateu/v3/sync/{route}` endpoint |
| `samples/Mateu.Demo` | A runnable ASP.NET app |
| `test/Mateu.Tests` | Golden-JSON tests asserting wire compatibility with the Java backend |

Wire it up in `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMateu();
var app = builder.Build();
app.MapMateu();
app.Run("http://0.0.0.0:8593");
```

## Forms

A `[UI]` class becomes a routed form. Public properties become fields (the type is inferred:
`string`, `int`/`long` → integer, `double`/`decimal` → number, `bool` → boolean, `DateOnly`/
`DateTime` → date, `enum` → dropdown). `[Required]` (from `System.ComponentModel.DataAnnotations`)
makes a field required and is enforced server-side. A method with `[Button]` returning a `Message`
shows a toast.

```csharp
using Mateu.Uidl;
using System.ComponentModel.DataAnnotations;

[UI("person"), Title("Person"), Subtitle("Personal data")]
public class Person
{
    [Required, Section("Identity")] public string? Name { get; set; }
    public int Age { get; set; }
    [Section("Preferences")] public bool Subscribed { get; set; }
    public Role Role { get; set; }                 // enum → dropdown

    [Button] public Message Save() => new($"Saved {Name}");
}

public enum Role { Guest, Admin }
```

`[Section("…")]` groups the fields that follow it into a titled card.

## CRUD

Derive from `Crud<T>` and override `Fetch` (and, as needed, `Get`/`Save`/`Delete`). You get a
searchable listing — a table on desktop, cards on mobile — plus full detail / edit / new flows
(routes `/x`, `/x/{id}`, `/x/{id}/edit`, `/x/new`), with `[Required]` validation on save and
back-to-list navigation.

```csharp
[UI("reservations"), Title("Reservations")]
public class Reservations : Crud<Reservation>
{
    public override IEnumerable<Reservation> Fetch(string? search) =>
        Store.All.Where(r => search is null || r.Locator.Contains(search));

    public override Reservation? Get(string id) => Store.ById(id);
    public override void Save(Reservation r) => Store.Put(r);
    public override void Delete(string id) => Store.Remove(id);
}
```

## App shell & navigation

An `[App]` class is the application shell; each `[MenuItem]` method contributes a menu entry that
navigates to the view it returns.

```csharp
[App("My C# Mateu app")]
public class DemoApp
{
    [MenuItem("Reservations")] public Reservations Reservations() => new();
    [MenuItem("Person")]       public Person Person() => new();
    [MenuItem("Sign up")]      public SignupWizard SignupWizard() => new();
}
```

## Wizards

Derive from `Wizard`, tag each field with `[Step(n)]`, and implement `Complete()`. Mateu renders a
progress bar plus Back/Next; the step + field values round-trip through component state.

```csharp
[UI("signup"), Title("Sign up")]
public class SignupWizard : Wizard
{
    [Step(1)] public string? Email { get; set; }
    [Step(2), Password] public string? Password { get; set; }
    public override Message Complete() => new($"Welcome {Email}");
}
```

## Page decorations

- `[Subtitle("…")]` — a subtitle under the page title.
- `[Banner(BannerTheme.Info, "Title")]` on a method — a banner below the header. Themes: `Info`,
  `Success`, `Warning`, `Danger`. If the method returns a `string`, that's the banner description.
- `[HeaderBadge(color: "success")]` on a property — a status chip in the header strip (shown when
  the value is non-empty).

```csharp
[Banner(BannerTheme.Info, "Heads up")] public string Note() => "Fields marked * are required";
[HeaderBadge("success")] public string Status { get; set; } = "Active";
```

## Tabs

Tag consecutive fields with `[Tab("Name")]` to group them into a tab strip (a `TabLayout`); the
first tab is active by default.

```csharp
[Tab("Identity")] public string? Name { get; set; }
[Tab("Identity"), Password] public string? Secret { get; set; }
[Tab("Profile")]  public string? Bio { get; set; }
```

## Field stereotypes

| Attribute | Effect |
|---|---|
| `[Multiline]` | renders as a multi-line text area |
| `[Password]` | renders as a password input |
| `[Money]` | tags the field `money` so the renderer formats it as currency |
| `[PlainText]` | renders read-only plain text (also valid at **class level** for all fields) |
| `[Stereotype("…")]` | sets an explicit stereotype |

```csharp
[Multiline] public string? Notes { get; set; }
[Money]     public decimal Balance { get; set; }
[PlainText] public string? MemberSince { get; set; }
```

## KPIs & floating action buttons

- `[Kpi("Title")]` on a (parameterless) method → a KPI card in the page header showing the method's
  return value.
- `[Fab("icon", "label", order)]` on a method → a floating action button; clicking it invokes the
  method like any other action.

```csharp
[Kpi("Open tickets")] public string OpenTickets() => "42";
[Fab("plus", "Add", 0)] public Message Add() => new("Added");
```

## Keyboard shortcuts

Bind an action method to a shortcut with `[Shortcut("ctrl+s")]`.

```csharp
[Button, Shortcut("ctrl+s")] public Message Save() => new("Saved");
```

## Page flags

- `[Compact]` — high-density rendering (condensed spacing) for information-dense screens.
- `[ConfirmOnNavigationIfDirty]` — warn before leaving the view with unsaved changes.

```csharp
[UI("checkin"), Compact, ConfirmOnNavigationIfDirty]
public class CheckIn { /* … */ }
```

## i18n, events & security

- **i18n** — implement `ITranslator` and register it; titles, labels and menu entries are translated.
- **Events** — `[Emits("event-name")]` advertises an event a view emits; `[SubscribeTo("event",
  "action")]` runs `action` when that event fires (an `OnCustomEvent` trigger).
- **Security** — `[Secured("permission")]` marks a view as requiring a permission; the `[App]` shell
  can carry login/logout URLs.

```csharp
public class UpperTranslator : ITranslator
{
    public string Translate(string key) => key.ToUpperInvariant();
}

[UI("orders"), Emits("order-created"), SubscribeTo("inventory-changed", "refresh")]
public class Orders { /* … */ }
```

## Status

The core Mateu surface is covered and verified live in the Compose renderer (desktop + iOS) against
this server: forms + sections + field types + validation, `Crud<T>` (list / detail / edit / new /
save / delete), the `[App]` shell + menu navigation, wizards, page decorations, i18n, events,
security scaffolding, and the tail features above (tabs, stereotypes, KPIs, FABs, shortcuts, compact,
unsaved-changes guard). 13 golden-JSON tests assert wire compatibility with the Java backend.

Beyond the core, the remaining Java features (component adapters, federated microfrontends, framework
adapters, SSE/AI chat) follow the same pattern: extend the mapper, add a metadata DTO, add a golden
test.
