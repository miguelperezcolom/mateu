# Mateu gotchas & common mistakes

Read this before generating; each line is a trap and its fix.

- **Navigation has no type.** To navigate, return `URI.create("/path")` or **return the
  target Java object** (it opens as a view). `new State(this)` updates without navigating.
  There is no `Navigation` class.

- **Required fields need validation.** Without `@NotNull` / `@NotEmpty` Mateu will *not*
  block the user — add Bean Validation to anything mandatory.

- **CRUD entity must `implement Identifiable`** (`String id()`), and `save` must **return
  the id** (generate a UUID when null/blank), or new rows won't persist correctly.

- **`@Section(zone="…")` only works with `@Zones(...)` on the class.** Without `@Zones`
  the `zone` attribute is silently ignored.

- **`@Badge` ≠ `@BadgeInHeader`.** `@Badge` is a coloured chip **inside the form body**
  (shorthand for `@Stereotype(FieldStereotype.badge)`); `@BadgeInHeader` is the status
  chip in the **page header strip**, and goes on a field (not a method).

- **Wizard shape:** each step **field type implements `WizardStep`**; the
  **penultimate** step shows the `@WizardCompletionAction` button; the **last** step is
  the read-only result (`@PlainText`), auto-instantiated if left null.

- **Don't split one tab strip with per-tab `@Section`.** Tabs are grouped by consecutive
  fields sharing the same `@Tab` name *within a section*; a `@Section` per tab breaks them
  into separate one-tab strips. Use one strip = no per-tab `@Section`.

- **`@Inline` + actions placement:** on an inlined nested type, `@Toolbar` buttons land on
  the section title row, `@Button` buttons below the section content. The nested class
  must carry its own class-level annotations (`@PlainText`, `@Compact`) — they are not
  inherited from the parent.

- **Routing annotations are not composable.** You can build composed/semantic annotations
  from any field/method/class Mateu annotation, but **not** from `@UI`
  (resolved at compile time by the annotation processor). `@Route`/`@Routes`/`@HomeRoute` no
  longer exist — inner routes go in `specs/ui/routes.yaml`; never generate them.

- **`ComponentAdapter.deserialize` must guard every assignment** with
  `state.containsKey(...)` — it also builds the initial instance from an *empty* state, so
  unguarded reads wipe the model's field initializers.

