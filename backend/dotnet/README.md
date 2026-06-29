# Mateu server-side for .NET (C#)

A C# implementation of Mateu's **server side**: turn annotated C# classes into the Mateu component
tree and serve the `/mateu/v3/sync` API, so the **existing renderers** (web, JavaFX, Compose) render a
C# backend with **zero client changes**. See [`DESIGN.md`](DESIGN.md) for the full plan and roadmap.

> Status: **M1–M4 working & verified live** in the Compose renderer (desktop + iOS) against this server:
> - **M1** — `[UI]` form + `[Button]` action (e.g. `SimpleForm` → "Hello {name}" toast).
> - **M2** — field types (string/int/bool/date/enum→options), `[Required]`→required, `[Section]`→cards.
> - **M3** — `Crud<T>`: a searchable listing (table on desktop, cards on phone) **plus full
>   detail / edit / new** — row → read-only view, Edit/New → form, **Save** (with server-side
>   `[Required]` validation; untouched fields preserved), Delete, and back-to-list navigation, all via
>   the route flow (`/reservations`, `/{id}`, `/{id}/edit`, `/new`) the renderer already drives.
> - **M4** — `[App]` shell + a menu from `[MenuItem]` methods + route navigation between views.
> - **M5** — `Wizard` (multi-step, `[Step(n)]`, progress + Back/Next, state via componentState);
>   page decorations (`[Subtitle]`, `[Banner]`, `[HeaderBadge]`); **i18n** (`ITranslator`); **events**
>   (`[Emits]` → `emitsName`, `[SubscribeTo]` → OnCustomEvent trigger); **security** scaffolding
>   (`[Secured]`, app login URLs).
>
> The core Mateu surface is covered (11 golden tests). The web renderer renders all of it; the Compose
> renderer (a subset) renders forms/CRUD/app-shell/wizards/banners.

## Projects

| Project | Role |
|---|---|
| `src/Mateu.Uidl` | Public API — attributes (`[UI]`,`[Title]`,`[Button]`,`[Label]`) + data types (`Message`) |
| `src/Mateu.Dtos` | The wire model — `UIIncrementDto`, `ComponentDto` + metadata (System.Text.Json polymorphism on `type`) |
| `src/Mateu.Core` | The engine — `MateuRegistry` (route/type resolution), `ReflectionMapper` (model→tree), `SyncHandler` (action dispatch) |
| `src/Mateu.AspNetCore` | `AddMateu()` / `MapMateu()` — DI + the `POST /mateu/v3/sync/{route}` endpoint |
| `samples/Mateu.Demo` | A runnable ASP.NET app (`SimpleForm`, `Person`) |
| `test/Mateu.Tests` | Golden-JSON tests asserting wire compatibility with the Java backend |

## Run

```bash
# .NET 8 SDK required (e.g. ~/.dotnet/dotnet via https://dot.net/v1/dotnet-install.sh --channel 8.0)
dotnet build
dotnet run --project samples/Mateu.Demo        # serves on http://0.0.0.0:8593
dotnet test                                     # golden tests
```

Point any Mateu renderer at it — e.g. set the Compose app's `mateu.baseUrl=http://localhost:8593`.
The server binds to `0.0.0.0` so the iOS simulator (`localhost:8593`) and Android emulator
(`10.0.2.2:8593`) reach it too.

## Define views

```csharp
// A form with sections + an action
[UI("person"), Title("Person")]
public class Person
{
    [Required, Section("Identity")] public string? Name { get; set; }
    public int Age { get; set; }
    [Section("Preferences")] public bool Subscribed { get; set; }
    public Role Role { get; set; }            // enum → dropdown
    [Button] public Message Save() => new($"Saved {Name}");
}

// A CRUD listing
[UI("reservations"), Title("Reservations")]
public class Reservations : Crud<Reservation>
{
    public override IEnumerable<Reservation> Fetch(string? search) => /* your query */;
}

// The app shell + menu
[App("My C# Mateu app")]
public class DemoApp
{
    [MenuItem("Reservations")] public Reservations Reservations() => new();
    [MenuItem("Person")] public Person Person() => new();
}
```
