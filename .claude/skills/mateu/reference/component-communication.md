# Component communication (events between screens/panels)

Panels talk to each other by emitting named DOM events and subscribing to them — one panel
reloads when another changes, no full-page navigation.

## Emit — from an action

Return `UICommand.dispatchEvent(...)` from any action:

```java
UICommand.dispatchEvent("pax-selected", guest.cardex());  // name + payload
UICommand.dispatchEvent("checkin-confirmed");             // name only
```

Optionally declare the emitter's logical name so subscribers can filter by source:

```java
@Emits(name = "guests")
class GuestsSection { ... }
```

`@Emits` is mostly declarative — its only runtime effect is stamping `detail.__source` with
that name on **object** payloads.

## Subscribe — run an action when an event fires

```java
@SubscribeTo(event = "pax-selected", action = "reload", source = COMPONENT, from = "guests")
class CardexView extends AutoEditableView<Cardex> { ... }
```

Repeatable via `@SubscribesTo`. `event.detail` is passed as parameters to `action`.

### Scope (`SubscriptionSource`)

| `source` | Listens on | Filters |
|---|---|---|
| `DOCUMENT` (default) | `document` (global bus) | none — reaches any component |
| `COMPONENT` | `document` | only events whose `detail.__source == from` |
| `SELF` | the component's own element | only events bubbling up from descendants |

Use `COMPONENT` + `from = "<emitter name>"` to react to a specific emitter (and make the
`@Emits(name=…)` meaningful). A raw `@Trigger(type = OnCustomEvent)` maps to `SELF`.

## Row selection → event (master/detail)

`@OnRowSelected` runs a method with the clicked row injected, and works on read-only grids:

```java
@OnRowSelected("onGuestSelected")
List<Guest> guests;

Object onGuestSelected(Guest g, HttpRequest r) {
    return UICommand.dispatchEvent("pax-selected", g.cardex());
}
```

The action is auto-registered so the component claims it. Commonly paired with `@Emits` +
`@SubscribeTo` to update another panel.

## Self-reloading embedded panel

To make a panel reload **itself** (not the whole page) on an event, extract it into its own
`MultiView`/`AutoEditableView` and embed it (see [editor.md](editor.md) / [extension.md](extension.md)).
Three rules:

1. Put `@SubscribeTo` on the **loaded entity** (the model view), not the orchestrator.
2. Advertise the reload action by overriding `actions(HttpRequest)` to add it.
3. In `handleAction`, after updating state, **alternate the route**
   (`setRouteTo(flip ? "/view" : "/")`) and `return new State(this)` — the embedded
   mediator only re-renders on a route change.

Real example: check-in demo — `GuestsSection` (`@Emits(name="guests")`) emits `pax-selected`;
`CardexView extends AutoEditableView<Cardex>` (`@SubscribeTo("pax-selected", …)`) reloads only
the cardex. Docs: `doc/.../ux-patterns/component-communication.md`.
