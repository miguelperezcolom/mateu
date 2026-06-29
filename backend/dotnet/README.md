# Mateu server-side for .NET (C#)

A C# implementation of Mateu's **server side**: turn annotated C# classes into the Mateu component
tree and serve the `/mateu/v3/sync` API, so the **existing renderers** (web, JavaFX, Compose) render a
C# backend with **zero client changes**. See [`DESIGN.md`](DESIGN.md) for the full plan and roadmap.

> Status: **Milestone 1 done** — a form view (`[UI]` class) with fields + a `[Button]` action renders
> end-to-end and was verified live in the Compose renderer (desktop + iOS) against this server. Field
> types string/int/bool/date/enum→options and `[Required]`→required are mapped. Next: server-side
> validation, sections/tabs (M2), then `AutoCrud` (M3) and the app shell (M4).

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

## Define a view

```csharp
[UI(""), Title("Simple Form")]
public class SimpleForm
{
    [Required] public string? Name { get; set; }

    [Button] public Message Greet() => new($"Hello {Name}!");
}
```
