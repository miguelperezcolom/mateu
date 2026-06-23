---
title: Component Communication
description: Let independent components on a screen react to each other by emitting and subscribing to named custom events.
---

**Status:** ✅ Implemented — `@Emits`, `@SubscribeTo` / `@SubscribesTo`, `SubscriptionSource`, `UICommand.dispatchEvent(...)`

## Intent

Let one component announce that something happened and let any other component react to it — without
hard-wiring them together or forcing a full-page navigation.

## Problem

A dense operational screen is often made of several independent components: a form, a few sections,
a sidebar listing, a header. When the user does something in one of them (confirms a check-in,
assigns a room, saves a draft), other parts of the screen need to refresh to stay consistent.

The blunt fix is to return a navigation (`return theListing;`) so the whole page reloads. That
throws away scroll position, collapses open sections, and feels heavy for what is really a small
update. Components also have no stable way to find each other — their DOM ids are generated.

## Solution

Use the event bus. A component **emits** a named custom event by returning
`UICommand.dispatchEvent(...)` from an action; other components **subscribe** to that event name with
`@SubscribeTo` and run an action (typically a refresh) when it fires, receiving the event payload as
the action parameters.

```
GuestsSection                                CheckInForm
  @Emits(name="guests-section")                @SubscribeTo(event="checkin-confirmed",
  confirmCheckin():                                        action="load",
    return dispatchEvent("checkin-confirmed", …) ───┐      source=DOCUMENT)
                                                    │
                          document (global bus) ────┴──▶ runs load() → refreshes in place
```

Subscriptions choose where they listen via `SubscriptionSource`:

- **`DOCUMENT`** (default) — global bus. The listener is attached to `document`, so it reaches
  sibling and unrelated components anywhere on the page.
- **`COMPONENT`** — same global bus, but only reacts to events whose origin matches `from` (the
  emitter's `@Emits(name=...)`).
- **`SELF`** — legacy scope: listens on the component's own element, catching only events that bubble
  up from its descendants. A raw `@Trigger(type = OnCustomEvent)` is equivalent to this.

---

## Example

A guests section confirms a check-in and, instead of navigating to the arrivals listing, emits an
event. The surrounding check-in form subscribes and refreshes itself in place.

### Emitter

```java
@PlainText
@Compact
@Emits(events = "checkin-confirmed", name = "guests-section")
public class GuestsSection {

    @Hidden String id;

    @Toolbar
    @Label("Confirmar check-in")
    Object confirmCheckin(HttpRequest httpRequest) {
        var repository = MateuBeanProvider.getBean(ReservationLineRepository.class);
        return repository.findById(id).map(line -> {
            line.setStatus(CheckInStatus.CHECKED_IN);
            repository.save(line);
            // Announce it on the bus instead of navigating away.
            return (Object) List.of(
                    Message.success("Check-in confirmado para " + line.getTitular()),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", id)));
        }).orElse(Message.success("Reservation not found"));
    }
}
```

### Subscriber

```java
@Route(value = "/:id/checkin", uis = {"/checkin"})
@Trigger(type = TriggerType.OnLoad, actionId = "load")
// Refresh the whole form in place whenever any component announces a confirmed check-in.
@SubscribeTo(event = "checkin-confirmed", action = "load", source = SubscriptionSource.DOCUMENT)
public class CheckInForm implements HeaderSupplier {

    @Hidden String id;

    Object load(HttpRequest httpRequest) {
        return populate() ? (Object) new State(this) : Message.success("Reservation not found");
    }

    // ... fields, sections (including the GuestsSection above), populate(), header() ...
}
```

When the user clicks **Confirmar check-in**, the action persists the change and returns a
`dispatchEvent("checkin-confirmed", …)`. The event reaches `document`; `CheckInForm`'s subscription
fires its `load` action, which re-reads the reservation and re-renders — no navigation, no lost
scroll position. The `reservationId` payload arrives as the `load` action's parameters.

### Filtering by source (`COMPONENT`)

To react only to events from a specific component, name the emitter with `@Emits(name=...)` and match
it with `from`:

```java
@SubscribeTo(event = "checkin-confirmed", action = "load",
             source = SubscriptionSource.COMPONENT, from = "guests-section")
```

---

## How it works

1. **Emit** — `UICommand.dispatchEvent(eventName)` / `dispatchEvent(eventName, payload)` returns a
   `DispatchEvent` command. The frontend (`ConnectedElement.applyCommand`) dispatches a real
   `bubbles + composed` DOM `CustomEvent` from the emitting component's element, stamping
   `detail.__source` with the emitter's logical name (`@Emits(name=...)`, falling back to its
   server-side type) — only on object payloads, so existing events keep their exact shape.
