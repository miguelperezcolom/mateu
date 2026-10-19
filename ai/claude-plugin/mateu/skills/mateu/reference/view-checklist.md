# Pre-flight checklist for a declarative view

Run through this list BEFORE considering a Mateu view done. Every line exists because
skipping it produced a real defect in a generated UI; "it compiles" catches none of them.

1. **Not a singleton** — the `@UI` class is not a bean (Mateu creates it per request). If it was
   made a `@Component`/`@Service`, it must be `@Scope("prototype")`; a singleton shares form
   state across users.
2. **Width** — full-page view? → `@Style(StyleConstants.CONTAINER)`. Without it the form
   spans 100% of the viewport.
3. **Sections & density** — group fields with `@Section(value, columns = n)` and plan each
   section as **rows of n cells**: wide fields (grid, textarea, richText, html, markdown)
   auto-span the full row; long text inputs need an explicit `@Colspan(n)`.
4. **Grids** — display-only inside a form → add `@ReadOnly` (grids are editable and
   reorderable by default; a view with no editable field at all should be a `Listing<Row>`); user-edited rows → `@InlineEditing` on a `List<MutablePojo>` (no-args
   constructor + accessors); pick-a-row → `@OnRowSelected("method")` (works on read-only
   grids too).
5. **Selects from data** — `@Lookup(search = …, label = …)` with supplier classes, never a
   free-text field. Enums render as selects on their own.
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
11. **Actions reachable** — every handler is marked (`@Button`/`@Toolbar`/`@Action`…) or named
    by the view; strict mode refuses the rest with 403.
12. **Verify at runtime** — load the route through the wire API (see the **mateu-run** skill:
    `POST <base>/mateu/v3/sync/<route>` with a JSON body
    `{"route":"/<route>","consumedRoute":"","actionId":"","componentState":{}}`) and exercise
    every action (same body with `"actionId":"<method>","serverSideType":"<FQCN>"` and the field
    values in `componentState`). Rendering and state round-trips fail in ways compilation
    cannot catch.
