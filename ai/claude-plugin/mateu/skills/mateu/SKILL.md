---
name: mateu
description: Build Mateu UI screens in JAVA — declarative @UI classes and fluent component trees that Mateu renders as a web (or native) UI. Use when creating or editing Java CRUD screens, forms, listings, wizards, editor/master-detail views, dashboards, app shells or federated UIs with Mateu (io.mateu). Triggers on @UI, AutoCrud, CrudStore, Listing, Wizard, Dashboard, ComponentTreeSupplier, @Menu. For YAML/data authoring use mateu-yaml; for C# use mateu-dotnet; for Python use mateu-python.
---

# Building UI with Mateu (Java)

Mateu turns an **annotated Java class into a full screen**. The class is the view model:
**fields are state, methods are actions, annotations express intent**. The server is
stateless; a generic renderer paints the wire model it receives.

This skill is the **Java** path. The same model can be authored as data (YAML under
`specs/ui/` → skill **mateu-yaml**), in C# (**mateu-dotnet**) or Python (**mateu-python**);
build wiring is **mateu-scaffold**, running/screenshotting **mateu-run**.

## The one rule

Prefer **declarative** (annotations on a plain class). Drop to **fluent** (build a component
tree in code) only for a custom or data-dependent layout.

**Never write** HTML, CSS frameworks, JavaScript, REST controllers or transport DTOs —
Mateu generates all of that from the model. Validate with Bean Validation
(`@NotEmpty`, `@Email`, `@Min`, `@NotNull`, …), enforced client- and server-side.

## Pick the pattern

| You want | Use | Reference |
|---|---|---|
| list + create/edit/view/delete | `extends AutoCrud<T>` + `CrudStore<T>` | [crud.md](reference/crud.md) |
| a listing that may grow (search/filters/detail/edit/create/delete à la carte) | `implements Listing<Row>` + capability interfaces (`Searchable`, `Filterable<F>`, `Navigable`, `Editable`, `Creatable`, `Deletable`) | [crud.md](reference/crud.md) |
| a single form with an action | a class with fields + `@Button` | [form-actions.md](reference/form-actions.md) |
| a multi-step flow | `extends Wizard` + `WizardStep` fields | [wizard.md](reference/wizard.md) |
| a dashboard landing page | `extends Dashboard` (or just `MetricCard` fields — inferred) + `@Panel` | [dashboard.md](reference/dashboard.md) |
| a record page with fold-out panels | `extends Foldout` + overview field + `@Panel` | [foldout.md](reference/foldout.md) |
| a search-first landing page | `extends HeroSearch<Filters, Row>` | [hero-search.md](reference/hero-search.md) |
| a detail page with pinned key info + tabs | `extends ItemOverview` + key-info field + `@Panel` | [item-overview.md](reference/item-overview.md) |
| a welcome/landing page for a flow | `extends Welcome` + `Button` fields + `@Panel` | [welcome.md](reference/welcome.md) |
| "nothing here yet" / loading placeholders | `EmptyState` / `Skeleton` components | [empty-states.md](reference/empty-states.md) |
| edit CRUD rows in the listing grid | class-level `@InlineEditing` on `AutoCrud` | [crud.md](reference/crud.md) |
| read ⇄ edit on one entity | `extends AutoEditableView<T>` | [editor.md](reference/editor.md) |
| a custom / dynamic layout | `implements ComponentTreeSupplier` | [fluent.md](reference/fluent.md) |
| an app menu / shell / federation | `@UI("")` + `@Menu` / `RemoteMenu` | [federation.md](reference/federation.md) |
| render a domain object you can't annotate | `ComponentAdapter<T>` (a bean) | [extension.md](reference/extension.md) |
| a dense screen composing many sub-forms | `@Inline` + `@Compact` + `@Zones` | [inline-dense-screens.md](reference/inline-dense-screens.md) |
| panels that react to each other | `@Emits` / `@SubscribeTo` / `@OnRowSelected` | [component-communication.md](reference/component-communication.md) |
| one screen projected per persona | `@Audience({"Staff"})` + an `@AppContext` field named `audience` (UX aid, not security — combine with `@EyesOnly`) | https://mateu.io/ux-patterns/audience-projection/ |
| a schedule / timeline | `Gantt` + `GanttTask`, or `extends GanttPage` | https://mateu.io/ux-patterns/gantt/ |
| front-office widgets: work queue, context banner, folio, room picker, offer, add-ons, checklist, meter, N-of-M progress, process monitor | `TaskQueue`, `EntityHeader`, `Ledger`+`PaymentPicker`, `ResourceGrid`, `OfferCard`, `AddOnPicker`, `StatusList`, `Meter`, `TaskProgress`, `ProcessMonitor` (all `.builder()`) | [fluent.md](reference/fluent.md) |

