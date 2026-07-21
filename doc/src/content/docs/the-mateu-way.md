---
title: "The Mateu Way"
description: "The golden path: every screen is one of six things. Pick the family, start from its archetype, refine only where you disagree."
---

Mateu has a large vocabulary — dozens of annotations, twenty-plus archetypes, some eighty UX
patterns. **You do not need to know it.** That vocabulary is a reference library, not a syllabus.
Building with Mateu is three moves:

1. **Pick the family.** Every screen is one of six things (a business question, not a framework one).
2. **Start from the family's archetype.** One class, nearly empty, gives you a working screen.
3. **Refine only where you disagree.** Explicit always wins; inference fills every gap you leave.

If you remember nothing else: *start at the top of the ladder, descend only on disagreement.*

## Every screen is one of six things

Mateu classifies every page into the six template families of the Redwood taxonomy — it even
stamps the family on the wire (`pageType`) so renderers can adapt. The same six families are your
entry point as a developer:

| Family | The user is… | Start from |
|---|---|---|
| **Collection** | finding things in a set — searching, listing, opening, editing | `AutoCrud<T>` |
| **Detail** | looking at *one* thing in depth | `ItemOverview` |
| **Form** | completing one task: some fields, one action | a plain `@UI` class |
| **Process** | moving through steps toward a result | `Wizard` |
| **Dashboard** | monitoring numbers to decide what needs attention | `Dashboard` |
| **Landing** | arriving — orientation and ways in | `Welcome` |

To pick, ask at most three questions, in order:

1. **Many records or one?** Many → *Collection*. One → *Detail*.
2. **Is the user changing something?** In one shot → *Form*. Across steps → *Process*.
3. **Neither?** Watching numbers → *Dashboard*. It's the front door → *Landing*.

## The six starting points

Each family has one blessed starting class. All of them work with an almost empty body — that is
the point: the first version of every screen should be minutes, not days.

### Collection — `AutoCrud<T>`

```java
@UI("/products")
public class Products extends AutoCrud<Product> {}
```

Searchable listing with smart-search filters, detail view, edit and creation forms, validation,
URL pagination. When the collection is not a plain table of editable records — a work queue, a
calendar, cards with a detail pane — the family has sibling archetypes (`TodoList`,
`CalendarPage`, `CollectionDetail`, `SmartSearchPage`); the
[decision guide](/ux-patterns/choosing-a-page-template/) picks among them in one table lookup.

### Detail — `ItemOverview`

```java
@UI("/products/360")
public class ProductOverview extends ItemOverview {
  // first component field  → sticky key-info panel (left)
  // @Panel("…") fields     → tabs (right)
}
```

Siblings for other detail shapes: `GeneralOverview` (record switcher on top), `Foldout`
(lateral fold-out panels), or a read-only `Drawer` when the detail should not leave the page.

### Form — a plain `@UI` class

```java
@UI("/feedback")
@AutoLayout
public class Feedback {

  @NotEmpty String subject;
  @Stereotype(FieldStereotype.textarea) String details;

  @Button
  Message send() {
    // call your use case
    return new Message("Thanks!");
  }
}
```

Fields become inputs, Bean Validation runs in the browser and on the server, `@AutoLayout` picks
the presentation (folds optionals away, radios for small enums…).

### Process — `Wizard`

```java
@UI("/onboarding")
public class Onboarding extends Wizard {
  IdentityStep identity;   // fields of each step class = the step's form
  PlanStep plan;           // penultimate step shows the @WizardCompletionAction
  ResultStep result;       // read-only result screen
}
```

Branching (`stepApplies`), progress styles (bar, steps, rail) and cross-step state are built in.

### Dashboard — `Dashboard`

```java
@UI("/ops")
public class OpsDashboard extends Dashboard {
  // consecutive MetricCard fields → KPI band
  // @Panel("…") component fields → titled tiles on a responsive grid
}
```

### Landing — `Welcome`

```java
@UI("")
public class Home extends Welcome {
  // Button fields          → CTAs in the hero
  // @Panel("…") components → highlight tiles below
}
```

## The ladder of control

The archetypes are not a cage — they are the top rung of a ladder. Each rung down trades
convention for control, **per screen**: one screen can live on rung 1 while the screen next to it
is hand-built on rung 3.

| Rung | You write | Use when |
|---|---|---|
| **1 — Archetype + inference** | a nearly-empty class; `@AutoLayout` decides presentation | the default. Start every screen here. |
| **2 — Explicit annotations** | `@Section`, `@Zones`, `@Tab`, `@Toc`, `@PageWidth`, `@Compact`… | you disagree with an inferred decision. Explicit always wins; inference steps aside. |
| **3 — Fluent components** | a component tree (`ComponentTreeSupplier`) | the screen's structure is yours, not derivable from a model. |
| **4 — `ComponentAdapter`** | a renderer for an arbitrary domain object | the object cannot carry Mateu annotations at all. |

Two properties make the ladder safe to rely on:

- **Descending is local.** Overriding one section's layout does not eject you from the archetype;
  rung 2 refinements live *inside* rung 1 screens.
- **You can always climb back.** Delete the explicit annotation and inference resumes. Nothing
  is generated, so nothing goes stale.

## The catalog is a library, not a syllabus

The [UX patterns catalog](/ux-patterns/) documents everything Mateu can express — smart search,
drawers, kanban, Gantt, optimistic locking, guided import… **Consult it; do not read it.** The
moment you need "a side panel that doesn't lose the page" or "totals under a grid", the pattern
page tells you the one annotation or archetype that does it. Until that moment, the six starting
points above are the whole framework.

The same applies to AI assistants: point them at the
[AI assistant reference](/ai-assistant-reference/) and ask for the screen in business terms — the
assistant's job is exactly the three moves of this page: family, archetype, refinements.

## Next

- [Choosing a page template](/ux-patterns/choosing-a-page-template/) — the fine-grained decision guide, family by family
- [Quickstart](/java-user-manual/start-here/quickstart/) — a running app in minutes
- [How Mateu works](/mateu-about/how-mateu-works/) — the mental model underneath
