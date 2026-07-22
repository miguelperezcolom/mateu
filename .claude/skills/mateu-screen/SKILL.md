---
name: mateu-screen
description: Conversational scaffolder for a single Mateu screen — three business questions pick the template family, the family picks the starting archetype, and the class is generated in the right module. Use when the user wants a new screen, page, view, listing, form, wizard, dashboard or landing and hasn't named the archetype themselves. Triggers on new screen, nueva pantalla, add a page, create a view, scaffold a screen, "which archetype", "qué arquetipo".
---

# Scaffolding a Mateu screen from three questions

This skill automates "The Mateu Way" (doc/src/content/docs/the-mateu-way.md): **family →
starting archetype → refine only on disagreement**. Your job is to ask the *business*
questions, never the framework ones — the user should not need to know the catalog.

## Step 1 — Ask the three questions (only the unanswered ones)

Read the user's request first: any question it already answers is not asked again. For the
rest, use AskUserQuestion, in this order:

1. **¿Muestra muchos registros o uno?** — many → *Collection* · one → *Detail*
2. **¿El usuario cambia algo?** — in one shot → *Form* · across steps → *Process*
3. **¿Ninguna de las dos?** — watching numbers → *Dashboard* · it's the front door → *Landing*

Useful follow-ups (one each, only when the family needs it):
- Collection: "¿tabla que se edita, cola de trabajo, calendario, o lista con panel de detalle?"
  → `AutoCrud` / `TodoList` / `CalendarPage` / `CollectionDetail`
- Detail: "¿ficha con pestañas, con paneles laterales plegables, o con selector de registro
  arriba?" → `ItemOverview` / `Foldout` / `GeneralOverview`

## Step 2 — Family → starting class

| Family | Default | Siblings (only if the follow-up says so) |
|---|---|---|
| Collection | `AutoCrud<T>` | `Listing`, `SmartSearchPage`, `TodoList`, `CalendarPage`, `CollectionDetail`, `DataManagement` |
| Detail | `ItemOverview` | `Foldout`, `GeneralOverview`, read-only `Drawer` |
| Form | plain `@UI` class + `@AutoLayout` | — |
| Process | `Wizard` | `ImportWizard` (CSV/import flows) |
| Dashboard | `Dashboard` | `GanttPage` (time-phased work) |
| Landing | `Welcome` | `HeroSearch` (search-first landing) |

## Step 3 — Where the class goes

- Find the module that already holds `@UI` classes (`grep -rl "@UI(" --include=*.java`,
  prefer the module the user is working in). Put the new class beside its peers, same package
  conventions.
- **No Mateu module yet?** Stop and invoke the `mateu-scaffold` skill first — the build wiring
  (indexer + framework AP) is the part that fails silently.
- Pick an unused route (`grep -r '@UI("' | grep "/route"` to check collisions).

## Step 4 — Write the class from a reference, not from memory

Always open the matching demo class and mirror its structure — they compile against the current
API and the docs screenshots are generated from them:

| Archetype | Reference | Demo route |
|---|---|---|
| `AutoCrud` | `demo/demo-admin-panel/.../infra/in/ui/Products.java` | `/products` |
| `CollectionDetail` | `.../collectiondetail/HotelDirectory.java` | `/collection-detail-demo` |
| `TodoList` / `CalendarPage` / `SmartSearchPage` | idem | `/todo-list-demo` · `/calendar-demo` · `/smart-search-demo` |
| `ItemOverview` | `.../itemoverview/ProductOverview.java` | `/product-overview` |
| `Foldout` / `GeneralOverview` | `.../foldout/BookingFoldout.java` · `/general-overview-demo` | `/foldout-demo` |
| `Wizard` | `.../wizards/BranchingSignupWizard.java` | `/branching-wizard` |
| `Dashboard` | `.../dashboard/SalesDashboard.java` | `/dashboard-demo` |
| `Welcome` | `.../welcome/WelcomeDemo.java` | `/welcome-demo` |

Minimal seeds for the two families that need no reference:

```java
// Collection
@UI("/things")
public class Things extends AutoCrud<Thing> {}   // Thing implements Identifiable

// Form
@UI("/feedback")
@AutoLayout
public class Feedback {
  @NotEmpty String subject;
  @Stereotype(FieldStereotype.textarea) String details;

  @Button
  Message send() { /* call the use case */ return new Message("Thanks!"); }
}
```

For `AutoCrud`, implement `CrudStore<T>` (in-memory inline for a first version, or a Spring
`@Service` over the real repository) and return it from `store()` when the entity is not
self-stored.

## Step 5 — Refine (rung 2, only where the user disagrees)

Offer, don't pile on: `@Section`/`@Zones` (grouping/columns), `@Toc` (long pages),
`@Compact` (dense ops screens), `@PageWidth`, validation annotations, `@Lookup` for foreign
keys. Explicit always wins over inference.

## Step 6 — Verify

Build the UI module, then the app, then use the `mateu-run` skill to boot and screenshot the
new route. A screen is not delivered until it has rendered.
