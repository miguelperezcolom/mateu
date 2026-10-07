---
title: Not found
description: A route whose record does not exist renders a not-found page in place of its content — throw NoSuchElementException with a user-facing message and Mateu does the rest, in every renderer.
---

**Status:** ✅ Implemented

## Intent

A link outlives what it points to. A booking is deleted, a customer is merged into another, an id
is mistyped in a shared URL — and the user opens `/reservas/FO-X6JB7F`. The screen behind that
route cannot load its record, and the worst answers are the common ones: an error toast over an
empty page, or a stack trace in the log for something that is not a bug.

The right answer is a page that says what happened — *this record is not here* — and offers a way
back, inside the app's shell so the menu is still there.

## Solution

**Throw `java.util.NoSuchElementException` while the route loads**, with a message written for the
user. Nothing else to do: no screen-by-screen handling.

```java
@Override
public Stay view(String id, HttpRequest httpRequest) {
  return stays.findById(id)
      .orElseThrow(() -> new NoSuchElementException("Reserva " + id + " no encontrada"));
}
```

What counts as "while the route loads": the view's constructor, a `RouteHandler`, a
`Navigable.view(id)`, a CRUD's `findById` for its detail or edit route, and the mapping of the
loaded view — anything that runs for the initial load of a route (an empty action id, or
`__load__`). Mateu then:

- answers a **`NotFound` component** (`NotFoundDto {title, message, backRoute, backLabel}` on the
  wire) as the content of the route — not an error message. The renderers paint it in place of the
  page, keeping the app shell (top bar, menu) around it;
- uses the exception's **message as the heading**;
- logs **one INFO line** (`Not found: route /reservas/FO-X6JB7F — Reserva FO-X6JB7F no encontrada`)
  instead of an ERROR with a stack trace;
- offers a **way back** to the parent route (`/reservas/FO-X6JB7F` → `/reservas`), or the app home
  for a top-level route.

A route that resolves to **nothing at all** (no view, no definition) answers the same page, headed
*Page not found* — it used to be a bare red `Not found.` text.

### The generic fallback

When the exception carries no message — or carries `Optional.orElseThrow()`'s own *"No value
present"*, which says nothing to a user — the heading is generic and names the missing id (the
last segment of the route): **«No se ha encontrado FO-X6JB7F»** / **«Not found: FO-X6JB7F»**. The
secondary line is *«Puede que se haya borrado o que el enlace no sea correcto.»* / *"It may have
been deleted, or the link is wrong."*, and the way back reads *Volver* / *Go back*. The server picks
Spanish or English from the request's `Accept-Language` (any other language gets English); the
renderers fall back to the same texts in the page's language if a `NotFound` arrives without them.

### What it does not change

- **Other exceptions** keep today's behaviour: an error message, and an ERROR log with the stack.
- A `NoSuchElementException` thrown by an **action** (a button) on a screen that does exist is still
  an error message. Replacing the screen under the user's click would be wrong: the screen is there,
  something it looked up is not.

### Returning it yourself

`NotFound` is an ordinary component (`io.mateu.uidl.data.NotFound`), so a view can also return one
directly — or a YAML definition declare `type: NotFound` — when it wants a not-found page with its
own texts or way back:

```java
return NotFound.builder()
    .title("Esta reserva ya no existe")
    .message("Se canceló y se archivó el 3 de octubre.")
    .backRoute("/reservas")
    .backLabel("Ver reservas")
    .build();
```

## How it looks

**Vaadin** — an icon, the heading (an `<h2>`), the line and the way back, centered and drawn with
the theme's Lumo tokens, so it follows light and dark:

![Not found page in the Vaadin renderer, light](/images/docs/not-found/vaadin-light.png)

![Not found page in the Vaadin renderer, dark](/images/docs/not-found/vaadin-dark.png)

**Redwood** — Redwood's own idiom for this, the Spectra `oj-sp-empty-state` in its full-page layout
(its illustrated background, primary and secondary text, and the way back as its navigation link),
under Redwood's search icon. The page header is hidden: the empty state carries the heading, and a
visually hidden `<h2>` gives it to screen readers as a heading.

![Not found page in the Redwood renderer](/images/docs/not-found/redwood.png)

The way back is an in-app navigation in both — the same one a menu click makes — not a page reload.

## Notes

- The Java backend only for now: the C# and Python ports still answer an error for a missing record.
- Tests: `NotFoundPageSyncTest` (backend), `notFoundRenderer.test.ts` (Vaadin), the `not found`
  cases of the Redwood contract tests (`poc/test.mjs`), and `e2e/tests/shared/not-found.spec.ts`
  against every adapter.
