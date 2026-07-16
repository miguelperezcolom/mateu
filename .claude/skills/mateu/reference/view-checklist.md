# Pre-flight checklist for a declarative view

Run through this list BEFORE considering a Mateu view done. Every line exists because
skipping it produced a real defect in a generated UI; "it compiles" catches none of them.

1. **Scope** — any mutable field? → `@Scope("prototype")`. A singleton shares form state
   across users.
2. **Width** — full-page view? → `@Style(StyleConstants.CONTAINER)`. Without it the form
   spans 100% of the viewport.
3. **Sections & density** — group fields with `@Section(value, columns = n)` and plan each
   section as **rows of n cells**: wide fields (grid, textarea, richText, html, markdown)
   auto-span the full row; long text inputs need an explicit `@Colspan(n)`.
4. **Grids** — display-only → add `@ReadOnly` (grids are editable and reorderable by
   default); user-edited rows → `@InlineEditing` on a `List<MutablePojo>` (no-args
   constructor + accessors); pick-a-row → `@OnRowSelected("method")` (works on read-only
   grids too).
5. **Selects from data** — `@Lookup(search = …, label = …)` with supplier beans, never a
   free-text field. Enums alone: combobox/radio stereotypes.
6. **Results & warnings** — `@Notice` fields (themed, auto-hide when blank), never a
   `@ReadOnly String` that looks like a broken input.
7. **Actions** — if the method mutates fields, return `new State(this)` (usually
   `List.of(new Message("…"), new State(this))`); returning only a `Message` does not
   refresh the client. Placement: `@Button` → form footer, `@Toolbar` → page toolbar,
   section-scoped → partial forms (nested type owns the action). Mark THE main action with
   `@Button(buttonStyle = ButtonStyle.primary)` — one per screen.
8. **Conditional fields** — `@Hidden("!state.flag")`, not a permanently visible input.
9. **Validation** — Bean Validation (`@NotNull`, `@NotEmpty`, …) on everything mandatory;
   Mateu will not block the user otherwise.
10. **Functional parity** — when porting an existing UI, diff feature by feature against
    the source before calling it done; check `ux-patterns/` before dropping anything.
11. **Verify at runtime** — load the route through the UIDL API
    (`POST <base>/mateu/v3/components/_/action` with `actionId: ""` + `serverSideType`)
    and exercise every action. Rendering and state round-trips fail in ways compilation
    cannot catch.