2. **Subscribe** — `@SubscribeTo` maps to an `OnCustomEvent` trigger carrying `source` and `from`
   (`TriggerMapper`), serialized in the component metadata. `@Emits(name)` is surfaced as
   `ServerSideComponentDto.emitsName` via `EmitsMapper`.
3. **Listen** — on render, `ComponentElement.registerCustomEventListeners()` attaches a listener on
   `document` (for `DOCUMENT`/`COMPONENT`) or on the element itself (for `SELF`); they are removed in
   `disconnectedCallback` to avoid leaks. `customEventManager` filters by event name and, for
   `COMPONENT`, by `detail.__source === from`, then runs the action server-side passing
   `event.detail` as parameters. Propagation is only stopped for `SELF` subscriptions so the global
   bus is never short-circuited.

---

## Master/detail from a grid row selection

A common trigger for an event is selecting a row in a grid. Annotate the grid list field with
[`@OnRowSelected`](/reference/key-annotations/#onrowselected): when the user clicks a row, Mateu runs
the named method on the grid's owner class, auto-injecting the clicked row. The handler emits an
event; a sibling/parent component subscribes and updates a detail panel — all without navigating.

This works even on **read-only** grids (the usual case for a display table inside a read-only form),
which the built-in CRUD detail-edit selection does not.

### Emitter — selecting a guest updates the cardex

```java
@PlainText
@Compact
@Emits(events = {"checkin-confirmed", "pax-selected"}, name = "guests-section")
public class GuestsSection {

    @Label("")
    @Stereotype(FieldStereotype.grid)
    @OnRowSelected("onGuestSelected")
    List<GuestData> guests = new ArrayList<>();

    // The clicked GuestData is auto-injected.
    Object onGuestSelected(GuestData guest, HttpRequest httpRequest) {
        var pax = new HashMap<String, Object>();
        pax.put("lastName", guest.getLastName());
        pax.put("firstName", guest.getFirstName());
        pax.put("nationality", guest.getNationality());
        pax.put("hasCardex", guest.isHasCardex());
        // Wrapped in a List so the bare UICommand isn't treated as a page result.
        return List.of(UICommand.dispatchEvent("pax-selected", pax));
    }
}
```

### Subscriber — the page updates the cardex section

```java
@SubscribeTo(event = "pax-selected", action = "selectPax", source = SubscriptionSource.DOCUMENT)
public class CheckInForm implements HeaderSupplier {

    ClientInfoSection clientInfo = new ClientInfoSection();   // the "cardex" section

    Object selectPax(HttpRequest httpRequest) {
        if (!populate()) return Message.success("Reservation not found");
        var p = httpRequest.runActionRq().parameters();        // the event payload
        clientInfo.applySelectedPax(
                str(p.get("lastName")), str(p.get("firstName")),
                str(p.get("nationality")), Boolean.TRUE.equals(p.get("hasCardex")));
        return new State(this);
    }
}
```

Clicking a guest row now refreshes the cardex with that pax's data in place. Since the grid and the
cardex are `@Inline` sections of the **same** component, the event travels through the `DOCUMENT` bus
and the page itself is the subscriber — the same pattern works unchanged when the panels are truly
separate components (e.g. embedded orchestrator sections).

---

## When to use

- **Independent components on one screen** that must stay in sync (sections, sidebars, headers).
- **In-place refresh** after an action, instead of a full-page navigation.
- **Decoupled reactions** — the emitter does not need to know who is listening; the event name is the
  contract.

## When not to use

- A single self-contained form with no peers to notify — just return the updated state.
- Strict step ordering — use a [Wizard](/ux-patterns/wizard/) instead.

---

## Principles served

- **Workflow over screens** — a local action updates the screen in place instead of bouncing through
  a navigation.
- **Decoupling** — components communicate through named events, not direct references.
- **Recoverability** — refreshing in place preserves the user's context (open sections, scroll).

## Related

- [`@SubscribeTo` / `@Emits` / `@OnRowSelected` reference](/reference/key-annotations/)
- [Partial Forms](/ux-patterns/partial-forms/)
