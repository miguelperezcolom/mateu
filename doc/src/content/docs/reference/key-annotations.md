---
title: "Key annotations"
---

These are the annotations that define most of the Mateu DSL.

This page is intentionally selective: it focuses on the annotations that shape routing, UI structure, actions, relationships, behavior, security, and presentation.

---

## `@UI`

Defines a UI root.

```java
@UI("/products")
public class Products {}
```

Use it when a class should become a page or UI entry point.

### Key fields

- `value()` → route or UI path
- `indexHtmlPath()` → frontend entry html
- `frontendComponentPath()` → renderer entry path

---

## `@Route`

Defines additional routes and supports placeholders.

```java
@Route("/example/:name")
public class ExamplePage {
    String name;
}
```

Use it when:

- you need path parameters
- you want more than one route
- you want nested routing with `parentRoute`

### Key fields

- `value()` → route pattern
- `uis()` → UI roots where the route applies
- `parentRoute()` → parent route for composition

---

## `@Menu`

Adds a field to the application menu.

```java
@Menu
Users users;
```

Use it to expose pages, modules or links in app navigation.

### Key fields

- `selected()` → mark current option as selected

---

## `@Button`

Marks a field or method as a button/action.

```java
@Button
void save() {}
```

Use it for form-level actions.

Targets:

- methods
- fields

---

## `@Toolbar`

Places a field or method in the toolbar.

```java
@Toolbar
void refresh() {}
```

Use it for top-level actions, typically in headers or listings.

---

## `@Action`

Configures action behavior.

```java
@Action(
  validationRequired = true,
  confirmationRequired = true
)
```

Use it when you need more than a bare button.

### What it controls

- validation
- confirmation dialogs
- background execution
- SSE
- browser integration (`href`, `js`)
- modal settings
- selected-row requirement
- fields to validate

---

## `@Lookup`

Defines a relationship resolved dynamically by backend suppliers.

```java
@Lookup(
  search = PermissionOptionsSupplier.class,
  label = PermissionLabelSupplier.class
)
List<String> permissions;
```

Use it when a field depends on remote or dynamic options.

### Key fields

- `search()` → `LookupOptionsSupplier`
- `label()` → `LabelSupplier`

---

## `@Searchable`

Adds a "Search" button to a field. Clicking it opens a modal containing the `selector()` class — typically a `Listing` that also implements `Selector`. When the user selects a row, the modal closes and the field is populated with the chosen id; `label()` resolves the display text for a stored id.

```java
@Searchable(selector = HotelSelector.class, label = HotelSelector.class)
String hotelId;
```

Use it when picking the related entity requires a filterable grid, row actions, or CRUD capabilities — anything beyond a simple dropdown (see `@Lookup`).

### Key fields

- `selector()` → `Selector` implementation (usually a `Listing` subclass) opened in the modal
- `label()` → `LabelSupplier` to display the stored id as text
- `editableCode()` → allow the user to type the id directly
- `showCode()` → show the raw id alongside the label

---

## `@Stereotype`

Overrides the default inferred rendering type of a field.

```java
@Stereotype(FieldStereotype.radio)
Status status;
```

Use it when the Java type is not enough to express how the field should be rendered.

---

## `@OnRowSelected`

Binds row selection of a grid field (a `List` field rendered with `@Stereotype(FieldStereotype.grid)`)
to a developer action. When the user clicks a row, Mateu runs the named method on the class that
declares the grid field, **auto-injecting the selected row** as a method parameter (the parameter
typed as the row class, via `HttpRequest.getClickedRow`). Unlike the built-in CRUD detail
editing, it works on read-only grids too — making it the natural way to build a master/detail view:
select a row, then emit an event or update another part of the screen.

```java
@OnRowSelected("onGuestSelected")
@Stereotype(FieldStereotype.grid)
List<GuestData> guests;

Object onGuestSelected(GuestData guest, HttpRequest httpRequest) {
    return UICommand.dispatchEvent("pax-selected", Map.of("name", guest.getFirstName()));
}
```

### Key fields

- `value` — name of the method/action to run when a row is selected.

