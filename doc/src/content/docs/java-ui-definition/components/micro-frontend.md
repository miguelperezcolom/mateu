---
title: "MicroFrontend"
---

Embeds another Mateu UI route as a nested micro-frontend inside the current page. Allows composing independent UI applications.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
MicroFrontend.builder()
    .baseUrl("/other-app")
    .route("/dashboard")
    .consumedRoute("")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | String | — | Base URL of the remote Mateu UI |
| `route` | String | — | Route within the remote app to load |
| `consumedRoute` | String | — | Route prefix consumed by the host page |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |
| `resolve` | `Resolve` | `CLIENT` | Who asks the remote for the first paint: the renderer (`CLIENT`) or the host while it builds the view (`SERVER`). Experimental |
| `timeoutMs` | Integer | the remote's | How long the host waits for it, with `resolve = SERVER`. Experimental |

## Example: embedding a remote section

```java
MicroFrontend.builder()
    .baseUrl("/fluent")          // the embedded app's base path
    .route("/components/card")   // the specific page to show
    .consumedRoute("")           // how much of the URL this host page "consumes"
    .build()
```

## Use case

`MicroFrontend` is useful when:

- different teams own different parts of the UI
- you want to embed a Mateu UI into a larger shell application
- you need lazy-loading of independently deployed UI modules

## Resolving it in the server (`resolve = SERVER`)

By default the renderer asks the remote for the micro frontend after it paints the host page: one
more request per micro frontend, a layout jump when it arrives, and the user's token travelling from
the browser. For several small fragments per screen that is a poor trade. With `resolve = SERVER`
the **host** asks the remote while it builds the view and embeds the answer in its own response:

```java
MicroFrontend.builder()
    .baseUrl("https://orders.acme.com/ui")
    .route("/widgets/pending")
    .resolve(Resolve.SERVER)
    .timeoutMs(150)
    .build()
```

It never makes the screen worse than resolving in the client:

- the host asks every `SERVER` micro frontend of the view **in parallel**, and waits at most the
  largest of their timeouts (capped by `mateu.microfrontends.max-budget-ms`, default 2000);
- each one that answers in time is embedded (`resolved` on the wire); one that is slow, fails or is
  down goes out exactly as a `CLIENT` one — the renderer asks for it as always — and the call still
  running at its deadline is **cancelled**;
- **resolving is not absorbing**: the embedded answer keeps the micro frontend's base url, route and
  type, and every action and trigger inside it goes to the remote, exactly as if the renderer had
  asked. The host never proxies the interaction.

The remote's commands, messages, banners and app state are left out of what is embedded: the page
and the app are the host's.

### Registered remotes

The host only ever asks a url under a **registered remote** — a UI definition can never make the
server call anywhere else. A `SERVER` micro frontend whose base url is not under one is a
configuration error: the response fails and nothing is asked.

```properties
mateu.remotes=orders,content
mateu.remotes.orders.base-url=https://orders.acme.com/ui
mateu.remotes.orders.timeout-ms=200
# a path on this same server (a reverse proxy in front of it): called at mateu.self-base-url
mateu.remotes.content.base-url=/_content-hub
mateu.remotes.content.identity=forward-authorization
mateu.self-base-url=https://shell.acme.com
```

Or contribute them from code with a `RemoteCatalogSupplier` bean (`List<RemoteDescriptor> remotes()`),
or replace the whole registry with your own `RemoteRegistry` bean. A url belongs to a remote when it
has the same scheme, host and port and its path is the remote's or below it.

| Setting | Default | |
|---|---|---|
| `mateu.microfrontends.default-timeout-ms` | 500 | when neither the micro frontend nor its remote say |
| `mateu.microfrontends.max-budget-ms` | 2000 | the most a view ever waits |

### Identity and tracing

The host calls the remote **on the user's behalf**, as the remote's `identity` strategy says:
`forward-authorization` (the default: the request's own `Authorization`, only ever to a registered
remote), `none`, or the name of a `RemoteIdentityStrategy` bean of yours — the place for a **token
exchange** for a token whose audience is the remote (Mateu ships no OAuth client).

