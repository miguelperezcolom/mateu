# C# hosting, security, YAML, differences from Java, tests

## `AddMateu` / `MapMateu`

```csharp
builder.Services.AddAuthentication().AddJwtBearer();          // YOUR auth — Mateu never authenticates
builder.Services.AddMateu(o =>
{
    // default: roles/groups/scopes/permissions read from HttpContext.User claims
    // (role claim type, role/roles, groups/group, scope/scp, permissions/permission)
    o.Identity = ctx => ctx.User.Identity?.IsAuthenticated == true
        ? new Identity(Roles: ctx.User.FindAll("app_roles").Select(c => c.Value).ToList())
        : null;
    o.Secrets = key => builder.Configuration[$"Mateu:Secrets:{key}"];   // ${secret.KEY} in proxied REST sources
    o.DetailedErrors = false;                                          // default: true only in Development
}, typeof(Program).Assembly);

var app = builder.Build();
app.UseAuthentication();
app.MapMateu(baseUrl: "", ui: Environment.GetEnvironmentVariable("MATEU_UI"));
```

- No identity → every `[EyesOnly]`/`[ReadOnlyUnless]`/`[DisabledUnless]` gate denies. Matching:
  AND across declared dimensions, OR within one. `[Audience]` is a projection, never security.
- Secrets fall back to an `ISecretsProvider` service, then ONLY the env var `MATEU_SECRET_<KEY>`.
- CORS: Mateu adds none — a renderer served by the same app needs none; otherwise use ASP.NET's
  `AddCors`/`UseCors`.
- Errors: `UserFacingException` shows as written; anything else → "Something went wrong /
  … Reference: <id>" (the request's trace id) and the exception is logged at ERROR with that id.
- The MCP endpoint is off unless `o.Mcp = true` (or `MATEU_MCP_ENABLED=true`).

## YAML specs served by a C# app

The server also reads `specs/ui/**` under the working directory (`MATEU_SPECS_DIR` to change it):
`type: UI` mounts, `routes.yaml` (an entry may bind `viewModel: MyApp.Views.Tickets` — the full
type name — and `fixedParams`), page layouts, `partials/`, `sources.yaml` (sample data with
`MATEU_SOURCES_MOCK=true` / `o.MockSources = true`), types, translations. Not in this port:
`type: AppShell` (declare the shell with `[App]` or `IAppSupplier`), a listing's `rowRoute`, and
the static-bundle exporter. Authoring the YAML itself → skill `mateu-yaml`.

## How C# differs from Java (same wire, different declaration)

| Java | C# |
|---|---|
| `@UI("/x")` on a class | `[UI("x")]` (leading `/` optional) |
| `@UI("")` + `@Menu` fields | `[App("Title")]` + `[MenuItem]` methods returning the view |
| `AutoCrud<T>` + `CrudStore<T>` | `Crud<T>`: override `Fetch`/`Get`/`Save`/`Delete` (+ `Find` for pushdown) |
| `@NotCreatable`, `@NotDeletable` | `CanCreate`/`CanDelete` overrides or `Display` |
| `WizardStep` fields + `@WizardCompletionAction` | `[Step(n)]` properties + `Complete()` |
| `@Action(shortcut, timeoutMillis)` | `[Shortcut]`, `[ActionOptions]` (+ `[Action]` to declare) |
| `@KPI` field | `[Kpi("Title")]` method |
| `@BadgeInHeader` | `[HeaderBadge("success")]` |
| `HttpRequest` parameter | a `RunActionRqDto` parameter |
| `new State(this)` | `return this;` |
| `URI.create("/x")` | `return "/x";` |
| Bean Validation | `System.ComponentModel.DataAnnotations` |
| `ComponentTreeSupplier.component(HttpRequest)` | `IComponentTreeSupplier.Component()` |

Full map: https://mateu.io/reference/language-rosetta/ — what is supported:
https://mateu.io/reference/parity/.

## Tests (xUnit + WebApplicationFactory)

Add `public partial class Program;` at the end of `Program.cs`, then:

```xml
<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.11" />
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.11.1" />
<PackageReference Include="xunit" Version="2.9.2" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.8.2" />
```

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class SyncTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private async Task<string> Sync(string route, string actionId = "", object? state = null)
    {
        var response = await factory.CreateClient().PostAsJsonAsync($"/mateu/v3/sync/{route}",
            new { route, actionId, componentState = state ?? new { } });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadAsStringAsync();
    }

    [Fact] public async Task Products_load() => Assert.Contains("Products", await Sync("products"));

    [Fact] public async Task Greet_rerenders() =>
        Assert.Contains("Hi, Ana", await Sync("signup-form", "greet", new { name = "Ana", email = "a@b.co" }));
}
```

The request body is `{route, actionId, componentState, parameters?}`; `actionId: ""` loads the
route. An undeclared action answers 403; a rejected validation answers 200 with an error message.
To see it render: run with `MATEU_UI` set and open `http://localhost:8080/<route>`.
