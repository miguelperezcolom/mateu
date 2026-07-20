---
title: Drawer
description: Open a secondary form in a side panel that slides over the current page, and return its result to the host.
---

**Status:** ✅ Implemented

## Intent

Let an action open another form — an editor, a picker, a detail — in a panel that slides in from the side, without leaving the page underneath. On close, notify the host page so it can refresh itself or receive the result.

## Problem

Centered modal dialogs hide the page context and feel heavyweight for quick side tasks. Navigating away to a second page loses the user's place entirely. Dense operational screens (check-in desks, back offices) need "edit this bit" interactions that keep the main record visible.

## How

Return a `Drawer` from any action method. Its `content` is any component — typically a form:

```java
@Toolbar
@Label("Editar en drawer")
Drawer editContact() {
  return Drawer.builder()
      .headerTitle("Editar contacto")
      .position(DrawerPosition.end)   // end (default) or start
      .width("28rem")
      .content(new ContactEditDrawerForm())
      .build();
}
```

The drawer slides in over a backdrop and closes on the header ✕, on Esc, on a backdrop click, or when an action run from inside it returns a close command. `modeless(true)` drops the backdrop so the page stays interactive.

### Closing with a result

`UICommand.closeModal(...)` has three forms:

```java
UICommand.closeModal()                            // just close the topmost overlay
UICommand.closeModal("contact-saved")             // close + emit an event
UICommand.closeModal("contact-saved", payload)    // close + emit an event carrying the result
```

The emitted event goes through the standard component-communication bus, so the host page reacts with `@SubscribeTo` — the payload arrives as the action's parameters:

```java
@UI("/drawer-demo")
@SubscribeTo(event = "contact-saved", action = "load", source = SubscriptionSource.DOCUMENT)
public class DrawerDemo {

  @PlainText String nombre = ContactHolder.nombre;

  @Action
  Object load() {
    nombre = ContactHolder.nombre;
    return new State(this);      // refresh the page in place
  }
}
```

Inside the drawer, the save handler persists and closes in one return:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
  if ("save-contact".equals(actionId)) {
    var edited = httpRequest.getComponentState(ContactData.class);
    ContactHolder.nombre = edited.nombre;
    return List.of(
        Message.success("Contacto guardado"),
        UICommand.closeModal("contact-saved", Map.of("nombre", edited.nombre)));
  }
  return null;
}
```

The same `closeModal(eventName, payload)` contract works for `Dialog` too — it closes whichever overlay is topmost. Overlays stack: a drawer can open another drawer (or a dialog), and each close unwinds only the topmost one.

## Demo

`demo-admin-panel/.../drawer/DrawerDemo.java` (`/drawer-demo`): a contact card whose toolbar action opens the editor in a right-hand drawer; saving closes it, toasts, and refreshes the card in place.

## Notes

- Closing via ✕, Esc or the backdrop emits **no** event — that's the "dismissed without saving" path, and the host is intentionally not disturbed.
- Position `start`/`end` maps to the left/right edge. Width accepts any CSS length; the panel caps at 92vw.
- Styling is design-system neutral (Lumo CSS variables with fallbacks), so it renders on every web renderer.

## General Drawer — read-only detail (subtitle, sizes, maximize, peer navigation)

The same `Drawer` doubles as the Redwood **General Drawer**: extra read-only info about an object
without leaving the page. Four header extras enrich it:

```java
return Drawer.builder()
    .headerTitle("Ada Lovelace")
    .subtitle("Employee #100")
    .size(DrawerSize.l)          // s=464 · m=648 · l=968 · xl=90vw (width overrides)
    .maximizable(true)           // a ⤢ button bumps the drawer one size up (client-side)
    .peerNav(new PeerNav("Prev", "/staff/1", "Next", "/staff/3"))  // ‹ › arrows in the header
    .content(readOnlyDetails)
    .build();
```

- **`size`** picks a standard width; an explicit `width` still overrides it.
- **`maximizable`** shows a maximize button that steps the drawer up the size ladder (`s→m→l→xl`)
  entirely in the frontend — no server round-trip.
- **`peerNav`** puts the previous/next-object arrows (the same `PeerNav` used by page headers) in
  the drawer header; a `null` route disables that side.
- **`subtitle`** renders under the title.

Ported to .NET (`DrawerSize`, `Drawer { Subtitle, Size, Maximizable, PeerNav }`) and Python
(`DrawerSize`, `Drawer(subtitle=…, size=…, maximizable=…, peer_nav=…)`).

## Bottom Drawer (`DrawerPosition.bottom` + `collapsible`)

Set `position(DrawerPosition.bottom)` to dock the drawer at the bottom edge, full width — the
Redwood **Bottom Drawer**. It slides up instead of in, and its height defaults to half the
viewport (`--mateu-drawer-height`, capped at 90vh). Add `collapsible(true)` for the
expand/collapse behavior: a ▾/▴ handle in the header shrinks the drawer to just its header strip
and expands it back — entirely client-side, no round-trip.

```java
return Drawer.builder()
    .headerTitle("Detalles del pedido")
    .position(DrawerPosition.bottom)
    .collapsible(true)
    .content(orderLines)
    .build();
```

Ported to .NET (`DrawerPosition.Bottom`, `Drawer { Collapsible }`) and Python
(`DrawerPosition.bottom`, `Drawer(collapsible=…)`).

## CRUD editing in a drawer (`editInDrawer()`)

For the "Create and Edit - Drawer" pattern (Oracle Redwood's RDS template), you don't need to build the drawer yourself: override `editInDrawer()` on any `AutoCrud` subclass and the crud's **New** button and row clicks open the create/edit form in a drawer sliding over the listing instead of navigating to the `/new` — `/{id}/edit` routes:

```java
@UI("/contacts")
public class ContactsCrud extends AutoCrud<Contact> {
  @Override
  public boolean editInDrawer() {
    return true;
  }
  // optional: @Override public String editDrawerWidth() { return "42rem"; }
}
```

The listing never unmounts (scroll, filters and page survive); **Save** persists, closes the drawer and re-runs the listing's search in place (the closing drawer emits a saved event the listing subscribes to); **Cancel**/✕/Esc just close it. In this mode there is no separate read-only view page — a row click goes straight to the edit drawer (on read-only cruds row clicks keep navigating to the view).

Demo: `demo-admin-panel/.../drawercrud/ContactsDrawerCrud.java` (`/drawer-crud-demo`). Tests: `EditInDrawerSyncTest`.
