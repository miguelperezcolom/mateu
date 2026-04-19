---
title: "Useful types"
weight: 4
---

# Useful types

These public types are not the core DSL by themselves, but they appear often enough that they deserve documentation.

---

## Messages and browser commands

### `Message`

Represents user-facing feedback.

```java
return new Message("Saved successfully");
```

Useful for notifications and success/error messages.

### `UICommand`

Represents commands executed in the browser.

Examples:

```java
UICommand.navigateTo("/users");
UICommand.runAction("refresh");
UICommand.pushStateToHistory("/users?page=2");
```

This is one of the key primitives for browser-side effects.

### `UICommandType`

Important values include:

- `NavigateTo`
- `RunAction`
- `PushStateToHistory`
- `CloseModal`
- `SetWindowTitle`
- `SetFavicon`
- `AddContentToHead`
- `AddContentToBody`

---

## Forms and fields

### `FormField`

Core fluent representation of a field.

Contains:

- data type
- stereotype
- required / readOnly
- options
- remote coordinates
- detail path
- editor/create forms
- layout details

This is one of the most important low-level types in the fluent DSL.

### `FieldDataType`

Important values include:

- `string`
- `integer`
- `number`
- `date`
- `time`
- `dateTime`
- `bool`
- `array`
- `file`
- `status`
- `money`
- `component`
- `menu`
- `range`
- `action`
- `actionGroup`
- `dateRange`

### `FieldStereotype`

This is the key enum behind `@Stereotype` / `@Representation`.

It defines the rendering type for a field.

---

## Grids and listings

### `GridColumn`

Defines a column in a grid/listing.

Contains things like:

- id
- label
- data type
- stereotype
- alignment
- sorting
- filtering
- width
- text/action behavior

### `GridContent`

Base interface for fluent grid content.

### `GridGroupColumn`

Groups multiple grid columns together.

---

## Relationships and options

### `Option`

Represents a selectable option.

Useful for:

- dropdowns
- radio/checkbox style choices
- lookup results

### `RemoteCoordinates`

Represents how a field can resolve remote data.

Used in relationship-heavy or distributed scenarios.

---

## Common visual primitives

These types are often embedded in pages and forms:

- `Text`
- `Image`
- `Avatar`
- `Badge`
- `Notification`
- `Popover`
- `Element`
- `MicroFrontend`
- `Scroller`
- `SplitLayout`
- `AccordionLayout`
- `TabLayout`
- `FullWidth`

These are worth knowing because they are the building blocks of richer fluent UI composition.

---

## Status and notifications

### `Status`
Maps semantic state to a `StatusType`.

### `NotificationVariant`
Defines the visual variant of notifications/messages.

### `Message`
Convenient high-level feedback type returned by actions.

---

## Mental model

Useful types are the vocabulary around the DSL.

They are the pieces that make routing, forms, listings, effects and composition work together.