Every call carries `X-Mateu-Correlation-Id` (the request's own, else the trace id of its
`traceparent`, else a new one — replace it with a `CorrelationIdProvider` bean), and every fragment
leaves one line on the `io.mateu.microfrontends` logger: remote, url, outcome (`EMBEDDED`,
`FROM_CACHE`, `TIMEOUT`, `ERROR`, `EMPTY`), what the page got instead, duration and correlation id.
`MicroFrontendResolutionListener` beans hear the same events, for metrics.

### Caching (the remote decides)

A view other hosts embed says whether they may cache it — `@CacheableFragment(maxAgeSeconds = 60,
varyBy = "shared")` or, per request, `FragmentCachePolicySupplier`:

| `varyBy` | The host keeps |
|---|---|
| `none` | nothing (the default when the view says nothing) |
| `shared` | one copy for everybody |
| `user` | one copy per caller |
| `key` | one copy per opaque `key` the remote computes (e.g. the hash of the user attributes its content targets) |

With `key`, the host remembers each caller's key for `maxAgeSeconds` (no round trip meanwhile) and,
for a caller it does not know yet, tells the remote which keys it holds (`X-Mateu-Fragment-Keys`):
when the remote computes one of them it answers `notModified` without the fragment and the host
serves its copy. Two callers share an entry only once the remote has said they have the same key.
The store is in memory and bounded; declare a `FragmentCacheStore` bean for a shared one.

On the browser side nothing resolved is ever cached: the client structure caches keep the screen
without the embedded answer.

See also [ContentSlot](/java-ui-definition/components/content-slot/), a micro frontend resolved in
the server against a content service.

## .NET and Python

Both ports resolve micro frontends in the server with the same rules, wire and degradation as Java
(conformance-pinned). What differs is the declaration and the configuration: there are no
`mateu.remotes.*` properties — remotes and limits are server options.

**.NET** — `Resolve = Resolve.Server` on the fluent `MicroFrontend`; remotes in `MateuOptions.Remotes`
(or `IRemoteCatalogSupplier` services):

```csharp
builder.Services.AddMateu(o =>
{
    o.Remotes.Add(new RemoteDescriptor("orders", "https://orders.acme.com", 800));
    o.MaxBudgetMs = 1500;
});

[UI("dashboard")]
public class Dashboard : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Content = [new MicroFrontend("https://orders.acme.com", "/orders/summary") { Resolve = Resolve.Server, TimeoutMs = 300 }],
    };
}
```

Replace a collaborator by registering your own service: `IRemoteRegistry`, `IRemoteIdentityStrategy`
(chosen by name in `RemoteDescriptor.Identity`), `ICorrelationIdProvider`, `IFragmentCacheStore`,
`IMicroFrontendResolutionListener`; on the remote side, `[CacheableFragment(maxAgeSeconds)]` /
`IFragmentCachePolicySupplier`.

**Python** — `resolve=Resolve.SERVER` on `components.MicroFrontend`; remotes in
`add_mateu(remotes=[...])` (or `RemoteCatalogSupplier` subclasses among the sources):

```python
from mateu_ui.uidl import ComponentTreeSupplier, RemoteDescriptor, ui
from mateu_ui.uidl import components as fluent


@ui("dashboard")
class Dashboard(ComponentTreeSupplier):
    def component(self):
        return fluent.VerticalLayout(content=(
            fluent.MicroFrontend(base_url="https://orders.acme.com", route="/orders/summary",
                                 resolve=fluent.Resolve.SERVER, timeout_ms=300),
        ))


ORDERS = RemoteDescriptor("orders", "https://orders.acme.com", 800)
# add_mateu(app, my_module, remotes=[ORDERS], max_budget_ms=1500)
```

The other options (`default_timeout_ms`, `self_base_url`, `remote_registry`, `identity_strategies`,
`fragment_cache_store`, `correlation_id_provider`, `resolution_listeners`) are in the server options
tables of the [Python](/python-user-manual/#server-options) and [.NET](/csharp-user-manual/#server-options)
manuals.
