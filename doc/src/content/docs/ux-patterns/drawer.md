---
title: Drawer
description: Open a secondary form in a side panel that slides over the current page, and return its result to the host.
---

**Status:** ✅ Implemented

## Intent

Let an action open another form — an editor, a picker, a detail — in a panel that slides in from the side, without leaving the page underneath. On close, notify the host page so it can refresh itself or receive the result.

Oracle Redwood ships **five** drawer templates — general, bottom, create-and-edit, guided-process and
configuration. Mateu covers all of them with **one** component, `Drawer`, plus `editInDrawer()` on a
crud for the create-and-edit case. The sections below describe each template in Mateu terms: when to
use it, its regions, how it behaves, what you can configure and what the Redwood renderer paints.

## Problem

Centered modal dialogs hide the page context and feel heavyweight for quick side tasks. Navigating away to a second page loses the user's place entirely. Dense operational screens (check-in desks, back offices) need "edit this bit" interactions that keep the main record visible.

## How

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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

The drawer slides in over a backdrop and closes on the header ✕, on Esc, on a backdrop click, or when an action run from inside it returns a close command. `modeless(true)` drops the backdrop so the page stays interactive; `layout(true)` docks the drawer and **pushes** the page aside instead of covering it.

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

### Demo

`demo-admin-panel/.../drawer/DrawerDemo.java` (`/drawer-demo`): a contact card whose toolbar action opens the editor in a right-hand drawer; saving closes it, toasts, and refreshes the card in place.

### Notes

- Closing via ✕, Esc or the backdrop emits **no** event — that's the "dismissed without saving" path, and the host is intentionally not disturbed.
- Position `start`/`end` maps to the left/right edge. Width accepts any CSS length; the panel caps at 92vw.
- Styling is design-system neutral (Lumo CSS variables with fallbacks), so it renders on every web renderer.

:::note[How Redwood draws a drawer]
The Redwood renderer docks every `Drawer` in a JET `oj-drawer-popup` at the edge it names
(`start`, `end` or `bottom`; modeless when `modeless`/`layout`) and paints it with **one of Spectra's
drawer templates**, picked from what the drawer is:

