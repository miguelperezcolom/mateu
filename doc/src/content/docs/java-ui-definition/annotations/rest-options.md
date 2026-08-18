---
title: "@RestOptions — external REST options"
description: "Fill a select's options from an arbitrary, non-Mateu REST endpoint fetched client-side."
---

`@RestOptions` fills a field's select options from an **arbitrary (non-Mateu) REST endpoint**,
fetched **client-side**: the renderer calls the URL directly — no Mateu server mediating — navigates
to the array in the JSON response, and maps each item into an option. The field renders as a select.

It is the first surface of decoupling the Mateu UI from the Mateu backend: a Mateu form talking to
any REST API.

**Target:** `FIELD` (and `ANNOTATION_TYPE`, so it composes as a [semantic annotation](./semantic-annotations)).

## Example

```java
@UI("/rest-options")
public class RestOptionsForm {

  @RestOptions(
      url = "https://restcountries.com/v3.1/all?fields=cca2,name",
      itemsPath = "",            // the response root is already the array
      valuePath = "cca2",
      labelPath = "name.common") // dot paths navigate nested JSON
  String country;
}
```

## Attributes

| Attribute    | Default   | Meaning |
|--------------|-----------|---------|
| `url`        | —         | The endpoint URL. Supports `${state.x}` interpolation, so the request can depend on other field values. |
| `method`     | `GET`     | The HTTP method. |
| `headers`    | `{}`      | Request headers as `"Name: Value"` strings (values interpolated) — e.g. an `Authorization` bearer token. |
| `body`       | `""`      | A request body template (interpolated) for non-`GET` methods. |
| `itemsPath`  | `""`      | A dot path to the array inside the response (`data.countries`); blank means the response root **is** the array. |
| `valuePath`  | `value`   | A dot path within each item to the option value. |
| `labelPath`  | `label`   | A dot path within each item to the option label. |

A primitive array element becomes its own value and label; a missing `valuePath`/`labelPath` falls
back to the other side, so half-specified mappings still render.

## How it works

`@RestOptions` travels on the wire as `FormFieldDto.optionsSource` (a `RestDataSource` descriptor:
`url`, `method`, `headers`, `body`, `itemsPath`, `valuePath`, `labelPath`). The renderer interpolates
the url/headers/body against the live field state, `fetch`es the endpoint, and shapes the JSON into
the select's options — a pure client-side call, so the endpoint must be reachable from the browser
(CORS-friendly for cross-origin APIs; same-origin needs nothing).

## Interpolation and dependent options

Because `url`/`headers`/`body` support `${state.x}`, a select can depend on another field. The
options refetch whenever the interpolated url changes:

```java
@RestOptions(url = "/api/cities?country=${state.country}", valuePath = "id", labelPath = "name")
String city;
```

:::note
This is the **options** surface. The same `RestDataSource` descriptor also powers
[listing rows](./rest-listing), [screen data](./rest-data) and [button actions](./rest-action) —
all four are shipped.
:::

## Serving with no Mateu server — what you are signing up for

A [statically deployed](/java-user-manual/build/static-bundle/) mount has no Mateu server behind it,
which is the point — and it has a consequence worth stating plainly rather than discovering:

:::caution[The deal]
With no Mateu server, **your endpoints are exposed directly to the browser**. They must accept CORS
from your static host, and the only authentication available is one a browser can hold.

And `proxy = true` — the mode that fixes exactly that — **is unavailable there**, because it works by
routing the fetch through the Mateu server. It is missing precisely where you would most want it.
:::

So the choice is real, not a detail:

| | direct (no server) | `proxy = true` (server) |
|---|---|---|
| Who fetches | the browser | the Mateu server |
| CORS | your endpoint must allow the static host | not involved |
| Secrets | whatever the browser can hold | `${secret.X}` injected server-side |
| Works statically | yes | no |

A public or read-only API is a fine fit for the direct mode. An API that needs a real credential is
not — and a screen that talks to one should stay backend-served.

## Server-proxy mode (`proxy = true`) — CORS & auth hardening

By default the **browser** fetches the endpoint directly, so the endpoint must be CORS-friendly and
any auth token would have to live in the client. Set `proxy = true` (available on all four
annotations — `@RestOptions`, `@RestListing`, `@RestAction`, `@RestData`) to route the fetch through
the **Mateu server** instead:

```java
@RestOptions(
    proxy = true,
    url = "https://api.example.com/countries",
    headers = "Authorization: Bearer ${secret.COUNTRIES_TOKEN}",
    valuePath = "cca2", labelPath = "name.common")
String country;
```

- **CORS is solved** — the browser only talks to Mateu (same-origin); the server talks to the
  external API server-to-server, where CORS does not apply.
