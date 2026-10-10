---
title: "The action catalogue"
description: "Declare a client-runnable action once — a flow or a REST call — and run it by id from the shell menu or any page."
---

An action that runs in the browser has always lived with its owner:

- a page definition's [`actions:`](/java-ui-definition/yaml-ui-definition/) (a flow with `steps:`, or a `restAction`);
- the app shell's [`actions:`](/java-ui-definition/yaml-app-shell/#flows-on-the-shell), which a menu leaf runs;
- a Java `@Action` method (server logic).

That is right for an action exactly one screen uses. It stops being right the moment a second
owner needs it: **New order** in the menu *and* as a button on the customers page *and* on the
dashboard is three copies of the same flow, and they drift. The catalogue names it once:

```yaml
# specs/ui/actions.yaml
type: Actions
actions:
  - id: newOrder
    description: Start a new order
    steps:
      - type: MarkClean
      - type: Navigate
        route: orders/new

  - id: refreshCustomers
    description: Re-read the customers
    restAction:
      source:
        ref: customers          # a REST source catalogue entry, or an inline url
        method: POST
      successMessage: Refreshed
```

Every entry is **exactly the shape a page's `actions:` already has** — the same record, the same
schema — so nothing new has to be learned and an action can move from a page to the catalogue by
cut and paste.

## Declaring it

Two producers feed one table, exactly like the [REST source catalogue](/java-ui-definition/rest-source-catalogue/):

- **Authored**: `specs/ui/actions.yaml`, plus **any file under `specs/ui` that declares `type: Actions`**
  (whatever its name — `specs/ui/catalogs/orders-actions.yaml` works), merged in discovery order.
- **Code**: an `ActionCatalogSupplier` bean returning fluent `Action`s — for a catalogue that comes
  from configuration or differs per environment:

```java
@Service
public class OrderActions implements ActionCatalogSupplier {
  @Override
  public List<Action> actionCatalog() {
    return List.of(
        Action.builder()
            .id("newOrder")
            .description("Start a new order")
            .steps(List.of(new Step.MarkClean(), new Step.Navigate("orders/new")))
            .build());
  }
}
```

**The authored entry wins** and replaces a supplied one of the same id outright — a half-overridden
flow would be far harder to reason about than a replaced one.

Ids are **global**, not relative to a mount: the catalogue is one table per deployment.

## Using it

Name the id wherever an action id goes. From the shell menu, a `RuleLink`:

```yaml
menu:
  - type: RuleLink
    label: New order
    rules:
      - action: RunAction
        actionId: newOrder
```

From a page, any `actionId` — a button, a tile, a flow's `RunAction` step:

```yaml
layout:
  type: Button
  label: New order
  actionId: newOrder
```

From Java, the same: a `Button` whose `actionId` is a catalogue id works on a `ComponentTreeSupplier`
view.

## Resolution: owner first

When something names an action id, Mateu looks for it in this order:

1. **The owner's own action** — the page's `actions:` (or a Java action method) for a page; the
   shell's `actions:` for a menu leaf. An owner action *without* steps still wins: it is the owner's
   server action.
2. **The catalogue.**
3. **The server** — unchanged: an `@Action` method, or an app-level action of the app class.

So a page can **override** a catalogue entry locally by declaring an action with the same id, and
the catalogue never takes an id away from code that already handles it.

A catalogue flow can run another entry (`- type: RunAction, actionId: newOrder`): it resolves the
same way.

## How it runs

- **On the wire** the catalogue rides the app metadata (`AppDto.actionCatalogue`), each flow already
  **lowered** to the commands it produces — the same lowering a page's actions get. A page also
  carries the catalogue entries its own tree names, so even a renderer that does not look the
  catalogue up runs them.
- **In the browser** the resolution happens at the single place a component dispatches an action, so
  the Vaadin renderer and every shell get it at once; the Redwood/VB renderer, React Native and the
  IntelliJ plugin resolve the same way.
- **In a static bundle** the catalogue ships **once** in `manifest.json` (`actions`), like the source
  catalogue — a statically served menu or page runs it with no backend. The visual editor's
  **▶ Play** and its bundle export ship it too. It is not part of the bundle's `structureHash`, for
  the same reason the source catalogue is not.

## What it deliberately is not

**Only client-runnable actions belong here**: a flow (`steps`) or a REST call (`restAction`) — what
the browser can run on its own. An entry with neither is **ignored with a warning** at load:

```
Action catalogue: 'approveOrder' in specs/ui/actions.yaml is not client-runnable (it has neither
steps nor a restAction) and is ignored — server logic stays an @Action method
```

Server logic stays an `@Action` method on a class, where it can be tested, injected and secured. A
flow may still *call* the server — its `RunAction` step names a server action — but the catalogue is
not a place to name server code.

## In the IDE

**New › Mateu › Action Catalogue** (IntelliJ and VS Code) creates an empty `type: Actions` file. The
visual editor opens it in a structured editor — add, rename, describe and remove actions, edit each
flow's steps — and every action-id picker in the editor (menu leaves, buttons, flow steps) offers the
catalogue's ids, marked **catalog**. See [IDE tooling](/native/ide-tooling/).

The schema is generated: `actions-schema.json`, plus a `type: Actions` branch in the unified
`specs-schema.json`.
