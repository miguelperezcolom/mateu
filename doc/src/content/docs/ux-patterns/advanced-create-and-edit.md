---
title: Advanced create & edit
description: The Redwood single-page transactional template for a complex object — a sectioned form with a canonical header (save/cancel, timestamp, contextual facts, peer navigation) and either an anchor navigator or a contextual detail slot.
---

The Redwood **Advanced Create & Edit** template is the single-page transactional form for a *complex*
object: many fields grouped into sections, a canonical header with the save/cancel affordances and
the object's context, and one lateral aid — either a **section index** to jump around a long form,
or a **detail slot** with supporting information. It is the heavier sibling of the
[simple create & edit](/ux-patterns/create-and-edit/) (`AutoCrud`'s generated `/new`—`/{id}/edit` forms).

Mateu doesn't ship a dedicated archetype for it, because by now every region is a piece you already
have — it is **composition**, the same slot grammar the archetypes are written in.

## The anatomy, region by region

| Redwood region | Mateu piece |
|---|---|
| Page header — title, **cancel** (left) + **save/primary** (right) | `@Title` + `@Button`/`@Toolbar` (the header places cancel/back left, actions right) |
| Header — **last updated** timestamp | [`@Timestamp("Last updated")`](/reference/key-annotations/) on a field |
| Header — **contextual facts** ("at a glance") | [`@KPI`](/reference/key-annotations/) label/value fields |
| Header — **next / previous object** | [`PeerNavigationSupplier`](/ux-patterns/page-templates/#peer-navigation) → prev/next arrows |
| **Main** slot — the sectioned form | `@Section` (and `@Zones`/tabs) fields |
| **Anchor navigator** — sticky section index | [`@Toc`](/ux-patterns/sections-index/) |
| **Detail slot** — a contextual side panel | [`@Aside`](/ux-patterns/layout-inference/#aside--a-content-page-from-a-plain-form) → a `ContentLayout` aside |
| Save — validation, optimistic locking, dirty guard | bean-validation annotations, `@Version`, `@ConfirmOnNavigationIfDirty` (automatic on CRUD) |

**The rule from Redwood holds:** the anchor navigator and the detail slot are *mutually exclusive* —
pick `@Toc` for a long form the user scrolls, or `@Aside` for a form with supporting context beside
it, not both.

## Variant A — long form with a section index (`@Toc`)

```java
@UI("/employee/{id}/edit")
public class EmployeeEdit {

  @KPI @Label("Department")   String department = "Engineering";   // contextual facts, header
  @KPI @Label("Status")       String status = "Active";
  @Timestamp("Last updated")  String updatedAt = "2026-07-26 09:12";

  @Section("Identity")     @NotEmpty String name;
  @Section("Identity")               String email;
  @Section("Employment")             String title;
  @Section("Employment")             LocalDate hiredOn;
  @Section("Compensation")           @Stereotype(FieldStereotype.money) BigDecimal salary;
  @Section("Notes")        @Stereotype(FieldStereotype.textarea) String notes;

  @Toolbar @Label("Cancel") URI cancel() { return URI.create("/employees"); }
  @Button  @Label("Save")   Message save() { /* persist */ return new Message("Saved"); }
}
```

`@Toc` pins a section index to the side and scroll-spies the active section; the header carries the
two `@KPI` facts and the timestamp; cancel sits left, Save right.

## Variant B — form with a contextual detail slot (`@Aside`)

```java
@UI("/order/{id}/edit")
public class OrderEdit {

  @Timestamp("Last updated") String updatedAt = "2026-07-26 09:12";

  @Section("Order")    @NotEmpty String reference;
  @Section("Order")              String customer;
  @Section("Shipping")           String address;
  @Section("Shipping")           String carrier;

  @Aside(width = "22rem")        // the detail slot: supporting info beside the form
  Markdown context = new Markdown("**SLA** 48h · **Priority** High\n\nLast contact 2 days ago.");

  @Toolbar @Label("Cancel") URI cancel() { return URI.create("/orders"); }
  @Button  @Label("Save")   Message save() { return new Message("Saved"); }
}
```

`@Aside` pulls the `context` panel out of the form body and composes a `ContentLayout` — the form is
the `main` region, the panel the `aside`. On narrow viewports the panel stacks under the form.

## When to use CRUD instead

If the object is an entity with a repository, `AutoCrud<T>` already gives you the save/cancel flow,
validation, optimistic locking (`@Version`) and the unsaved-changes guard for free — annotate the
entity's fields with `@Section`/`@Toc`/`@KPI`/`@Timestamp` and you get the advanced form on the
generated edit route. Use a plain `@UI` form (as above) when the transaction isn't a single-entity
persist.

## Redwood parameter and slot reference

What the Redwood `advanced-create-edit` template and its reusable `header-create-edit` expose, and
what Mateu gives you for them. The canonical page-header elements shared by every template are
documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| **Slot** `main` | the form body: `@Section` groups, zones, the fluent `FormField` | ✅ |
| **Slot** `detail` (contextual side panel) | `@Aside` on a component-holder field → `ContentLayout` (`position`/`width`/`sticky`) | ✅ |
| **Slot** `innerEnd` | — a second docked region is not available | — |
| **Slot** `search` | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 |
| Section index | `@Toc` — the sticky section index; a Mateu addition with no Redwood prop | ✅ |
| `badge` | `@BadgeInHeader` | ✅ |
| `timestamp` | `@Timestamp("Last updated")` | ✅ |
| `contextualInfo` key/value facts | `@KPI` fields | ✅ |
| `displayOptions {save, saveAndClose, next: on \| off \| unconfigured, bottomActions}` | `AutoCrud` gates and label overrides cover save/cancel; there is no single tri-state options bag, and `saveAndClose`/`next` are not built | 🟡 |
| `displayOptions.contextualInfoSticky` | `@Aside(sticky = …)` for the side panel; the header facts are not stickyable | 🟡 |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| `endOpened: inner \| none` | — the aside is always shown when declared | — |
| `pageTitlePlaceholder` (title placeholder in create mode, e.g. "New booking…") | `@TitlePlaceholder("New booking…")`, or `TitlePlaceholderSupplier`; it stands in only while there is no title | ✅ |
| `displayOptions {versionHistory, undo, redo}` + `spVersionHistory`/`spUndo`/`spRedo` | ⚪ page-level version history and undo/redo are Fusion Apps concerns, out of scope by decision (the [Undo](/ux-patterns/undo/) pattern covers action-level undo) | ⚪ |
| `feedback {customFeedback[], acknowledgmentMessage, pageVersion}` + `openFeedback` | ⚪ the embedded survey is out of scope by decision | ⚪ |

Unsaved-changes handling — the dirty guard and, on `AutoCrud`, optimistic locking via `@Version` —
is covered by the framework rather than by a template prop.

## Parity

Everything here is composition of pieces that render on every renderer and have .NET/Python parity —
`[Timestamp]`/`[Section]` and `Timestamp()`/`Section()`, `[Aside]`/`Aside()`, the peer-navigation
supplier, and the bean-validation attributes. See [choosing a page template](/ux-patterns/choosing-a-page-template/).
