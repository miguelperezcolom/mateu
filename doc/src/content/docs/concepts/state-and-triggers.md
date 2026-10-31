---
title: "State, scopes and triggers"
description: "The four scopes a screen reads and writes — state, data, appState, appData — how routes, sources and actions fill them, the ${…} expressions that read them, and the triggers that run actions without a click."
---

Every Mateu screen works on four bags of values. Components read and write them, `${…}` expressions
read them, and routes, data sources and actions fill them. They are one of the
[building blocks](/concepts/building-blocks/), and they behave the same whichever way the screen was
authored.

## The four scopes

| Scope | Holds | Lifetime | Typically filled by |
|---|---|---|---|
| `state` | the page's field values. A `FormField id: name` **is** `state.name` | the current page, replaced on navigation | the user typing, a route's `state:`, a source's response, an action |
| `data` | extra page values that are not fields: totals, lookups, display-only results | the current page | an action returning `Data`, a route's `data:` |
| `appState` | app-wide values that survive navigation, such as the active hotel, company or year | the app session | a route's `appState:`, an action returning `AppState`, an `@AppContext` selector |
| `appData` | app-wide data, fetched once and shared by every page | the app session | a route's `appData:`, an action returning `AppData` |

Each request carries the scopes from the browser to the server, and each response can change them.
In a static bundle there is no server, so the scopes never leave the browser. Otherwise the two
cases behave the same.

## How a route seeds them

A [route](/concepts/routes-and-mounts/#what-a-route-carries) can populate all four on entry. They
split by nature:

- **`state` and `appState` are literals.** They are seeded at the *defaults* level, so anything the
  client already holds (including the persisted `@AppContext`) still wins.
- **`data` and `appData` are references** to a [data source](/concepts/data-sources/). There is no
  literal data channel, so data always comes from a source. `data` is fetched when the route loads;
  `appData` is fetched once for the whole app.

```yaml
# the product catalogue: the record page fetches its product, the archived listing
# pins a filter value, and the shell-wide totals are fetched once
- route: products/:id
  layout: product.yaml
  data: product                   # GET /api/products/${state.id}, merged into the page
- route: products/archived
  layout: products.yaml
  state: {status: DISCONTINUED}
  appData: catalogue-totals
```

Path and query parameters land in `state` too, under the parameter's name (`:id` becomes
`state.id`). They follow the same precedence everywhere: `fixed > client state > path > query >
defaults`.

## How code fills them

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

In a view model, the class's **fields are the state**: Mateu hydrates them from the incoming state
before your method runs, and sends them back afterwards. An action changes the other scopes by
returning one of these:

```java
@Button
public Object refresh(HttpRequest rq) {
  return List.of(
      this,                                                   // state: the fields as they are now
      new Data(Map.of("total", ProductStore.INSTANCE.count())),   // → data.total
      new AppData(Map.of("lastRefresh", Instant.now().toString())));
}
```

`HttpRequest.getAppState(...)` and `HttpRequest.appContext(field)` read the app scope on the server.
The Java data contexts are covered in [Data contexts](/java-user-manual/concepts/fluent-components/fluent-data-contexts/).

## Reading them: `${…}`

Any label, title, text, URL template or body template can read the scopes:

```yaml
title: ${state.name}
subtitle: "${i18n.products.title} (${data.total})"
rowRoute: products/${row.id}
source: {url: "/api/products?status=${state.status}"}
```

| In `${…}` | Where |
|---|---|
| `state`, `data`, `appState`, `appData` | everywhere |
| `i18n` | any text. Resolved per locale (see [Translations](/define/yaml/translations/)) |
| `row` | per-row templates such as a listing's `rowRoute` |
| `searchText`, `page`, `size` | a listing source's url and body |
| `secret` | **only** in a proxied source, resolved on the server. The browser never sees it |

The browser evaluates these expressions with Mateu's own sandboxed evaluator, not with `eval`, so it
is safe under a strict Content Security Policy. Rule and validation expressions can see only
`state`, `data`, `appState`, `appData` and `component`, never bare field names.

## Rules

A **rule** is reactive behaviour that runs in the browser: when a `filter` expression holds, it
sets a value, an attribute (`hidden`, `required`, `disabled`…), a style or a CSS class, or it runs an
action (`RunAction`, `RunJS`). In YAML, rules appear on a menu's `RuleLink`. In Java, a page returns
them from a `RuleSupplier`, and annotations such as `@Disabled` compile to rules for you. See
[Rules](/java-user-manual/concepts/fluent-components/fluent-rules/).

## Triggers

A **trigger** runs an [action](/concepts/action-catalogue/) without a click. Triggers fire in the
browser. Whether the action they name needs a server depends on the action.

| Trigger | Fires | Key fields |
|---|---|---|
| `OnLoadTrigger` | when the page or component loads, optionally repeatedly | `actionId`, `timeoutMillis`, `times`, `condition`, `background` |
| `OnValueChangeTrigger` | when a field changes | `actionId`, `propertyName`, `condition` |
| `OnCustomEventTrigger` | when an event is emitted (by an `Emit` step, `UICommand.dispatchEvent` or `closeModal(event)`) | `actionId`, `eventName`, `source` (`DOCUMENT` / `COMPONENT` / `SELF`), `from`, `condition` |
| `OnSuccessTrigger` / `OnErrorTrigger` | after another action succeeds or fails | `actionId`, `calledActionId`, `condition` |
| `AutoSaveTrigger` | when the user stops typing | `actionId`, `debounceMillis` |

A small summary page in the catalogue loads its totals on entry, and loads them again whenever any
page emits `product-saved`:

```yaml
# specs/ui/catalogue-summary.yaml
layout:
  type: VerticalLayout
  content:
    - {type: Text, text: "${state.count} products"}
actions:
  - id: refresh
    restAction:
      source: {ref: catalogue-totals}
      resultPath: ""                # merge the response into the state
triggers:
  - type: OnLoadTrigger
    actionId: refresh
  - type: OnCustomEventTrigger
    eventName: product-saved
    actionId: refresh
```

and the page that saves emits that event as the last step of its flow:

```yaml
actions:
  - id: save
    validationRequired: true
    restAction:
      source: {ref: product-update}
      successMessage: Saved
  - id: saveAndBack
    steps:
      - type: RunAction
        actionId: save
      - type: Emit
        event: product-saved
      - type: Navigate
        route: products
```

A `Navigate` route takes `${…}` placeholders, resolved when the flow runs against the page's state
and data — with the **action's parameters on top of the state**. So a map marker
(`markerActionId`, whose click sends `_markerId`) can open its record:

```yaml
actions:
  - id: openSite
    steps:
      - type: Navigate
        route: launch-sites/${state._markerId}
```

The route is interpolated like a source url: each value is encoded as a path segment (or a query
component after a `?`), and a `.`/`..` value is refused.

In Java the same triggers are annotations (`@Trigger(type = TriggerType.OnLoad, actionId = "load")`,
`@SubscribeTo(event = "product-saved", action = "refresh")`, `@AutoSave`) or a `TriggersSupplier`.
C# and Python have `[SubscribeTo]` / `@subscribe_to`. See
[Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/) and
[component communication](/ux-patterns/component-communication/).

## See also

- [What a Mateu UI is made of](/concepts/building-blocks/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/) in Java
- [App context](/ux-patterns/app-context/): an `appState` value picked in the header