Full annotation catalog: [annotations.md](reference/annotations.md) ·
Common mistakes: [gotchas.md](reference/gotchas.md) ·
**Pre-flight checklist (run before calling a view done): [view-checklist.md](reference/view-checklist.md)** ·
Testing: [testing.md](reference/testing.md) ·
Deployment topologies: [standalone-desktop.md](reference/standalone-desktop.md)

## Skeleton — a screen is a class

```java
@UI("/greeting")
public class Greeting {
    String name;                                       // editable field → state
    @ReadOnly String message = "Hi :)";                // shown, not editable
    @Button void greet() { message = "Hi, " + name; }  // method → action
}
```

Adding a `@Button`/`@Action` method flips a read-only view into a form — the presence of an
action is the switch.

## Effects — what an action returns

An action returns what to do next, never pixels:

```java
@Button Object save() {
    repo.save(this);
    return List.of(
        new Message("Saved"),       // toast
        new State(this)             // re-render the view with its new field values (no navigation)
    );
}
```

Return values: `void`/`null` (stay), `new Message("…")` / `Message.error("…")` (toast),
`new State(this)` (update without navigating), `URI.create("/path")` (navigate), **any Java
object** (open it as a view), `PageBanner`, `UICommand.…` (dispatch an event, close a modal…),
or a `List.of(...)` of several in one round trip. There is no `Navigation` type.

## Conventions for generated code

- **One screen = one class.** Put the row/entity as a nested `record` or `static class`.
- **View models are per request.** A `@UI` class is NOT a bean: Mateu instantiates it fresh on
  every request and still injects its `@Autowired`/`@Inject` fields. Don't annotate it
  `@Component`/`@Service`; if you must (e.g. constructor injection) it MUST be
  `@Scope("prototype")` — a singleton shares form state across users.
- **Actions are declared** (strict action mode is the default): a method runs from the browser
  only if it is marked (`@Action`, `@Button`, `@Toolbar`, `@WizardCompletionAction`…) or the view
  itself names it (a fluent `Button`'s `actionId`, a `MetricCard.actionId`, a trigger,
  `@OnRowSelected`, `@SubscribeTo`). When in doubt, put `@Action` on the handler.
- **Imports**: use single-type imports. `io.mateu.uidl.annotations` and `io.mateu.uidl.data`
  share names (`@Menu`/`Menu`, `@Button`/`Button`, `@Text`/`Text`, `@Badge`, `@Notice`, `@Tab`,
  `@Status`…), `Listing` is both `interfaces.Listing` (implement it) and `fluent.Listing` (a
  component), `Searchable`/`Filterable` are both annotations and interfaces, and
  `annotations.List` / `data.Map` clash with `java.util` — wildcard imports of two of these
  packages fail with "reference is ambiguous". Which package holds what: [imports.md](reference/imports.md).
- Full-page forms: `@Style(StyleConstants.CONTAINER)` (`io.mateu.uidl.StyleConstants`) so they
  don't stretch across wide screens; `@Section(columns = n)` to pack short fields.
- CRUD entities **implement `Identifiable`** (`String id()`); `save` returns the id (generate a
  UUID when null).
- Override the inferred control with `@Stereotype(FieldStereotype.textarea|email|password|money|…)`;
  `@Status`/`@StatusMapping` for coloured state badges; `@Lookup` for relations.
- Keep business logic **out** of the view model: call use cases / services. The class
  orchestrates UI; the domain stays clean.

## Where the classes live / dependencies

Single Spring Boot MVC app: `io.mateu:mateu-mvc` + a renderer (`io.mateu:mateu-vaadin` or
`mateu-redwood`), and `io.mateu:mateu-annotation-processor-mvc` in `<annotationProcessorPaths>`
(other runtimes swap the pair: `-webflux`, `-quarkus`, `-micronaut`, `-helidon-mp`). The
annotations/records live in `io.mateu:mateu-uidl`; the archetype base classes (`AutoCrud`,
`Wizard`, `Dashboard`, `Foldout`, `HeroSearch`, `ItemOverview`, `Welcome`, `AutoEditableView`…,
package `io.mateu.core.infra.declarative.orchestrators.*`) live in `io.mateu:mateu-core` (also
framework-neutral). A reusable UI module needs `mateu-uidl` (+ `mateu-core` if it extends an
archetype) and the indexer AP. Full poms: **mateu-scaffold**.

## Canonical references

Always-current sources: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md
(~2.5k tokens), https://mateu.io/mateu-ai-full.md, https://mateu.io/reference/key-annotations/,
https://mateu.io/reference/key-interfaces/, https://mateu.io/reference/java-imports/. Prefer them
if anything here looks out of date.