> Combine with [`@SubscribeTo` / `@Emits`](#subscribeto) to drive other components from a selection.
> Opt-in: grids without `@OnRowSelected` keep their default selection behaviour.

---

## `@Style`

Adds inline CSS style to a type, field or parameter.

```java
@Style("max-width:900px;margin:auto;")
```

Use it for layout constraints and small visual adjustments.

---

## `@FormLayout`

Controls form rendering.

```java
@FormLayout(columns = 1)
public class MixedPage {}
```

Use it when you want to change the default form layout.

### Key fields

- `columns()`
- `theme()`
- `style()`

---

## `@Rule`

Defines dynamic browser-side behavior.

```java
@Rule(
  filter = "name == null || name == ''",
  action = RuleAction.Set,
  fieldName = "save",
  fieldAttribute = RuleFieldAttribute.disabled,
  value = "true",
  expression = "",
  actionId = "",
  result = RuleResult.Value
)
```

Use it when the UI must change dynamically without a server round-trip.

### What it can affect

- field attributes
- values
- styles
- css classes
- actions

---

## `@Trigger`

Defines when an action runs.

```java
@Trigger(type = TriggerType.OnLoad, actionId = "refresh")
```

Use it when an action should be triggered automatically.

### Trigger types

- `OnLoad`
- `OnSuccess`
- `OnError`
- `OnValueChange`
- `OnCustomEvent`
- `OnEnter`

---

## `@SubscribeTo`

Subscribes a component to a named custom event emitted by another component (or itself), so
components on the same screen can talk to each other. When the event fires, Mateu runs the named
action on the subscribing component server-side, passing the event payload as the action
parameters. Repeatable at class level.

```java
// React to any "checkin-confirmed" event on the global bus by re-running this component's load.
@SubscribeTo(event = "checkin-confirmed", action = "load")
public class CheckInForm { ... }
```

Use it together with [`UICommand.dispatchEvent(...)`](#emitting-events) — one component emits, others
react and refresh in place instead of forcing a full navigation.

### Key fields

- `event` — name of the custom event to listen for.
- `action` — id (method name) of the action to run when the event fires.
- `source` — where to listen (`SubscriptionSource`):
  - `DOCUMENT` (default) — global event bus: react no matter which component emitted the event.
  - `COMPONENT` — react only to events emitted by the component named in `from`.
  - `SELF` — react only to events bubbling up from this component's own subtree (the behaviour of a
    raw `@Trigger(type = OnCustomEvent)`).
- `from` — logical name of the emitting component to match, used only with `source = COMPONENT`
  (matches the emitter's `@Emits(name = ...)`).
- `condition` — optional client-side expression that must hold for the action to run.

> A raw `@Trigger(type = OnCustomEvent, ...)` is equivalent to `@SubscribeTo` with `source = SELF`.

---

## `@Emits`

Declares the custom events a component emits and, optionally, the logical name it emits them under.
It is mostly documentary — events are actually emitted by returning `UICommand.dispatchEvent(...)`
from an action. Its one runtime effect is `name`: when set, it is stamped into every event the
component emits (as `detail.__source`) so `@SubscribeTo(source = COMPONENT, from = ...)` subscribers
can filter by origin. When omitted, the component's server-side type acts as the implicit source.

```java
@Emits(events = "checkin-confirmed", name = "guests-section")
public class GuestsSection { ... }
```

### Key fields

- `events` — names of the events this component emits (documentary).
- `name` — logical source name stamped into emitted events as `detail.__source`.

### Emitting events

Return a `UICommand.dispatchEvent(...)` from any action to fire a custom event from that component:

```java
@Toolbar
Object confirmCheckin(HttpRequest httpRequest) {
    // ... persist ...
    return List.of(
        Message.success("Check-in confirmed"),
        UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", id)));
}
```

The event bubbles (`composed`), so `DOCUMENT`-scoped subscribers anywhere on the page receive it.

---

## `@EyesOnly`

Restricts access to parts of the UI.

```java
@EyesOnly(roles = "admin")
@Menu
Users users;
```

Use it for authorization.

### Supported scopes

- roles
- groups
- scopes
- permissions

---

## `@KeycloakSecured`

Secures a UI using Keycloak.

```java
@UI("")
@KeycloakSecured(
  url = "https://auth-server",
  realm = "mateu",
  clientId = "demo"
)
public class App {}
```

Use it for application authentication.

### Key fields

- `url()`
- `realm()`
- `clientId()`
- `jsUrl()`

---

## `@SplitCrud`

Switches a `Crud` (or `AutoCrud`) to a split-panel layout: the record list stays on the left and the create/edit form opens on the right. No page transition occurs when the user selects a row.

```java
@UI("/orders")
@SplitCrud
public class OrdersCrud extends AutoCrud<Order> {}
```

The framework hides the *Cancel* button in the create form and automatically refreshes the list after saving. See [Split View](/ux-patterns/split-view/) for the full behaviour.

---

## `@ReadOnly`

Applied to an `AutoCrud`, `FilteredAutoCrud`, or `Crud` class, hides the New, Edit, and Delete buttons. Shorthand for applying `@NotCreatable @NotEditable @NotDeletable` together.

```java
@UI("/audit-log")
@ReadOnly
public class AuditLog extends AutoCrud<AuditEntry> { ... }
```

Applied to a field or an `EditableView` class, makes that field or the entire view non-editable.

---

## `@NotNavigable`

Applied to a `Crud` class. Hides the View button column in the listing — rows are not clickable and do not navigate to the detail screen.

```java
@UI("/products")
@NotNavigable
public class ProductList extends AutoCrud<Product> { ... }
```

Combine with `@ReadOnly` for a plain read-only list with no detail view:

```java
@ReadOnly
@NotNavigable
public class AuditLog extends AutoCrud<AuditEntry> { ... }
```

---

## `@NotCreatable`

Applied to a `Crud` class. Hides the New button in the listing toolbar.

```java
@NotCreatable
public class OrderLines extends AutoCrud<OrderLine> { ... }
```

---

## `@NotEditable`

Applied to a `Crud` class. Hides the Edit button in the detail view toolbar.

```java
@NotEditable
public class ArchivedOrders extends AutoCrud<Order> { ... }
```

---

## `@NotDeletable`

Applied to a `Crud` class. Hides the Delete button in the listing toolbar.

```java
@NotDeletable
public class Invoices extends AutoCrud<Invoice> { ... }
```

---

## `@ConfirmOnNavigationIfDirty`

Enables dirty-state tracking on a form. When the user modifies any field, the frontend shows a confirmation dialog if they try to navigate away before saving.

```java
@ConfirmOnNavigationIfDirty
public class MyForm {
    String name;

    @Toolbar
    Object save() {
        // persist ...
        return UICommand.markAsClean();  // clear dirty flag after save
    }
}
```

Tracking is **opt-in**: a plain page without this annotation never prompts on exit, even if it has editable fields and a `save()` action. CRUD create and edit views are the only exception — they activate the behaviour automatically, so the annotation is only needed on standalone forms.

The confirmation covers every way of leaving the form: in-app menu navigation, the browser back/forward buttons, and reloading or closing the tab. Use `UICommand.markAsClean()` in save actions and `UICommand.markAsDirty()` to set the flag programmatically.

---

## Other useful annotations

These are also part of the public DSL and are worth knowing:

- `@AutoSave`
- `@Icon`
- `@PageTitle`
- `@Title`
- `@Subtitle`
- `@Logo`
- `@FavIcon`
- `@Widget`
- `@Footer`
- `@Header`
- `@Section` (incl. `zone` for use with `@Zones`)
- `@Zones` / `@Zone` — side-by-side layout zones (columns of sections)
- `@Compact` — high-density page preset (`StyleConstants.COMPACT`)
- `@PlainText` — render a value as read-only text instead of an input
- `@ColumnWidth` — fixed-width grid column
- `@Colspan`
- `@HiddenInList`
- `@HiddenInView`
- `@HiddenInEditor`
- `@HiddenInCreate`
- `@EditableOnlyWhenCreating`
- `@Status`
- `@Representation`
- `@Details`
- `@VerticalLayout`
- `@HorizontalLayout`
- `@SplitLayout`
- `@Accordion`
- `@Tabs`

## Mental model

The Mateu DSL is annotation-heavy by design.

Annotations define:

- routing
- structure
- behavior
- relationships
- rendering
- security

The result is a declarative application model instead of a separate frontend implementation.
