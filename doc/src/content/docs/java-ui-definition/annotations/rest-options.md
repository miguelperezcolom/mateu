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
This is the **options** surface. Consuming external endpoints for listing rows, form data and
button actions reuses the same `RestDataSource` descriptor and is on the roadmap.
:::

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

The server resolves the endpoint from the **declared** annotation (by field/action/class), never
from a url supplied by the client, so the proxy can't be turned into an open relay. `${state.x}`
interpolation works the same as in direct mode (resolved from the component state).

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
