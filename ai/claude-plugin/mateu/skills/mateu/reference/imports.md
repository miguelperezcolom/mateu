# Where things live (Java imports)

Use **single-type imports** — `io.mateu.uidl.annotations` and `io.mateu.uidl.data` share names, so
wildcard imports of both fail with "reference is ambiguous".

| Package | What | Examples |
|---|---|---|
| `io.mateu.uidl.annotations` | every annotation | `UI`, `Title`, `Menu`, `Button`, `Toolbar`, `Action`, `Section`, `Tab`, `Zones`, `ReadOnly`, `Hidden`, `Stereotype`, `Status`, `StatusMapping`, `Panel`, `Lookup`, `OnRowSelected`, `WizardCompletionAction`, `Filterable`, `Searchable` |
| `io.mateu.uidl.data` | effects, components and value types | `Message`, `State`, `UICommand`, `PageBanner`, `RouteLink`, `RemoteMenu`, `Button`, `Text`, `Markdown`, `Card`, `VerticalLayout`, `HorizontalLayout`, `MetricCard`, `MetricTrend`, `Chart`, `ChartData`, `ChartDataset`, `ChartType`, `StatusType`, `FieldStereotype`, `ButtonStyle`, `ListingData`, `Page`, `Pageable`, `SearchRequest`, `Option`, `Drawer`, `Dialog`, `EmptyState`, `Gantt`, `LongTask`, `Amount`, `MicroFrontend`, `Element` |
| `io.mateu.uidl.interfaces` | interfaces you implement | `Identifiable`, `CrudStore`, `HttpRequest`, `Listing`, `Searchable`, `Filterable`, `Navigable`, `Editable`, `Creatable`, `Deletable`, `ComponentTreeSupplier`, `HomeRouteSupplier`, `LookupOptionsSupplier`, `LookupLabelSupplier`, `ComponentAdapter` |
| `io.mateu.uidl.fluent` | the fluent component base and a few builders | `Component`, `GridLayout`, `Listing` (the component — not the interface) |
| `io.mateu.uidl` | constants | `StyleConstants` |
| `io.mateu.core.infra.declarative.orchestrators.*` (artifact `mateu-core`) | the archetype base classes | `crud.AutoCrud`, `crud.FilteredAutoCrud`, `wizard.Wizard`, `wizard.WizardStep`, `dashboard.Dashboard`, `welcome.Welcome`, `foldout.Foldout`, `herosearch.HeroSearch`, `itemoverview.ItemOverview`, `editableview.AutoEditableView` |

Same name in two packages — import the one you mean explicitly:

| Name | Annotation (`annotations`) | Type |
|---|---|---|
| `Button` | `@Button` on a method | `data.Button` — a button component / CTA field |
| `Menu` | `@Menu` on a field | `data.Menu` — a menu record |
| `Text`, `Badge`, `Notice`, `Tab`, `Status` | the field annotation | the fluent component |
| `Listing` | — | `interfaces.Listing` (implement it) vs `fluent.Listing` (a component) |
| `Searchable`, `Filterable` | `@Searchable` (lookup field picker), `@Filterable` (grid-field column) | the capability interfaces of a `Listing` |
| `Page` | — | `data.Page` (a result page for `ListingData`) vs `interfaces.Page` |
| `List`, `Map` | `annotations.List` | `data.Map` — clash with `java.util.List` / `java.util.Map` |
