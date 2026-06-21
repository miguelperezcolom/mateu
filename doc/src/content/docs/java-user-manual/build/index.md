---
title: "Build"
---

This section covers the practical work of building Mateu UIs. Each page goes deeper into a specific aspect of the framework. The pages follow a progression from the outer shell inward, and from simple to advanced.

Start with the shell and navigation — these define the frame every user sees. Then move into domain modeling and CRUD, which is where most of your application code lives. Finally, tackle advanced composition patterns like master-detail, custom row actions, and full orchestrator control.

If you are building something new, read the pages in order. If you are solving a specific problem, jump directly to the relevant page.

---

## Pages in this section

### Shell and navigation

- [Application shell](/java-user-manual/build/application-shell/) — the outer frame: title, logo, sidebar, layout variants
- [Dashboard home page](/java-user-manual/build/dashboard-home-page/) — KPI cards, charts, and activity feeds on the landing page
- [Navigation and menus](/java-user-manual/build/navigation-and-menus/) — how menus, routes, and sub-menus are declared

### Domain and data

- [Domain models](/java-user-manual/build/domain-models/) — how ViewModels relate to your backend architecture
- [Identifiable, Named, and Searchable](/java-user-manual/build/entity-interfaces/) — the marker interfaces entities must implement to work with the CRUD machinery
- [Foreign keys and options](/java-user-manual/build/foreign-keys-and-options/) — `@Lookup`, options suppliers, and label resolution

### CRUD

- [CRUD navigation flow](/java-user-manual/build/crud-navigation-flow/) — the list → view → edit flow and how to customize it
- [AutoCrud&lt;T&gt;](/java-user-manual/build/auto-orchestrators/) — the simplest way to get a CRUD or read-only listing, with capability annotations
- [Customising AutoCrud behaviour](/java-user-manual/build/auto-adapters/) — override `fetchRows`, `buildNamedView`, or `buildCreationForm` for custom search, pre-populated forms, and more
- [CrudAdapter](/java-user-manual/build/crud-adapter/) — the interface for a fully custom data layer
- [CrudEditorForm and CrudCreationForm](/java-user-manual/build/crud-forms/) — the contracts for edit and create forms in a `Crud`
- [AutoNamedView](/java-user-manual/build/named-view/) — the concrete wrapper used internally by auto orchestrators as view, editor, and creation form
- [AutoNamedView as generic parameter](/java-user-manual/build/simple-view/) — how FilteredAutoCrud wires AutoNamedView into the Crud type signature
- [CrudRepository](/java-ui-definition/interfaces/crud-repository/) — the repository contract consumed by the auto adapters, with Spring Data JPA integration
- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — visibility, layout, actions, and capability annotations
- [Filtered orchestrators](/java-user-manual/build/filtered-orchestrators/) — add a dedicated filter model without leaving the auto variants
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — explicit models for filters, rows, views, editors, and creation forms
- [EditableView](/java-user-manual/build/editable-view/) — single-entity view with an Edit button, no list
- [MultiView](/java-user-manual/build/view-orchestrator/) — the root base class that handles routing and screen wrapping for all orchestrators
- [Listing&lt;Filters, Row&gt;](/java-user-manual/build/listing/) — standalone filterable listing with toolbar actions, export, and selector support

### Composition

- [Relationships vs embedded CRUDs](/java-user-manual/build/relationships-vs-embedded-cruds/) — when to use `@Lookup`, `List<Entity>`, or an embedded orchestrator
- [Master-detail](/java-user-manual/build/master-detail/) — embedding a child CRUD inside a parent screen
- [Golden example: Orders, Customers and Order lines](/java-user-manual/build/orders-customers-order-lines/) — a complete business UI combining all of the above
