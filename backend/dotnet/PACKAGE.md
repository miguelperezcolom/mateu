# Mateu for .NET

[Mateu](https://mateu.io) is a model-driven UI system: you declare the model once — here, as annotated
C# classes — and Mateu renders it on every Mateu renderer (web, React Native, IntelliJ). Forms, CRUD
screens, navigation, wizards and full app shells are generated from the model; you write no frontend
code.

The .NET server emits exactly the wire the Java reference emits (`POST /mateu/v3/sync`), pinned by the
shared wire-conformance corpus.

## Packages

| Package | Role |
|---|---|
| `Mateu.Uidl` | Attributes (`[UI]`, `[Section]`, `[Button]`…), fluent components, archetypes, capability interfaces |
| `Mateu.Dtos` | The wire model (`UIIncrementDto`, component DTOs) |
| `Mateu.Core` | The engine: route registry, reflection mapper, action dispatch |
| `Mateu.AspNetCore` | `AddMateu()` / `MapMateu()` for ASP.NET Core |

## Install

```bash
dotnet add package Mateu.AspNetCore --prerelease
```

## Use

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMateu(typeof(Program).Assembly);
var app = builder.Build();
app.MapMateu();
app.Run();

[UI(""), Title("Hello")]
public class Hello
{
    [Required] public string? Name { get; set; }
    [Button] public Message Greet() => new($"Hello {Name}");
}
```

Documentation: https://mateu.io — source: https://github.com/miguelperezcolom/mateu (`backend/dotnet`).
