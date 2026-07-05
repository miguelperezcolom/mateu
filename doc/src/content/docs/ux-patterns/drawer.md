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
