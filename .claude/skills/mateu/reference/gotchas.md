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
  from any field/method/class Mateu annotation, but **not** from `@UI`/`@Route`/
  `@HomeRoute`/`@Routes` (resolved at compile time by the annotation processor).

- **`ComponentAdapter.deserialize` must guard every assignment** with
  `state.containsKey(...)` — it also builds the initial instance from an *empty* state, so
  unguarded reads wipe the model's field initializers.

- **`@Stereotype(FieldStereotype.money)` formats in read-only / `@PlainText` contexts.**
  For an editable money field you still get a numeric input; the currency formatting shows
  in plain-text/read-only rendering (`Amount`-typed fields format automatically).

- **Labels accept `${state.field}` / `${data.field}`** in titles, sections, tabs, columns,
  buttons, banners, KPIs — use it instead of concatenating strings in code where possible.

- **Never degrade structured data to a `String`.** Search results, listings and any tabular
  data go in a `List<Pojo>` field with `@Stereotype(FieldStereotype.grid)` — not concatenated
  into a `@ReadOnly String`. If the user must pick a row, add `@OnRowSelected("method")`.

- **Never model an editable collection as delimited text.** "One name per line" / `"a; b"`
  string fields are a smell: use `@InlineEditing` + `@Stereotype(FieldStereotype.grid)` on a
  `List<MutablePojo>` (no-args constructor + accessors) so the user adds/removes rows.

- **Selects whose options come from data use `@Lookup`, not free text.** Declare
  `@Lookup(search = MyOptionsSupplier.class, label = MyLabelSupplier.class)`; suppliers are
  beans implementing `LookupOptionsSupplier` / `LookupLabelSupplier`. Enums alone may use
  `@Stereotype(FieldStereotype.combobox)`.

- **Actions that mutate fields must return `new State(this)`.** Mutating a ViewModel field
  and returning only a `Message` does **not** refresh the client — return
  `List.of(new Message("…"), new State(this))`. Same applies to `@OnRowSelected` handlers.

- **Form ViewModels with mutable fields need `@Scope("prototype")`.** A singleton bean
  would share the form state across users/requests.

- **When porting an existing UI, keep functional parity.** Before simplifying a feature away
  ("iteration 1 without X"), check the pattern catalog (`ux-patterns/`) — grids in forms,
  row selection, inline editing, lookups, conditional fields (`@Hidden("!state.flag")`) and
  partial forms cover almost every case the source UI had.

- **Display-only grids need `@ReadOnly` on the `List` field.** A `@Stereotype(grid)` list is
  **editable and reorderable by default** (add/edit/reorder affordances). Search results and
  any read-only table must carry `@ReadOnly`; `@OnRowSelected` still works on read-only grids.

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

- **Mark THE primary action.** `@Button(buttonStyle = ButtonStyle.primary)` renders the
  screen's main action (Sell, Save, Confirm) as a filled primary button; leaving every button
  tertiary buries the action hierarchy. One primary per screen.

- **Group listing rows with `@GroupBy`, don't denormalise the parent into columns.** Rows that
  belong to a parent (reservations per file, lines per order) get `@GroupBy` on ONE row field
  (put the parent's context in its value — "id · agency · guests"); the grid renders bold
  subtotal header rows with the count, and `@Aggregate` adds totals. Rows must arrive
  contiguous per group. Custom `Listing`s get the group summaries synthesized automatically.
  Actions on the whole parent (cancel the file, close the order) go on a
  `@GroupAction("label")` listing method — it renders as a button on the group header row and
  receives the group value in the `_groupValue` action parameter.

- **Keep listings lean: the `auto` grid layout degrades by width.** Too many columns for the
  available width flips the listing to a master-detail rail. If that is not what you want,
  consolidate redundant columns (e.g. via the `@GroupBy` label) instead of stacking ten.

- **Action results and standing warnings are `@Notice`, not `@ReadOnly String`.** `@Notice`
  renders an inline banner, auto-hides while the value is blank, and takes a theme
  (info/success/warning/danger). A read-only text field for "resultado" looks like a broken
  input.

- **Button placement:** `@Button` methods land at the **form footer**, `@Toolbar` methods in
  the **page toolbar** (top). A button next to / inside a specific section requires the
  partial-forms pattern: the section content is a nested type and the action lives on it
  (`@Toolbar` → section title row, `@Button` → below the section fields).
