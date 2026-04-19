---
title: "Key annotations"
weight: 1
---

# Key annotations

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

## Other useful annotations

These are also part of the public DSL and are worth knowing:

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
