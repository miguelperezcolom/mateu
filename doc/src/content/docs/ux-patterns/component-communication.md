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

### Subscriber — the cardex reloads *itself*

The cleanest subscriber is the cardex **as its own component**, so only it re-renders (not the whole
page). Extract the cardex fields into their own class and embed it as an independent component by
making it a `MultiView` (here a read-only `AutoEditableView`). A field whose type is a `MultiView`
subclass is rendered as an independent embedded `ServerSideComponent` — see
[Partial Forms](/ux-patterns/partial-forms/).

```java
// The entity the cardex shows. The @SubscribeTo lives HERE (the loaded "model view"), because the
// embedded component's triggers are mapped from the loaded entity, not from the orchestrator.
@PlainText @Compact @Title("Info cardex")
@SubscribeTo(event = "pax-selected", action = "reloadPax", source = SubscriptionSource.DOCUMENT)
public class Cardex {
    @Label("Titular") String fullName;
    @Label("Email")   String email;
    // … the rest of the cardex fields …
}

// The cardex as an independent, embedded, read-only component that reloads only itself.
@UI("/checkin-cardex") @ReadOnly
public class CardexView extends AutoEditableView<Cardex> {
    private static volatile Cardex selected;          // demo holder; survives in-place re-renders
    private static volatile boolean flip;
    public static void prime(Cardex c) { selected = c; }

    @Override public Cardex load(HttpRequest rq)   { return selected != null ? selected : new Cardex(); }
    @Override public void persist(Cardex c, HttpRequest rq) { selected = c; }

    // Advertise reloadPax so the embedded component CLAIMS it (and routes it to handleAction).
    @Override public List<Action> actions(HttpRequest rq) {
        var l = new ArrayList<>(super.actions(rq));
        l.add(Action.builder().id("reloadPax").build());
        return l;
    }

    @Override public Object handleAction(String actionId, HttpRequest rq) {
        if ("reloadPax".equals(actionId)) {
            var pax = rq.getParameters(Cardex.class);   // the pax-selected payload
            if (pax != null) selected = pax;
            // Alternate the (always-view) route so the embedded mediator re-renders every time.
            flip = !flip;
            setRouteTo(flip ? "/view" : "/");
            return new State(this);
        }
        return super.handleAction(actionId, rq);
    }
}
```

Embed it in the page as a plain field; seed the lead on load so it shows data initially:

```java
public class CheckInForm {
    @Section(value = "Info cardex", zone = "left") @Label("")
    CardexView cardex = new CardexView();
    // in load()/populate(): CardexView.prime(line.getGuests().get(0).getCardex());
}
```

Now selecting a guest re-renders **only** the cardex with that pax — the rest of the check-in form,
its scroll position and open sections are untouched.

### Three things that make the self-reload work

1. **`@SubscribeTo` on the entity, not the orchestrator** — an embedded `MultiView`'s triggers are
   mapped from the loaded model (`Cardex`), so the subscription must live there.
2. **Advertise the action** — `reloadPax` must be in the component's `actions()` (alongside the
   built-in `edit`/`save`/`cancel-edit`), otherwise the dispatched event bubbles unclaimed and never
   reaches the server. (`@OnRowSelected` registers its action automatically; a custom one on an
   embedded orchestrator you add by hand.)
3. **Force a re-render** — return `new State(this)` after alternating the (always-view) route.
   The embedded mediator only re-renders when its route changes, so a fixed `/view` would update on
   the first selection only; alternating `/view` ↔ `/` (both resolve to the view) re-renders on every
   selection.

### Simpler alternative — handle it on the page

If a dedicated cardex component is overkill, subscribe on the page itself and update an `@Inline`
section, returning `new State(this)`. The whole page re-renders (it may reset the active tab/scroll),
but it needs no extra component:

```java
@SubscribeTo(event = "pax-selected", action = "selectPax", source = SubscriptionSource.DOCUMENT)
public class CheckInForm {
    Object selectPax(HttpRequest rq) {
        populate();
        clientInfo.applySelectedPax(rq.getParameters(Cardex.class));
        return new State(this);
    }
}
```

---

## Multi-state embedded islands (backend-driven state machines)

The same island mechanics scale to an in-page element whose **content the backend decides**, with
any number of states. The demo's check-in *Documento* block is an `@Inline` embedded `EditableView`
with three states:

1. **Sin datos** — a warning notice plus an *Escanear documento* button.
2. **Hay datos** — a property list with the scanned data and the built-in *Edit* toolbar button.
3. **Editor** — the standard editable form; *Save* persists and lands back on state 2.

```java
@UI("/checkin-documento")
@Title("Documento")
public class DocumentoView extends EditableView<Object, DocumentoView.DocumentoEditor> {

    @Hidden String stayId;      // context, seeded by the host (see below)
    @Hidden boolean vistaAlterna;

    @Override
    public Object view(HttpRequest rq) {
        var guest = guest();
        if (guest == null || !guest.identityComplete()) {
            return new DocumentoPendiente();          // state 1 — its class carries
        }                                             // @SubscribeTo("documento-escaneado")
        return fill(new DocumentoDatos(), guest);     // state 2 — @Section(propertyList = true)
    }

    @Override
    public DocumentoEditor editor(HttpRequest rq) { ... }   // state 3

    @Override
    public boolean readOnly() {                        // no Edit button while empty
        var guest = guest();
        return guest == null || !guest.identityComplete();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest rq) {
        return switch (actionId) {
            case "escanear" -> LongTask.create("Escaneando documento…")   // SSE progress dialog
                .withProgressBar()
                .withCommand(UICommand.dispatchEvent("documento-escaneado"))
                .run(progress -> ...);
            case "reloadDocumento" -> {                // fired by the subscription
                vistaAlterna = !vistaAlterna;          // route flip → re-render
                setRouteTo(vistaAlterna ? "/view" : "/");
                yield new State(this);
            }
            default -> super.handleAction(actionId, rq);
        };
    }
}
```

The host page embeds it and passes context by **just setting fields** on the instance — the
framework seeds the island's initial state with the field value's simple properties:

```java
@Section(value = "Documento", zone = "main")
@Inline
@Label("")
DocumentoView documento;

public IdentidadStep load(HttpRequest rq) {
    stayId = GuestHeaders.idFromRoute(rq, "checkin");
    documento = new DocumentoView();
    documento.setStayId(stayId);   // reaches the island's first render
    return this;
}
```

The moving parts are the same three rules as the cardex above, plus two specific to this shape:
the async leg (the scan) is a [`LongTask`](/ux-patterns/long-tasks/) SSE action whose completion
command dispatches the event, and the `@SubscribeTo` lives on the **empty-state model** (the class
`view(...)` returns in state 1), because that is the loaded model while the user can trigger the
scan. Because the host is re-created on every request, it must derive its own context (here the id
from the route) before seeding the island.

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
