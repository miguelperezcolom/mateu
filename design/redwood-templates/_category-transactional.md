# Transactional pages — category summary (for `page-templates.md`)

Draft, in Mateu's voice, of the Redwood category page «Choosing the right transactional page
template», to be folded into `doc/src/content/docs/ux-patterns/page-templates.md` (and the decision
guide `choosing-a-page-template.md`). Oracle's text and images are not reused.

---

## Transactional pages

A **transactional page** is where the user *changes* something: creates or updates a business
object, records a transaction, or moves a process forward. What sets these pages apart from overview
and landing pages is that they end in a commitment — *Save*, *Submit*, *Create*, *Finish* — and that
the object behind them can carry a lot of data, sometimes whole collections of records.

Redwood standardises six of them. In Mateu each one is an archetype or a composition you declare on
the backend; the page comes out with the template's anatomy.

| Template | Use it to… | Mateu piece | Redwood renderer |
|---|---|---|---|
| **Advanced create and edit** | create or edit one complex object with many grouped attributes, on one page | a sectioned form: `@Section` + the create-edit header (`@Toolbar` cancel + primary, `@KPI`, `@Timestamp`, `@BadgeInHeader`) + `@Toc` **or** `@Aside` — [Advanced create & edit](/ux-patterns/advanced-create-and-edit/) | ✅ composed from `oj-sp-header-create-edit` + `oj-sp-section`; the section index imitates the anchor navigator |
| **Data management** | work inside a large data collection as part of a transaction, with drawers for the details of a piece | `DataManagement` archetype (grid ⇄ Gantt, docked panels) — [Data management](/ux-patterns/data-management/) | see that page |
| **Gantt page** | adjust and follow a schedule, with a bottom panel and a side detail | `GanttPage` archetype — [Gantt](/ux-patterns/gantt/#gantt-page-template-ganttpage-archetype) | see that page |
| **Guided process** | split a complex, infrequent process (2–25 steps) into steps the user can leave and resume | `Wizard` + `@WizardProgress(RAIL)`, `Draftable`, `stepSkippable`, `stepApplies` — [Wizard](/ux-patterns/wizard/#the-redwood-guided-process) | ✅ `oj-sp-guided-process`; drafts/skip are Mateu buttons in the body |
| **Collection detail** | go through a list and read or act on the selected item beside it | `CollectionDetail<Row>` archetype — [Collection detail](/ux-patterns/collection-detail/) | 🟡 composed (cards + detail column), not the template component |
| **Create and edit drawer** | create or edit one or several related items without leaving the main task | `editInDrawer()` on a CRUD, or an action returning a `Drawer` — [Drawer](/ux-patterns/drawer/) | see that page |

### How to choose

Ask three questions, in this order:

1. **Is it one step or many?** A sequence of decisions, possibly over several sessions → **guided
   process**. (Two or three short steps → a guided process in a drawer.)
2. **Does the user stay on the main task?** If the edit is a side job on the page they are working on
   → **create and edit drawer**. If it deserves a page of its own →
3. **What is the page's main content?**
   - one object with many attributes → **advanced create and edit** (with `@Toc` for a long form,
     `@Aside` when supporting context helps);
   - a list the user works through, item by item → **collection detail**;
   - a large data set edited in place, with drawers for detail → **data management**;
   - a schedule → **Gantt page**.

### What they share

- **A transactional header**: the title, *Cancel* and one primary action are mandatory; optional are
  the subtitle, avatar, badge, up to four contextual facts, a timestamp, up to ten secondary actions,
  a parent link and next-object navigation. In Mateu the header comes from the page's `@Title`,
  `@Toolbar` methods and header annotations — see [Page templates](/ux-patterns/page-templates/).
  (Collection detail uses the overview header instead.)
- **The same supporting pieces**: banner and toast messages, dialogs, attachments and the
  unsaved-changes guard — in Mateu `@Banner`, `Message`, `Dialog`, file fields and
  `@ConfirmOnNavigationIfDirty` (automatic on CRUD editors).
- **Drawers that fit them**: a create-and-edit drawer and a general drawer can open from any of them;
  data management and the Gantt page also dock bottom drawers.
- **Fixed texts**: *Cancel*, *Save*, *Continue*, *Skip* are the design system's, not the developer's —
  on Redwood they come from Redwood itself, in the UI's language.
- **Page width per template**: advanced create and edit is fixed-width; data management full width or
  edge to edge; the Gantt page and the guided process edge to edge; collection detail any of the three.
  Mateu infers the width from the page type unless `@PageWidth` says otherwise — for the guided
  process declare `@PageWidth(EDGE_TO_EDGE)` (the default is still fixed; see
  `design/redwood-templates/guided-process.md`).