- a drawer docked at the **bottom** → `oj-sp-bottom-drawer-template`;
- a drawer you **type into and save** (editable fields and an action — the crud's `editInDrawer()`,
  an operation's form) → `oj-sp-create-edit-drawer-template`;
- anything else (read-only detail) → `oj-sp-general-drawer-template`.

The template brings the header (title, subtitle, ✕ or Cancel, maximize, previous/next arrows — in an
overflow menu when there are too many), the size, the footer and the full-window layout on small
screens; Mateu's content is its default slot. A `width` without a `size` is read as the nearest
Spectra size (the crud's `36rem` → M). The tables below mark each element.
:::

## General Drawer — read-only detail (subtitle, sizes, maximize, peer navigation)

The Redwood **General drawer** is a side panel for *reading*: it tells the user more about one or
several objects of the page — the work order behind a slot of a production schedule, the details,
similar products and order history of an order line — while the page stays where it was. It is not
a place to change data; for that use the [create-and-edit drawer](#crud-editing-in-a-drawer-editindrawer).

In Mateu it is the same `Drawer`, returned from an action, with read-only content and four header
extras.

### When to use it

- The user needs context about an object **without losing the page** — a quick look, then back.
- One object (a task's details) or several (a comparison, the items behind a selection).
- The content is read-only: property lists, tables, cards, charts, a hierarchy.
- Not for transactions (use `editInDrawer()` or a form in a drawer), and not for content that
  deserves its own address — a detail page ([General overview](/ux-patterns/general-overview/),
  [Item overview](/ux-patterns/item-overview/)) is shareable, a drawer is not.

### Anatomy

| Region | What it holds | Mateu piece |
|---|---|---|
| Header — information and actions | title, subtitle, previous/next object arrows, maximize, close, an optional tab bar or avatar | `headerTitle`, `subtitle`, `peerNav`, `maximizable`, the built-in ✕; `header` for a custom header component (e.g. a `TabLayout`) |
| Default slot | the read-only content: property lists, tables, lists, cards, charts, a hierarchy | `content` — any component |
| *(Mateu addition)* footer | object-level actions | `footer`, or buttons in `content` (Redwood moves parameterless buttons to its bottom bar) |

![A general drawer showing a person's details over the directory page](/images/docs/redwood-templates/general-drawer-1.png)

### Responsive behaviour

- **Wide screens** — the drawer opens over the page at its size (`size` or `width`).
- **Narrow screens** — Redwood's guide makes the drawer take the whole window: the Redwood renderer
  does (Spectra's template); Vaadin keeps the width, capped at 92% of the viewport.
- Redwood's guide also moves maximize and close into an overflow menu when the header has more than
  three actions — the Redwood renderer does (the template); Vaadin's header simply wraps.

### What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Size S / M / L / XL (464px / 648px / 968px / 90%) | `size(DrawerSize.s \| m \| l \| xl)`; an explicit `width` overrides it | ✅ | Spectra's `drawerSize`; on Redwood a `width` alone maps to the nearest size |
| Maximize (one size up, not from XL) | `maximizable(true)` | ✅ | the template's maximize (`drawerState`); Vaadin steps the drawer up `s→m→l→xl` client-side |
| Title | `headerTitle` | ✅ | |
| Subtitle | `subtitle` | ✅ | |
| Close | built in (✕, Esc, backdrop) | ✅ | the template's ✕ (`closeAction`), Esc, a click outside |
| Previous / next object | `peerNav(new PeerNav(prevLabel, prevRoute, nextLabel, nextRoute))`; a `null` route disables that side | ✅ | the template's arrows; a click closes the drawer and navigates to the route |
| Header slot (tabs) | `header` component | ❌ | on Redwood, put the tabs in `content` |
| Avatar | — | ❌ | not modelled on `Drawer` |
| Start or end edge | `position(DrawerPosition.start \| end)` | ✅ | the popup's `edge` |
| Popup (modal or not) vs layout (push) | `modeless(true)` / `layout(true)` | 🟡 | Redwood: modeless popup for both — it does not push the page |
| Object-level actions | buttons in `content` / `footer` | ✅ | Redwood: the template's footer (primary + up to two secondaries); more stay in a bar of their own |

### Building it with Mateu

```java
@UI("/staff")
@Title("Directory")
public class StaffDirectory {

  @Toolbar
  @Label("View profile")
  Drawer viewProfile() {
    return Drawer.builder()
        .headerTitle("Ada Lovelace")
        .subtitle("Employee #100 · Engineering")
        .size(DrawerSize.l)          // s=464 · m=648 · l=968 · xl=90vw (width overrides)
        .maximizable(true)           // a ⤢ button bumps the drawer one size up (client-side)
        .peerNav(new PeerNav("Charles Babbage", "/staff/99", "Alan Turing", "/staff/101"))
        .content(new Text("Joined 2021 · London office · mentors three juniors."))
        .build();
  }
}
```

- **`size`** picks a standard width; an explicit `width` still overrides it.
- **`maximizable`** shows a maximize button that steps the drawer up the size ladder (`s→m→l→xl`)
  entirely in the frontend — no server round-trip.
- **`peerNav`** puts the previous/next-object arrows (the same `PeerNav` used by page headers) in
  the drawer header; a `null` route disables that side.
- **`subtitle`** renders under the title.

Ported to .NET (`DrawerSize`, `Drawer { Subtitle, Size, Maximizable, PeerNav }`) and Python
(`DrawerSize`, `Drawer(subtitle=…, size=…, maximizable=…, peer_nav=…)`). Demo:
`/general-drawer-demo` (`demo-redwood-showcase`, `demo-admin-panel`).

### Known gaps

- Redwood: the `header` slot (tabs) is not used yet, and `layout(true)` does not push the page.
- Vaadin: no full window on small screens.
- No avatar in the drawer header.

Details: [general-drawer review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/general-drawer.md).

## Bottom Drawer (`DrawerPosition.bottom` + `collapsible`)

The Redwood **Bottom drawer** is the general drawer laid along the **bottom** edge, full width: the
page above keeps its place while supporting information — order lines, a log, a table of related
records — sits below it. It comes in two flavours: **closable** (opened on demand, closed with ✕)
and **fixed** (always present, folded to its header strip or unfolded with a handle).

### When to use it

- The supporting information is wide (tables, lists of rows) and reads better full width than in a
  narrow side panel.
- The user works *above* it — a schedule, a map, a canvas — and glances down for detail.
- Use the fixed/collapsible flavour for something that should stay at hand for the whole task; the
  closable one for a one-off look.

### Anatomy

| Region | What it holds | Mateu piece |
|---|---|---|
| Header | title (or tabs), subtitle, close or the expand/collapse handle, maximize | `headerTitle`, `subtitle`, the ✕, `collapsible(true)` (▾/▴), `maximizable` |
| Main slot | form fields, collections and their toolbar, lists, tables | `content` |

![A collapsible bottom drawer docked under the orders page, Spectra's handle on top](/images/docs/redwood-templates/bottom-drawer-1.png)

![The same drawer folded to its handle strip](/images/docs/redwood-templates/bottom-drawer-2.png)

### Responsive behaviour

Full width at every size. The height defaults to half the viewport (`--mateu-drawer-height`, capped at
90vh); collapsing shrinks it to the header strip. Redwood's guide gives the template two heights,
default and maximized.

### What you can configure

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Docked at the bottom, full width | `position(DrawerPosition.bottom)` | ✅ | `oj-sp-bottom-drawer-template` in a popup at the bottom edge |
| Expand / collapse handle (fixed mode) | `collapsible(true)` | ✅ | Redwood: the template's `fixed` mode — its handle (`drawerState` auto ⇄ minimized), modeless, Esc closes it; Vaadin: client-side ▾/▴ |
| Close (closable mode) | built in | ✅ | the template's ✕ (a non-collapsible bottom drawer) |
| Fixed mode (cannot be dismissed) | — | ❌ | a returned `Drawer` can always be closed; only a drawer an archetype composes into the page (e.g. `GanttPage.bottomPanel`) stays |
| Default / maximized height | `maximizable(true)` | 🟡 | Redwood: the template's maximize (half the viewport → 90%); on Vaadin `maximizable` steps the *width*, which a bottom drawer ignores |
| Title / subtitle | `headerTitle` / `subtitle` | ✅ | |
| Tabs in the header | `header` | ❌ | |
| Previous / next object | `peerNav` | ❌ | the bottom template has no arrows |
| Push the page up instead of covering it | `layout(true)` | ❌ | |
| "Peek" tab so users discover it; cancelable state change | — | ❌ | |

### Building it with Mateu

```java
@UI("/orders-overview")
@Title("Orders")
public class OrdersOverview {

  @Toolbar
  @Label("Show lines")
  Drawer showLines() {
    return Drawer.builder()
        .headerTitle("Order #4471 — lines")
        .subtitle("3 lines · 240.00 €")
        .position(DrawerPosition.bottom)
        .collapsible(true)
        .content(new Text("Desk lamp × 2 · Office chair × 1"))
        .build();
  }
}
```

Ported to .NET (`DrawerPosition.Bottom`, `Drawer { Collapsible }`) and Python
(`DrawerPosition.bottom`, `Drawer(collapsible=…)`). Demo: `/bottom-drawer-demo`.

### Known gaps

- A collapsible drawer is Spectra's *fixed* mode on Redwood, which has no ✕: it closes with Esc. A
  drawer both collapsible and closable would need a Mateu flag for the fixed mode (Spectra keeps the
  two apart).
- The drawer an archetype composes INTO the page (`GanttPage.bottomPanel`) is still drawn inline as a
  collapsible panel on Redwood, not docked: the template needs its body as slot content, and the
  page's content is painted as flat atoms VB cannot nest in it.
- Vaadin: maximize does not change the height.

Details: [bottom-drawer review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/bottom-drawer.md).

## CRUD editing in a drawer (`editInDrawer()`)

The Redwood **Create and edit drawer** is the transactional drawer: the user creates or edits an
object of a collection without leaving it — the form slides over the listing, and the listing is
still there, filtered and scrolled as it was, when the drawer closes.

You don't build this drawer yourself: override `editInDrawer()` on any `AutoCrud` (or `Crud`) and the
crud's **New** button and row clicks open the create/edit form in a drawer instead of navigating to
the `/new` — `/{id}/edit` routes.

### When to use it

- Short records edited one at a time from a list (contacts, rates, rooms) — the user stays in the
  collection.
- Editing a **series** row after row: add *Save and next*.
- Not for long, sectioned records (use the routed editor —
  [Advanced create and edit](/ux-patterns/advanced-create-and-edit/)) or for read-only detail (the
  [general drawer](#general-drawer--read-only-detail-subtitle-sizes-maximize-peer-navigation)).

### Anatomy

| Region | What it holds | Mateu piece |
|---|---|---|
| Header | the record's title, close | set by the crud (create / edit title); ✕ built in |
| Error banner | the message of a failed save, above the form | `CrudDisplay.errorBanner` (default on) |
| Default slot — the form | the same fields, sections and validations as the routed editor | the crud's editor / creation form |
| Footer actions | Create or Save, *Save and next*, Cancel | the form's actions; labels via `saveLabel()`, `saveAndNextLabel()`, `cancelLabel()` |

![A row click opens the edit form in a drawer over the listing](/images/docs/drawer/edit-in-drawer.png)

### Responsive behaviour

The drawer has the width of `editDrawerWidth()` (default `36rem`), capped at 92% (Vaadin) / 90%
(Redwood) of the viewport; it does not switch to full window on small screens.

### What you can configure

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Form in a drawer over the listing | `editInDrawer()` → `true` | ✅ | the listing never unmounts |
| Drawer width | `editDrawerWidth()` (a CSS length) | ✅ | |
| Create vs Save primary action | derived from whether the row exists | ✅ | |
| Save and close | built in: persists, closes, the listing re-searches | ✅ | |
| Save and next | `display()` → `CrudDisplay.saveAndNext(Toggle.on)` + `nextIdAfter(id, rq)` + `saveAndNextLabel()` | ✅ | |
| Error banner on a failed save | `CrudDisplay.errorBanner` (default `on`) | ✅ | |
| New / Delete buttons on · off · disabled | `CrudDisplay.create` / `delete` | ✅ | on top of `canCreate`, `@NotCreatable`… |
| Unsaved-changes confirmation on close | built in | ✅ | Cancel, ✕, Esc, a click outside and the record arrows ask before dropping unsaved edits. Redwood: Spectra's unsaved-changes banner (Discard / Cancel); Vaadin: the same confirmation the navigation guard uses ("Discard your changes?") |
| Leaving the screen with the drawer open | built in | ✅ | the browser's Back/Forward, a menu entry, a link or a `NavigateTo` asks once when the drawer (or the page) has unsaved edits; staying keeps the drawer and its values (and the address), leaving — or a navigation with nothing unsaved — closes the drawer before the next page loads ([partial forms](/ux-patterns/partial-forms/#unsaved-changes-in-dialogs-and-drawers)) |
| Close | built in | ✅ | Redwood: the template's Cancel (no ✕ in Spectra's create-edit header), Esc |
| Title placeholder in create mode | — | ❌ | |
| Previous / next record arrows | with *Save and next* on | 🟡 | Redwood: the template's arrows walk the listing rows on screen, and its primary becomes «Save and next / Save and close»; Vaadin: *Save and next* only |

### Building it with Mateu

```java
@UI("/contacts")
public class ContactsCrud extends AutoCrud<Contact> {
  @Override
  public CrudStore<Contact> store() {
    return new ContactStore(); // your CrudStore<Contact>
  }

  @Override
  public boolean editInDrawer() {
    return true;
  }
  // optional: @Override public String editDrawerWidth() { return "42rem"; }
}
```

The listing never unmounts (scroll, filters and page survive); **Save** persists, closes the drawer and re-runs the listing's search in place (the closing drawer emits a saved event the listing subscribes to); **Cancel**/✕/Esc close it — asking first when the user typed something (see *Unsaved changes* below). In this mode there is no separate read-only view page — a row click goes straight to the edit drawer (on read-only cruds row clicks keep navigating to the view).

![The New button opens an empty create form in the drawer](/images/docs/redwood-templates/create-edit-drawer-1.png)

Demo: `demo-admin-panel/.../drawercrud/ContactsDrawerCrud.java` and `demo-redwood-showcase`
(`/drawer-crud-demo`). Tests: `EditInDrawerSyncTest`.

### Unsaved changes

The drawer's form is dirty-tracked exactly like the routed `/new` and `/{id}/edit` editors (the
server marks it `confirmOnNavigationIfDirty`, as it does for those pages — in Java, .NET and
Python, and for a capability listing's `Editable` drawer too). Once the user has typed something,
closing the drawer by hand — **Cancel**, ✕, Esc, a click outside, the record arrows — asks *"Discard
your changes?"*: **Discard** closes it, **Cancel** keeps the drawer open with what was typed.
Nothing typed, nothing asked. A successful **Save** (or *Save and next*) answers `MarkAsClean` and
closes or moves on without asking, and a refused save keeps the drawer dirty, so the typed values
are still protected behind the error banner.

The question is about the drawer only: a clean drawer over a page with its own unsaved changes
closes without asking, and discarding the drawer's edits leaves the page's state alone (leaving the
page still asks about it). The same applies to any `Dialog`/`Drawer` whose content is a tracked
form (`@ConfirmOnNavigationIfDirty`). A `UICommand.closeModal()` sent by the server never asks.

### Save and next, and the error banner

Two more pieces of the Redwood create-edit drawer, switched through the crud's `display()`
(`CrudDisplay`, the tri-state `Toggle` grammar — `on` · `off` · `disabled`):

```java
@Override
public CrudDisplay display() {
  return CrudDisplay.defaults().toBuilder()
      .saveAndNext(Toggle.on)               // default off
      .create(canCreate ? Toggle.on : Toggle.disabled)
      .delete(Toggle.off)
      .build();
}
```

- **Save and next** — editing a series row by row: the drawer gets a *Save and next* button; it
  saves, and the SAME drawer moves on to the next row of the listing (the server re-sends it with
  the same id, which refreshes the open drawer in place) while the listing refreshes behind it. On
  the last row it closes like a plain save. The next row comes from `nextIdAfter(currentId, rq)` —
  by default the row after it in an unfiltered search; override it to follow the user's filters.
  Label: `saveAndNextLabel()`.
- **Error banner** (`errorBanner`, default `on`) — when the save throws, the drawer stays open with
  the exception's message as a danger banner above the form and the values the user typed, and the
  message is announced to screen readers. `off` brings back the plain error toast.
- `create` / `delete` — the New and Delete buttons; `disabled` shows them inert (and the server
  refuses them), on top of the capability gates (`canCreate`, `@NotCreatable`…), which still decide
  whether the affordance exists at all.

![Save and next: the drawer moved on to the next row](/images/docs/drawer/save-and-next.png)

On the Redwood renderer the drawer is Spectra's `oj-sp-create-edit-drawer-template`: **Save and next**
is its primary split button («Save and Next», with «Save and Close» in its menu — just «Save and Close»
on the last row), the record arrows in its header open the previous/next row of the listing on
screen, the refused save shows the template's own error banner, and leaving with unsaved edits
(Cancel, Esc, a click outside, an arrow) asks first through Spectra's unsaved-changes banner.

![Redwood: Save and next moved the drawer on to the next row](/images/docs/redwood-templates/create-edit-drawer-2.png)

![Redwood: a refused save keeps the drawer, with Spectra's error banner](/images/docs/redwood-templates/create-edit-drawer-3.png)

![Redwood: Cancel with unsaved edits asks through Spectra's banner](/images/docs/redwood-templates/create-edit-drawer-4.png)

![A failed save keeps the drawer open with an error banner](/images/docs/drawer/error-banner.png)

Tests: `CrudDisplaySyncTest`.

### Known gaps

- No title placeholder in create mode; the record arrows (Redwood) only walk the rows of the page on
  screen, and only when *Save and next* is on.

Details: [create-edit-drawer review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/create-edit-drawer.md).

## Guided Process Drawer (a wizard in a drawer, `EmbeddedView`)

The **Guided Process Drawer** pattern runs a short multi-step process inside a drawer — a subflow
or a batch action (≤5 steps; a longer process uses the full-page [wizard](/ux-patterns/wizard/)). Return a
`Drawer` whose content is a wizard wrapped in **`EmbeddedView`**:

```java
@Toolbar
Drawer requestAccess() {
    return Drawer.builder()
        .headerTitle("Request access")
        .size(DrawerSize.m)
        .content(new EmbeddedView(new RequestAccessWizard()))   // the wizard, embedded
        .build();
}
```

`EmbeddedView(view)` embeds a **routed** model view (a `Wizard`, or any `@UI` view or `routes.yaml` route) as an
**independent server-side component**: it renders inside the drawer but routes its **own** actions
back to itself, so the wizard advances step by step inside the drawer instead of bubbling its
Continue/Back to the host. Its state is the view's fields, serialised exactly as a page's are — no
getters needed. Demo: `/guided-process-drawer-demo`.

A `ModelViewComponent` renders its view as part of the component around it. In a drawer or a
dialog that would be the page behind — the form's fields would come up empty and its buttons run on
the host — so as the **content of an overlay** a `ModelViewComponent` wrapping a view is embedded
the same way, automatically. Outside overlays it keeps rendering inline.

The drawer header shows a **step pager** (`2 | 3`) driven live by the embedded wizard's progress —
no extra wiring, it appears whenever the embedded wizard uses `@WizardProgress(STEPS)` or `RAIL`. As
a subflow surface the Guided Process Drawer is meant for **short** processes (≤ 5 steps); embedding a
longer wizard still works but logs a warning suggesting a full-page [wizard](/ux-patterns/wizard/)
instead.

:::note[How it is drawn]
The renderers draw the drawer's wizard as a **generic wizard** — in Redwood, the step train
(`oj-train`) with the step's form and its Back / Next buttons inside the drawer — not as Redwood's
`oj-sp-guided-process` template. The full-page **Guided Process** (the overview, the lateral step
list) is a routed `Wizard` with `@WizardProgress(RAIL)`.
:::

### Batch action (one step per item)

The same shape drives a **batch action** — walk the user through a set of selected items, one review
step per item, inside the drawer. Reuse a single step type across several step fields (one field =
one step) so N items read as N screens without N step classes:

```java
@WizardProgress(WizardProgressStyle.STEPS)
public class BatchApprovalWizard extends Wizard {
    public static class ReviewStep implements WizardStep {
        @PlainText @Label("Requester") public String requester;
        @PlainText @Label("System") public String system;
        @Label("Decision") public Decision decision = Decision.APPROVE;

        public ReviewStep() {}   // the state round trip rebuilds steps with it

        public ReviewStep(String requester, String system) {
            this.requester = requester;
            this.system = system;
        }
    }
    public ReviewStep first  = new ReviewStep("Ada",  "VPN");
    public ReviewStep second = new ReviewStep("Bob",  "CRM");
    public ReviewStep third  = new ReviewStep("Cleo", "Wiki");
    public DoneStep done;

    // completion action on the WIZARD class — its button shows on the penultimate step
    @WizardCompletionAction @Label("Apply decisions") void apply() { done = new DoneStep(); }
}
```

The header pager tracks the batch (`1 | 3` → `3 | 3`). Because a Mateu wizard declares its steps as
**fields**, the batch size is fixed at authoring time; a batch whose size is only known at runtime is
the limit of this pattern — use a full-page Guided Process for a longer or dynamic flow. Demo:
`/batch-approval-demo`.

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| Drawer: title, subtitle, width, content, actions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Drawer: sizes, maximize, peer nav | ✅ | ✅ | ✅ | ✅ | ❌ ¹ | ✅ | ✅ |
| Drawer: start / bottom position, collapsible, modeless, layout | ✅ | ✅ | ✅ | ✅ | ❌ ¹ | ✅ | ✅ |
| `editInDrawer()` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save and next | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Error banner on a failed save | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `CrudDisplay` create / delete toggles | ✅ | ✅ ² | ✅ | ✅ | ✅ | ✅ | ✅ |

What makes save-and-next and the error banner work on a renderer is one rule: a `Drawer` re-sent
with the id of an OPEN drawer refreshes it in place (its `initialData` becomes the form's values)
instead of stacking a second one. ¹ Redwood paints every drawer as a modal end-edge
`oj-drawer-popup` (see the caution above). ² In .NET the toggles apply to `Crud<T>`; capability
listings (`IListing`) do not have them yet.

## Redwood parameter and slot reference (guided-process and configuration drawers)

The general, bottom and create-and-edit drawers are covered element by element in their sections
above. The two remaining drawer templates:

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

### `guided-process-drawer-template`

| Redwood prop / slot | Mateu | |
|---|---|---|
| A wizard inside a drawer | `EmbeddedView` + `Wizard` — see [Guided Process Drawer](#guided-process-drawer-a-wizard-in-a-drawer-embeddedview); Redwood draws it as a generic wizard (step train), not with this template | 🟡 |
| `processTitle`, `steps[]`, `currentStep`, `drawerSize` | from the embedded `Wizard` and the host `Drawer` | ✅ |
| `introductionPanel {secondaryText, indexDisplay}` | — | — |
| `spSkip`, `spBeforeStepNavigate` | from the embedded `Wizard`: `stepSkippable(step)` and `beforeStepNavigate(from, to, rq)` — see [Wizard](/ux-patterns/wizard/#redwood-parameter-and-slot-reference) | ✅ |
| `displayErrorMessageBanner` | — | — |

### `configuration-drawer-template`

The fifth drawer (a settings drawer: `drawerTitle/Subtitle`, `primaryAction`, `header` + default
slots) has no dedicated Mateu piece, but its whole surface is a subset of the general drawer — build
it with `Drawer` directly. ✅
