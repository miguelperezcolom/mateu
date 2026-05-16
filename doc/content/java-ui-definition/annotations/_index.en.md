---
title: "Annotations"
weight: 3
---

# Annotations

Mateu's declarative UI is driven by Java annotations placed on classes, fields, and methods. The table below lists every annotation by category.

## Routing and registration

| Annotation | Target | Description |
|---|---|---|
| [`@UI`](ui/) | Class | Registers a class as a Mateu UI entry point |
| [`@Route`](route/) | Class | Maps a class to a URL path |
| [`@HomeRoute`](route/) | — | Declares the default home path |
| [`@BaseRoute`](route/) | — | Sets a base path prefix |

## App structure

| Annotation | Target | Description |
|---|---|---|
| [`@App`](app/) | Class | Applies an app layout variant |
| [`@DrawerClosed`](app/) | Class | Starts the drawer/sidebar in closed state |
| [`@Logo`](app/) | Class | Sets the app logo URL |
| [`@FavIcon`](app/) | Class | Sets the browser favicon |
| [`@KeycloakSecured`](app/) | Class | Protects a page with Keycloak authentication |
| [`@AI`](app/) | Class | Enables AI/SSE integration |

## Page metadata

| Annotation | Target | Description |
|---|---|---|
| [`@Title`](metadata/) | Class | Sets the page title |
| [`@PageTitle`](metadata/) | Class | Sets the browser tab title |
| [`@Subtitle`](metadata/) | Class | Sets the page subtitle |
| [`@Label`](metadata/) | Field, method | Overrides the display label for a field |
| [`@Help`](metadata/) | Class, field, method | Adds a help text / tooltip |

## Styling

| Annotation | Target | Description |
|---|---|---|
| [`@Style`](styling/) | Class, field | Inline CSS applied to the element |
| [`@CssClasses`](styling/) | Class, field | CSS class names applied to the element |
| [`@DivStyle`](styling/) | Class, field | Inline CSS applied to the wrapping div |

## Layout

| Annotation | Target | Description |
|---|---|---|
| [`@FormLayout`](layout/) | Class | Renders a multi-column form layout |
| [`@HorizontalLayout`](layout/) | Class | Renders children in a horizontal row |
| [`@VerticalLayout`](layout/) | Class | Renders children in a vertical column |
| [`@SplitLayout`](layout/) | Class | Renders a resizable split panel |
| [`@Scroller`](layout/) | Class | Wraps content in a scrollable container |

## Grouping and sections

| Annotation | Target | Description |
|---|---|---|
| [`@Section`](sections/) | Field, method | Groups following fields under a heading |
| [`@Tabs`](sections/) | Class | Wraps page content in a tabbed container |
| [`@Tab`](sections/) | Field, method | Assigns a field to a named tab |
| [`@Accordion`](sections/) | Class | Wraps content in an accordion |
| [`@AccordionPanel`](sections/) | Field, method | Assigns a field to an accordion panel |
| [`@List`](sections/) | Field | Renders a list (ordered or unordered) |
| [`@H1` – `@H5`](heading/) | Field | Renders the field value as a heading |

## Actions and buttons

| Annotation | Target | Description |
|---|---|---|
| [`@Button`](actions/) | Field, method | Renders a button that calls the annotated method |
| [`@Action`](actions/) | Class, method | Attaches a configurable action |
| [`@RowAction`](actions/) | Method | Marks a method as a row-level action in a grid |
| [`@ListToolbarButton`](actions/) | Method | Adds a toolbar button to a listing |
| [`@ViewToolbarButton`](actions/) | Method | Adds a toolbar button to a view |
| [`@Toolbar`](actions/) | Field, method | Places an element in the toolbar area |
| [`@WizardCompletionAction`](actions/) | Field, method | Marks the final action of a wizard |

## Navigation

| Annotation | Target | Description |
|---|---|---|
| [`@Menu`](navigation/) | Field | Marks a field as a navigation menu entry |
| [`@Breadcrumb`](navigation/) | — | Defines a single breadcrumb item |
| [`@Breadcrumbs`](navigation/) | Class | Adds a breadcrumb trail to a page |
| [`@Header`](navigation/) | Field | Places a field in the page header slot |
| [`@Footer`](navigation/) | Field | Places a field in the page footer slot |

## Field visibility and access

| Annotation | Target | Description |
|---|---|---|
| [`@Hidden`](visibility/) | Class, field | Hides the field |
| [`@HiddenInCreate`](visibility/) | Field | Hides the field only in create mode |
| [`@HiddenInEditor`](visibility/) | Field | Hides the field only in editor mode |
| [`@HiddenInList`](visibility/) | Field | Hides the field only in list view |
| [`@HiddenInView`](visibility/) | Field | Hides the field only in view mode |
| [`@ReadOnly`](visibility/) | Class, field | Makes the field non-editable |
| [`@Disabled`](visibility/) | Class, field, method | Disables the field or button |
| [`@EyesOnly`](visibility/) | Class, field, method | Restricts visibility to specific roles/groups |
| [`@EditableOnlyWhenCreating`](visibility/) | Field | Allows editing only during record creation |

## Validation

| Annotation | Target | Description |
|---|---|---|
| [`@Validation`](validation/) | Class | Adds a cross-field validation condition |
| [`@Rule`](validation/) | Class | Adds a conditional UI rule (show/hide, enable/disable) |

## Triggers and events

| Annotation | Target | Description |
|---|---|---|
| [`@Trigger`](triggers/) | Class | Fires an action on a lifecycle event |

## Field types and rendering

| Annotation | Target | Description |
|---|---|---|
| [`@Lookup`](field-types/) | Field | Renders a lookup / search field |
| [`@Option`](field-types/) | — | Declares an option for an enum or select field |
| [`@OptionsLayout`](field-types/) | Field | Controls how options are laid out |
| [`@UseRadioButtons`](field-types/) | Field | Renders enum options as radio buttons |
| [`@Representation`](field-types/) | Field | Sets a non-default field stereotype |
| [`@Stereotype`](field-types/) | Field | Alias for `@Representation` |
| [`@Filterable`](field-types/) | Field | Marks a field as filterable in a listing |
| [`@Colspan`](field-types/) | Field | Sets how many columns a field spans |
| [`@ColumnWidth`](field-types/) | Field | Sets the column width in a grid |

## Display and status

| Annotation | Target | Description |
|---|---|---|
| [`@KPI`](display/) | Field | Renders a field as a KPI tile |
| [`@Status`](display/) | Field | Maps field values to coloured status badges |
| [`@MappedValue`](display/) | Field | Maps raw values to display strings |
| [`@SliderMin` / `@SliderMax`](display/) | Field | Sets the min/max range for a slider field |
| [`@Details`](display/) | Field | Renders a field inside a collapsible details panel |
| [`@Widget`](display/) | Field | Renders a field as a widget |

## Data and persistence

| Annotation | Target | Description |
|---|---|---|
| [`@MasterDetail`](data/) | Field | Embeds a master-detail grid for a related collection |
| [`@Composition`](data/) | Field | Links to a composed entity via a CRUD repository |
| [`@Subresource`](data/) | Field | Marks a field as a sub-resource |
| [`@PrimaryKey`](data/) | Field | Marks the primary key field |
| [`@GeneratedValue`](data/) | Field | Generates a field value via a `ValueGenerator` |