- **`@Stereotype(FieldStereotype.money)` formats in read-only / `@PlainText` contexts.**
  For an editable money field you still get a numeric input; the formatting (thousands
  separator + 2 decimals in the UI's locale) shows in plain-text/read-only rendering
  (`Amount`-typed fields carry their own currency/locale and format automatically).

- **Labels accept `${state.field}` / `${data.field}`** in titles, sections, tabs, columns,
  buttons, banners, KPIs — use it instead of concatenating strings in code where possible.

- **Never degrade structured data to a `String`.** Search results, listings and any tabular
  data go in a `List<Pojo>` field with `@Stereotype(FieldStereotype.grid)` — not concatenated
  into a `@ReadOnly String`. If the user must pick a row, add `@OnRowSelected("method")`.

- **Never model an editable collection as delimited text.** "One name per line" / `"a; b"`
  string fields are a smell: use `@InlineEditing` + `@Stereotype(FieldStereotype.grid)` on a
  `List<MutablePojo>` (no-args constructor + accessors) so the user adds/removes rows.

- **Selects whose options come from data use `@Lookup`, not free text.** Declare
  `@Lookup(search = MyOptionsSupplier.class, label = MyLabelSupplier.class)`; suppliers
  implement `LookupOptionsSupplier` / `LookupLabelSupplier`. Enums need nothing: they render as a
  select (radio buttons when ≤ 4 constants under `@AutoLayout`), labels humanized from the
  constant name (`CHECK_OUT` → "Check out"; `@Label` on a constant overrides).

- **Actions that mutate fields must return `new State(this)`.** Mutating a ViewModel field
  and returning only a `Message` does **not** refresh the client — return
  `List.of(new Message("…"), new State(this))`. Same applies to `@OnRowSelected` handlers.

- **Don't make a view model a bean.** A `@UI` class is instantiated fresh on every request
  (its `@Autowired`/`@Inject` fields are still injected). If you do register it as a bean
  (`@Component`/`@Service`, e.g. for constructor injection) it MUST be `@Scope("prototype")` —
  a singleton shares form state across users. Shared data goes in a store/service (or a
  `static` field in a demo), never in an instance field you expect to survive the request.

- **When porting an existing UI, keep functional parity.** Before simplifying a feature away
  ("iteration 1 without X"), check the pattern catalog (`ux-patterns/`) — grids in forms,
  row selection, inline editing, lookups, conditional fields (`@Hidden("!state.flag")`) and
  partial forms cover almost every case the source UI had.

- **Display-only grids need `@ReadOnly` on the `List` field — inside a form.** A
  `@Stereotype(grid)` list is **editable and reorderable by default**. In a form that has other
  editable fields, add `@ReadOnly` to the list for search results / read-only tables;
  `@OnRowSelected` still works on read-only grids. Caveat: when EVERY field of the view is
  read-only, the whole view renders in read-only mode and a `@ReadOnly` list degrades to plain
  text — a page that only shows rows should be a `Listing<Row>` instead.

- **Full-page form views need `@Style(StyleConstants.CONTAINER)`.** Without it the form spans
  100% of the viewport and wide screens become unusable. Add `@Section(columns = n)` to pack
  short fields (dates, numbers) instead of the default sparse two-column layout.

- **In multi-column sections, mind `@Colspan`.** Intrinsically wide fields (grid, textarea,
  richText, html, markdown) auto-span the full row — no annotation needed; an explicit
  `@Colspan(n)` overrides that. Everything else defaults to ONE cell: long text inputs
  (descriptions, special requests…) squeezed into one column of four need `@Colspan` to
  breathe. Plan each section as rows of n cells. For free-form text, prefer
  `@Stereotype(FieldStereotype.textarea)` over a colspan'd single-line input — it says what
  the field is AND gets the full row for free.

- **An `actionId` set on a component needs an action method on the view.** A board's
  `moveActionId`, a tile's or button's `actionId`, a map's `markerActionId`… only work when the
  view has a method of that name the server accepts as an action — mark it `@Action` (a
  package-private unmarked method is neither advertised nor runnable: the click does nothing).
  Strict action mode is the default: a method no annotation marks and no declaration names is
  not reachable from the browser — calling it answers 403 and logs "Refused action 'x' … mark it
  @Action". `public` alone is not enough.
- **Mark THE primary action.** `@Button(buttonStyle = ButtonStyle.primary)` renders the
  screen's main action (Sell, Save, Confirm) as a filled primary button; leaving every button
  tertiary buries the action hierarchy. One primary per screen.

- **Group listing rows with `@GroupBy`, don't denormalise the parent into columns.** Rows that
  belong to a parent (reservations per file, lines per order) get `@GroupBy` on ONE row field
  (put the parent's context in its value — "id · agency · guests"); the grid renders bold
  subtotal header rows with the count, and `@Aggregate` adds totals. Rows must arrive
  contiguous per group. Custom `Listing`s get the group summaries synthesized automatically.
  Actions on the whole parent (cancel the file, close the order) go on a
  `@GroupAction("label")` listing method — it renders right-aligned on the group header row
  (lined up with the child rows' action column) and receives the group value in the
  `_groupValue` action parameter. When the action does not always apply (an already-cancelled
  file), implement `GroupActionVisibility` on the listing and veto it per group.

- **Listings are tables unless they say otherwise.** `gridLayout()` defaults to `auto`, which
  means a table regardless of width; return `GridLayout.cards`/`list`/`masterDetail`/`tree`
  explicitly when you want another layout. Keep columns lean (consolidate redundant ones, e.g.
  via the `@GroupBy` label) instead of stacking ten.

- **Action results and standing warnings are `@Notice`, not `@ReadOnly String`.** `@Notice`
  renders an inline banner, auto-hides while the value is blank, and takes a theme
  (info/success/warning/danger). A read-only text field for "resultado" looks like a broken
  input.

- **Button placement:** `@Button` methods land at the **form footer**, `@Toolbar` methods in
  the **page toolbar** (top). A button next to / inside a specific section requires the
  partial-forms pattern: the section content is a nested type and the action lives on it
  (`@Toolbar` → section title row, `@Button` → below the section fields).

- **Imports: one type per import.** Wildcards of `io.mateu.uidl.annotations.*` together with
  `io.mateu.uidl.data.*` (or `interfaces.*`, `fluent.*`) fail with "reference is ambiguous"
  (`Menu`, `Button`, `Text`, `Badge`, `Notice`, `Listing`, `Searchable`, `List`, `Map`…). Import
  `java.util.List`/`java.util.Map` by name.

- **Archetype base classes are in `mateu-core`.** `AutoCrud`, `Wizard`/`WizardStep`, `Dashboard`,
  `Foldout`, `HeroSearch`, `ItemOverview`, `Welcome`, `AutoEditableView`… live in
  `io.mateu.core.infra.declarative.orchestrators.*`; a UI module with only `mateu-uidl` can use
  annotations, interfaces (`Listing`, `CrudStore`…) and fluent records, but needs `mateu-core`
  to extend an archetype.
