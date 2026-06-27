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
