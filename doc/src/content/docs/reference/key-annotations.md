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

Switches a `CrudOrchestrator` to a split-panel layout: the record list stays on the left and the create/edit form opens on the right. No page transition occurs when the user selects a row.

```java
@UI("/orders")
@SplitCrud
public class OrdersCrud extends AutoCrudOrchestrator<Order> {}
```

The framework hides the *Cancel* button in the create form and automatically refreshes the list after saving. See [Split View](/ux-patterns/split-view/) for the full behaviour.

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

CRUD create and edit views activate this behaviour automatically — the annotation is only needed on standalone forms. Use `UICommand.markAsClean()` in save actions and `UICommand.markAsDirty()` to set the flag programmatically.

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
- `@Section`
- `@Colspan`
- `@ReadOnly`
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
