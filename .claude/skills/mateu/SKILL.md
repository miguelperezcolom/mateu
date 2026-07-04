---
name: mateu
description: Build Mateu UI screens in Java — declarative @UI classes and fluent component trees that render as web UI. Use when creating or editing CRUD screens, forms, wizards, editor/master-detail views, dashboards, application shells, or federated microfrontends with Mateu (io.mateu). Triggers on @UI, AutoCrud, Wizard, ComponentTreeSupplier, CrudRepository.
---

# Building UI with Mateu

Mateu turns an **annotated Java class into a full web screen**. The class is the
view-model: **fields are state, methods are actions, annotations express intent**.
The server is stateless; a generic renderer paints the UIDL it receives.

## The one rule

Prefer **declarative** (annotations on a plain class). Drop to **fluent** (build a
component tree in code) only when you need a custom or data-dependent layout.

**Never write** HTML, CSS frameworks, JavaScript, REST controllers, or transport DTOs —
Mateu generates all of that from the model. Validate with Bean Validation
(`@NotEmpty`, `@Email`, `@Min`, `@NotNull`, …).

## Pick the pattern

| You want | Use | Reference |
|---|---|---|
| list + create/edit/view/delete | `extends AutoCrud<T>` + `CrudRepository<T>` | [crud.md](reference/crud.md) |
| a single form with an action | a class with fields + `@Button` | [form-actions.md](reference/form-actions.md) |
| a multi-step flow | `extends Wizard` + `WizardStep` | [wizard.md](reference/wizard.md) |
| a dashboard landing page | `extends Dashboard` + `MetricCard` fields + `@Panel` | [dashboard.md](reference/dashboard.md) |
| a record page with fold-out panels | `extends Foldout` + overview field + `@Panel` | [foldout.md](reference/foldout.md) |
| a search-first landing page | `extends HeroSearch<Filters, Row>` | [hero-search.md](reference/hero-search.md) |
| read ⇄ edit on one entity | `extends AutoEditableView<T>` | [editor.md](reference/editor.md) |
| a custom / dynamic layout | `implements ComponentTreeSupplier` | [fluent.md](reference/fluent.md) |
| an app menu / shell / federation | `@UI("")` + `@Menu` / `RemoteMenu` | [federation.md](reference/federation.md) |
| render a domain object you can't annotate | `ComponentAdapter<T>` (`@Service`) | [extension.md](reference/extension.md) |
| a dense screen composing many sub-forms | `@Inline` + `@Compact` + `@Zones` | [inline-dense-screens.md](reference/inline-dense-screens.md) |
| panels that react to each other | `@Emits` / `@SubscribeTo` / `@OnRowSelected` | [component-communication.md](reference/component-communication.md) |

Full annotation catalog: [annotations.md](reference/annotations.md) ·
Common mistakes: [gotchas.md](reference/gotchas.md) ·
Testing & local iteration: [testing.md](reference/testing.md) ·
Deployment (all-in-one / CDN / standalone desktop): [standalone-desktop.md](reference/standalone-desktop.md)

## Skeleton — a screen is a class

```java
@UI("/greeting")
public class Greeting {
    String name;                                       // editable field → state
    @ReadOnly String message = "Hi :)";                // shown, not editable
    @Button void greet() { message = "Hi, " + name; }  // method → action
}
```

Adding a `@Button`/`@Action` method flips a read-only view into a form — you don't
declare "this is a form" field by field; the presence of an action is the switch.

## Effects — what an action returns

An action returns what to do next, never pixels:

```java
@Button Object save() {
    repo.save(this);
    return List.of(
        new Message("Saved"),       // toast
        new State(this)             // re-hydrate the view (no navigation)
    );
}
```

Return values: `void`/`null` (stay), `new Message("…")` (toast), `new State(this)`
(update without navigating), `URI.create("/path")` (navigate to a route), **any Java
object** (open it as a view), or a `List.of(...)` of several in one round-trip. There
is no `Navigation` type — navigate with a `URI` or by returning the object.

## Conventions for generated code

- **One screen = one class.** Put the row/entity as an inner `record` or `static class`.
- CRUD entities **implement `Identifiable`** (`String id()`); `save` returns the id
  (generate a UUID when null).
- Override the inferred control with `@Stereotype(FieldStereotype.textarea|email|password|…)`.
- `@Status`/`@StatusMapping` for colored state badges, `@Filterable` for list filters,
  `@Lookup` for relations.
- Layout with `@Section`, `@Tabs`, `@Zones`, `@SplitLayout`; high density with `@Compact`.
- Keep business logic **out** of the view-model: call use cases / repositories. The
  class orchestrates UI; the domain stays clean (DDD/hexagonal friendly).

## Why this is good for AI codegen

Few tokens, deterministic output (given the model, the UI is determined), little
unreviewed code (annotations + types, not thousands of front-end lines), and it
compiles or it doesn't. Generate the model; let Mateu render.

## Dependency

For a single Spring Boot **MVC** app, one dependency is enough:

```xml
<dependency><groupId>io.mateu</groupId><artifactId>mvc</artifactId><version>LATEST</version></dependency>
```

Other stacks: `io.mateu:webflux`, `io.mateu:quarkus`, `io.mateu:micronaut`,
`io.mateu:helidon-mp`. To keep `@UI` classes in a **framework-agnostic** module,
depend only on `io.mateu:uidl` and run the indexer AP — see
[federation.md](reference/federation.md).

## Canonical references

This skill is self-contained, but the always-current sources of truth in this repo are
`doc/public/mateu-ai-compact.md` (~2.5k tokens), `doc/public/mateu-ai-full.md`, and the
docs under `doc/src/content/docs/` (`reference/key-annotations.md`,
`reference/key-interfaces.md`). Prefer them if anything here looks out of date.
