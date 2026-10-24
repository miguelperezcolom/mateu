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

![An advanced create & edit page on Redwood: the transactional header with Cancel and Save, sections down the page and the section index on the right](/images/docs/redwood-templates/advanced-create-edit-1.png)

## When to use it

Reach for it when the user creates or changes **one object that has a lot to say about itself** —
dozens of attributes that only make sense once grouped, sometimes at more than one level — and the
whole job fits on a single page that ends with *Save* or *Cancel*. Typical cases: setting up a new
area of responsibility with its basic details, scope and attachments; editing the properties and
display settings of a process.

Pick something else when:

- the object is small (a handful of fields) — the [simple create & edit](/ux-patterns/create-and-edit/)
  form, or a [create-and-edit drawer](/ux-patterns/drawer/#crud-editing-in-a-drawer-editindrawer)
  over the listing;
- the job is a sequence of decisions rather than one form — a [guided process](/ux-patterns/wizard/)
  (`Wizard` + `@WizardProgress(RAIL)`);
- the user mostly *reads* the record — a [general overview](/ux-patterns/general-overview/) or an
  [item overview](/ux-patterns/item-overview/).

## Anatomy

| # | Region | What it holds | Mateu piece |
|---|---|---|---|
| 1 | **Page information and actions** (header) | title, subtitle, badge, contextual facts, timestamp, **Cancel** and the **primary action**, secondary actions | `@Title` / `@Subtitle` / `@TitlePlaceholder`, `@BadgeInHeader`, `@KPI`, `@Timestamp`, `@Toolbar` methods (a `cancel…` one + the primary) |
| 2 | **Main slot** | the transactional content: the sectioned form | `@Section` fields (and `@Zones`, tabs, `@Inline` sub-forms) |
| 3 | **Vertical anchor navigator** | a sticky list of the section titles that scrolls to each one; part of the main slot | [`@Toc`](/ux-patterns/sections-index/) |
| 4 | **Detail slot** | contextual information that helps finish the task | [`@Aside`](/ux-patterns/layout-inference/#aside--a-content-page-from-a-plain-form) on a component-holder field → a `ContentLayout` aside |

**The rule from Redwood holds:** the anchor navigator and the detail slot are *mutually exclusive* —
pick `@Toc` for a long form the user scrolls, or `@Aside` for a form with supporting context beside
it, not both. Mateu does not enforce it yet (see [Known gaps](#known-gaps)).

Each `@Section` is a Redwood **section**: its title carries the accent marker and the section can
offer its own affordances — one primary action (`@Section(editAction = …)`, else `addAction`) and a
*View more* link (`viewMoreAction`).

![The transactional header: title, badge, contextual facts and timestamp, with Cancel and Save on the right](/images/docs/redwood-templates/advanced-create-edit-2.png)

## Responsive behaviour

- **Large and extra-large widths** — the section index sits in a column on the right, pinned under
  the header; the form takes the rest of the width. An `@Aside` panel sits on its side (`end` by
  default) and stays pinned while the form scrolls (`@Aside(sticky = true)`, the default).
- **Small and medium widths** — the form takes the whole width. The index collapses into a
  **Sections** menu button that opens the list of section titles in a popup; picking one scrolls
  there. An `@Aside` panel stacks under the form.
- Sections honour their declared `columns`; a multi-column section reflows to one column on narrow
  screens.

![The same page at phone width: the index has become a Sections button](/images/docs/redwood-templates/advanced-create-edit-3.png)

## What you can configure

**Legend:** ✅ the Redwood renderer paints it · 🟡 partly / differently · ❌ not painted on Redwood
(other renderers may still show it) · — no Mateu piece.

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Page title | `@Title`, `TitleSupplier` | ✅ | |
| Title while it is still empty (create mode) | `@TitlePlaceholder("New booking…")` / `TitlePlaceholderSupplier` | ✅ | shown only while there is no title |
| Subtitle | `@Subtitle`, `SubtitleSupplier` | ✅ | |
| Avatar / initials / photo | `@Avatar` field / `AvatarSupplier` | ❌ | travels on the wire; the Redwood header does not draw it yet |
| Contextual information (up to 4) | `@KPI` fields (or the facts of a leading `EntityHeader`) | ✅ | stays visible when the header sticks; Redwood shows at most four |
| Parent link | the breadcrumb parent | 🟡 | the create-edit header hides it; Cancel is the way back |
| Next object (lateral navigation) | `PeerNavigationSupplier` → `PeerNav` | ❌ | shown on overview headers, not on the create-edit one |
| Save (save and stay) | — | — | the primary action saves; there is no separate "save and stay" |
| **Cancel** (required) | a `@Toolbar` method whose action id is `cancel` (or the CRUD's `cancel-edit` / `cancel-new`) | ✅ | the label is Redwood's own, in the UI language |
| **Primary action** (required) | the toolbar's primary button — the last non-cancel `@Toolbar` method, or the one styled as call-to-action | ✅ | |
| Secondary actions (up to 10, a menu from 2) | the other `@Toolbar` methods | ✅ | |
| Badge | `@BadgeInHeader` / `HeaderBadgesSupplier` | ✅ | the first badge; the rest follow the subtitle |
| Timestamp | `@Timestamp("Last updated")` | ✅ | a date value uses Redwood's timestamp; free text ends the subtitle line |
| Section index | `@Toc` (auto from five titled sections) | ✅ | |
| Detail slot | `@Aside(position, width, sticky)` | ✅ | |
| Section primary action / View more | `@Section(editAction \| addAction, viewMoreAction)` | ✅ | with both edit and add, add stays a plain title button |
| Page layout (fixed width only) | default for form pages; `@PageWidth` can override | 🟡 | an override to full width is not corrected |
| Display mode (header tone) | — | — | Redwood's light default |
| Density | `@Compact` | ✅ | |
| Validation, unsaved-changes guard, optimistic locking | bean validation, `@ConfirmOnNavigationIfDirty` (automatic on CRUD), `@Version` | ✅ | framework behaviour, not template props |

![A section with its own Edit action and a View more link](/images/docs/redwood-templates/advanced-create-edit-4.png)

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Put **both** Cancel and the primary action in the page toolbar (`@Toolbar`). That is what tells the
renderer the page is transactional: on Redwood a toolbar with a `cancel…` action beside a primary one
gets the create-edit header; a save button left in the form body (`@Button`) does not.

### Variant A — long form with a section index (`@Toc`)

```java
@UI("/employee/{id}/edit")
@Title("Edit employee")
@Toc
public class EmployeeEdit {

  @KPI @Label("Department")   String department = "Engineering";   // contextual facts, header
  @KPI @Label("Status")       String status = "Active";
  @BadgeInHeader(label = "Active", color = "success") boolean active = true;
  @Timestamp("Last updated")  String updatedAt = "2026-07-26 09:12";

  @Section("Identity")     @NotEmpty String name;
  @Section("Identity")               String email;
  @Section(value = "Employment", editAction = "editEmployment") String title;
  @Section(value = "Employment", editAction = "editEmployment") LocalDate hiredOn;
  @Section("Compensation")           @Stereotype(FieldStereotype.money) BigDecimal salary;
  @Section("Notes")        @Stereotype(FieldStereotype.textarea) String notes;

  @Toolbar public URI cancel() { return URI.create("/employees"); }
  @Toolbar public Message save() { /* persist */ return new Message("Saved"); }

  public Message editEmployment() { return new Message("Employment history opens here"); }
}
```

`@Toc` pins the section index to the side and highlights the section in view; the header carries
the two `@KPI` facts, the badge and the timestamp; Cancel and Save are the header's own buttons. The
*Employment* section gets an **Edit** affordance on its title row.

### Variant B — form with a contextual detail slot (`@Aside`)

```java
@UI("/order/{id}/edit")
@Title("Edit order")
public class OrderEdit {

  @Timestamp("Last updated") String updatedAt = "2026-07-26 09:12";

  @Section("Order")    @NotEmpty String reference;
  @Section("Order")              String customer;
  @Section("Shipping")           String address;
  @Section("Shipping")           String carrier;

  @Aside(width = "22rem")        // the detail slot: supporting info beside the form
  Markdown context = new Markdown(
      "**SLA** 48h · **Priority** High\n\nLast contact 2 days ago.", null, null);

  @Toolbar public URI cancel() { return URI.create("/orders"); }
  @Toolbar public Message save() { return new Message("Saved"); }
}
```

`@Aside` pulls the `context` panel out of the form body and composes a `ContentLayout` — the form is
the `main` region, the panel the `aside`. On narrow viewports the panel stacks under the form.

![A form with a contextual detail panel beside it](/images/docs/redwood-templates/advanced-create-edit-5.png)

Both variants run in `demo-redwood-showcase` (port 8597) with the Redwood renderer:
`/advanced-create-edit-demo` (variant A) and `/advanced-create-edit-aside-demo` (variant B).

### When to use CRUD instead

If the object is an entity with a repository, `AutoCrud<T>` already gives you the save/cancel flow,
validation, optimistic locking (`@Version`) and the unsaved-changes guard for free — annotate the
entity's fields with `@Section`/`@KPI`/`@Timestamp` and you get the advanced form on the generated
edit route, with the create-edit header (five or more titled sections bring the section index on
their own). Use a plain `@UI` form
(as above) when the transaction isn't a single-entity persist.

## Redwood parameter and slot reference

What the Redwood `advanced-create-edit` template and its reusable `header-create-edit` expose, and
what Mateu gives you for them. The canonical page-header elements shared by every template are
documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| **Slot** `main` | the form body: `@Section` groups, zones, the fluent `FormField` | ✅ |
| **Slot** `detail` (contextual side panel) | `@Aside` on a component-holder field → `ContentLayout` (`position`/`width`/`sticky`) | ✅ |
| **Slot** `innerEnd` | — a second docked region is not available on a form; `DataManagement` has docked end/bottom panels (`DockedPanel`) | — |
| **Slot** `search` | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 |
| Section index | `@Toc` — the sticky section index (Redwood's vertical anchor navigator) | ✅ |
| `badge` | `@BadgeInHeader` | ✅ |
| `timestamp` | `@Timestamp("Last updated")` | ✅ |
| `contextualInfo` key/value facts | `@KPI` fields | ✅ |
| `avatar` | `@Avatar` / `AvatarSupplier` — on the wire, not yet drawn by the Redwood create-edit header | 🟡 |
| `previousItem` / `nextItem` | `PeerNavigationSupplier` — drawn on overview headers, not on the create-edit header | 🟡 |
| `displayOptions {save, saveAndClose, next: on \| off \| unconfigured, bottomActions}` | `AutoCrud` gates and label overrides cover save/cancel; the tri-state grammar exists (`Toggle` + `CrudDisplay`: create, delete, save-and-next in the edit drawer, error banner) but a create-edit PAGE has no `saveAndClose`/`next` | 🟡 |
| `displayOptions.contextualInfoSticky` | the facts stay visible when the header sticks; `@Aside(sticky = …)` for the side panel | ✅ |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| `endOpened: inner \| none` | — the aside is always shown when declared | — |
| `pageTitlePlaceholder` (title placeholder in create mode, e.g. "New booking…") | `@TitlePlaceholder("New booking…")`, or `TitlePlaceholderSupplier`; it stands in only while there is no title | ✅ |
| `section` → `primaryAction {type: edit \| add}`, `displayOptions.viewMore` | `@Section(editAction, addAction, viewMoreAction)` | ✅ |
| `displayOptions {versionHistory, undo, redo}` + `spVersionHistory`/`spUndo`/`spRedo` | ⚪ page-level version history and undo/redo are Fusion Apps concerns, out of scope by decision (the [Undo](/ux-patterns/undo/) pattern covers action-level undo) | ⚪ |
| `feedback {customFeedback[], acknowledgmentMessage, pageVersion}` + `openFeedback` | ⚪ the embedded survey is out of scope by decision | ⚪ |

Unsaved-changes handling — the dirty guard and, on `AutoCrud`, optimistic locking via `@Version` —
is covered by the framework rather than by a template prop.

On Redwood the page is **composed** from Spectra's own pieces: the header is
`oj-sp-header-create-edit`, every titled `@Section` is an `oj-sp-section`. The section index is the
one imitation: it reproduces the markup and behaviour of Spectra's vertical anchor navigator, because
that component wants to render the sections itself and cannot host sections the page has already
painted. The page is deliberately **not** wrapped in the `oj-sp-advanced-create-edit` container
(evaluated 2026-10-24): that container is exactly this header (`oj-sp-header-create-edit`) over two
padded slot wrappers, so it would add nothing visible — while wrapping the shared content and form
areas of every edit page in a second copy of their markup (VB has no conditional wrapper) and
re-pinning the sticky header and the index to another element.

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| Long form + `@Toc` index | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `@Aside` detail slot | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Header (badge, timestamp, facts, title placeholder) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Header avatar and next-object arrow | ✅ | | | | ❌ | | |

(Blank = not re-checked for this page.)
| `@Section` edit / add / view-more affordances | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Parity

Everything here is composition of pieces that render on every renderer and have .NET/Python parity —
`[Timestamp]`/`[Section]` and `Timestamp()`/`Section()`, `[Aside]`/`Aside()`, the peer-navigation
supplier, and the bean-validation attributes. See [choosing a page template](/ux-patterns/choosing-a-page-template/).

## Known gaps

On the Redwood renderer (details and code references in [advanced-create-edit review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/advanced-create-edit.md)
in the repository):

- the header does not draw the **avatar** nor the **next object** arrow, and hides the **parent link**;
- a section that declares both `editAction` and `addAction` gets only one of them as the section's own
  action — the other is a plain button;
- the page is composed from Spectra pieces rather than wrapped in the `oj-sp-advanced-create-edit`
  container — a decision, not a pending item (see above).