- **Secrets stay server-side** — `${secret.KEY}` placeholders in the url/headers/body are resolved
  on the server by a `SecretsProvider` (see below), so the token **never reaches the browser**. Only
  the placeholder (`${secret.COUNTRIES_TOKEN}`) travels on the wire, never its value.

The server resolves the endpoint from what the view **declared**, never from a url supplied by the
client, so the proxy can't be turned into an open relay. `${state.x}` interpolation works the same
as in direct mode (resolved from the component state).

#### Views with no annotation to read — `RestSourceSupplier`

Reading the annotation is enough for a view written as a Java class. A view **assembled at
runtime** — a form built from a stored definition, a screen composed from configuration — has no
annotated field for that lookup to find, and proxy mode was closed to exactly the views that most
need it. Such a view implements `io.mateu.uidl.interfaces.RestSourceSupplier` to say the same thing
programmatically:

```java
public class TaskForm implements RestSourceSupplier {

  @Override
  public List<DeclaredRestSource> declaredRestSources() {
    return definition.fields().stream()                       // ← server-side state
        .filter(f -> f.optionsSource() != null)
        .map(f -> new DeclaredRestSource(RestSourceKind.OPTIONS, f.id(), sourceOf(f)))
        .toList();
  }
}
```

The declarations are read on the server and gate `__restfetch__` exactly as the annotations do:
a view declaring at least one `proxy = true` source advertises the reserved action, and a fetch for
`kind` + `id` resolves to the source declared under them (`OPTIONS` by field id, `ACTION` by action
id; `ROWS` and `DATA` have one per view, so their id is ignored).

:::danger[Build them from server-side state, never from the request]
The invariant the proxy rests on is that the endpoint is the server's choice, not the client's. An
implementation must derive its declarations from something the server holds — a stored definition,
configuration, a catalogue — and never from the request or the component state. Supplying a url the
client chose hands back the open relay the annotation lookup exists to prevent.
:::

### Supplying secrets — `SecretsProvider`

Implement `io.mateu.uidl.interfaces.SecretsProvider` and register it as a bean:

```java
@Service
public class VaultSecrets implements SecretsProvider {
  public String getSecret(String key) { return vault.read(key); }  // null if unknown
}
```

With no `SecretsProvider` registered, Mateu falls back to reading an **environment variable** of the
same name (`${secret.COUNTRIES_TOKEN}` → `System.getenv("COUNTRIES_TOKEN")`).

## Client-side auth for the direct path (`registerExternalAuthProvider`)

Proxy mode keeps secrets on the **server**. If instead you keep the **direct** (client-side) fetch —
the default — but still need to authenticate it (e.g. an OAuth token the SPA already holds), register
a client-side auth provider. The renderer calls it right before every direct external fetch and
merges the returned headers, so the token is added **at fetch time on the client** and never travels
in the annotation or the Mateu wire:

```ts
// web (import from the `mateu` package, alongside registerNeutralNotifier)
import { registerExternalAuthProvider } from 'mateu'

registerExternalAuthProvider(({ url }) =>
  url.startsWith('https://api.example.com')
    ? { Authorization: `Bearer ${tokenStore.current()}` }
    : {})
```

The provider may be async (e.g. refresh the token first), its headers win over any statically
declared header of the same name, and a throwing provider is swallowed (it never breaks the fetch).
It is **ignored on the proxy path** (there, secrets are injected server-side). The native renderers
expose the same hook: React Native `registerExternalAuthProvider` (from `src/core/restFetch`) and the
IntelliJ plugin `RestFetch.externalAuthProvider = { url, method -> … }`.

## Other backends

Mateu.NET and the Python backend emit the same `optionsSource` descriptor, so any renderer fetches
the endpoint the same way:

```csharp
// .NET
[RestOptions("https://api.example.com/countries",
    ItemsPath = "data.countries", ValuePath = "code", LabelPath = "name.common")]
public string Country { get; set; } = "";
```

```python
# Python
country: Annotated[str, RestOptions(
    url="https://api.example.com/countries",
    items_path="data.countries", value_path="code", label_path="name.common")] = ""
```

**Proxy mode ports.** `proxy` is available on all four annotations in every backend — `[RestOptions(Proxy = true)]` / `RestOptions(proxy=True)`, likewise for listing/action/data. The server resolves the declared source, injects `${secret.X}` and fetches server-side (`__restfetch__`). Supply secrets in .NET via the `SyncHandler`'s `secrets` delegate (`Func<string, string?>`) and in Python via the `SyncHandler(secrets_provider=…)` argument; both fall back to a same-named environment variable when no provider is registered.
