---
title: "Interfaces"
---

Mateu defines a set of Java interfaces that your classes implement to plug into the framework's rendering, routing, data-loading, and action-handling pipelines.

## Page and component rendering

| Interface | Description |
|---|---|
| [`ComponentTreeSupplier`](component-tree-supplier/) | Implement to provide a custom component tree for a route |
| [`TitleSupplier`](metadata-suppliers/) | Provides the page title dynamically |
| [`SubtitleSupplier`](metadata-suppliers/) | Provides the page subtitle dynamically |
| [`PageTitleSupplier`](metadata-suppliers/) | Provides the browser tab title dynamically |

## Application structure

| Interface | Description |
|---|---|
| [`MenuSupplier`](menu-supplier/) | Provides the application navigation menu |
| [`Actionable`](actionable/) | A navigable menu item or action link |
| [`Submenu`](actionable/) | Marker interface for submenu containers |
| [`App`](app-interface/) | Marker interface for application root classes |

## Data loading

| Interface | Description |
|---|---|
| [`ListingBackend`](listing-backend/) | Provides paginated, searchable, filterable data for a grid |
| [`ReactiveListingBackend`](listing-backend/) | Reactive (Reactor) variant of `ListingBackend` |
| [`DataSupplier`](data-supplier/) | Provides arbitrary data to the component |
| [`CommandSupplier`](data-supplier/) | Provides UI commands to execute on the client side |
| [`PostHydrationHandler`](post-hydration/) | Called after the server re-hydrates component state |

## Action handling

| Interface | Description |
|---|---|
| [`ActionHandler`](action-handler/) | Handles named actions triggered from the UI |
| [`RouteHandler`](route-handler/) | Handles navigation requests for a route |
| [`HttpRequest`](http-request/) | Provides access to request context, parameters, and state |

## Persistence

| Interface | Description |
|---|---|
| [`CrudRepository`](crud-repository/) | Basic CRUD operations for an entity |
| [`CrudAdapter`](crud-repository/) | Full CRUD + listing adapter with separate view/editor forms |

## Validation

| Interface | Description |
|---|---|
| [`ValidationSupplier`](validation-supplier/) | Provides cross-field validations programmatically |
| [`RuleSupplier`](validation-supplier/) | Provides conditional UI rules programmatically |

## Visibility

| Interface | Description |
|---|---|
| `VisibilitySupplier` | Controls server-side visibility of fields, columns, buttons, and toolbar items dynamically at request time |
| `DisabledSupplier` | Controls server-side disabled state of fields, buttons, and toolbar items dynamically at request time |
| `ReadOnlySupplier` | Controls server-side read-only state of fields dynamically at request time |
| `RequiredSupplier` | Controls server-side required state of fields dynamically at request time |
| `StyleSupplier` | Provides field-level CSS styles dynamically at request time, overriding `@Style` |
| `DescriptionSupplier` | Provides field-level help/description text dynamically at request time, overriding `@Help` |
| `LabelSupplier` | Provides field-level label text dynamically at request time, overriding `@Label` |
| `ColspanSupplier` | Provides field-level colspan dynamically at request time, overriding `@Colspan` |
| `StereotypeSupplier` | Provides field-level stereotype dynamically at request time, overriding `@Stereotype` |
