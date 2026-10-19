# Authoring Mateu screens in YAML — a guide for agents

Mateu renders a UI from a declarative model. One way to write that model is YAML files under
`src/main/resources/specs/ui/` (the *specs directory*). Each file is one **definition**; Mateu turns
it into forms, listings, buttons and navigation with no frontend code.

## The workflow

1. `mateu_list_components` (optionally with a `query`) — which component types exist, one line each.
2. `mateu_get_component_schema` with a `type` — every key that type accepts, with the types of
   the values and the enums spelled out.
3. Write the YAML.
4. `mateu_validate_uidl` — fix every **error**; read every **warning** (an unknown key is ignored
   by the loader, which usually means a typo).
5. `mateu_preview_uidl` — render it and read back what a user would see (title, fields, actions).
6. `mateu_save_spec` — only offered when the app runs in development mode; writes the file into the
   specs directory and the open browsers reload it.

The full contract is the `mateu://schema/specs` resource (every file kind) and
`mateu://schema/uidl` (the component catalogue); `mateu://catalog` is the short index.

## A page

A page is one root component: a mapping with a `type:` and, for containers, a `content:` list.

```yaml
type: VerticalLayout
spacing: true
content:
  - type: Text
    text: Customer
    container: h2
  - type: FormLayout
    content:
      - type: FormField
        id: name          # camelCase; binds to the view model property of the same name
        label: Name
        dataType: string
        required: true
      - type: FormField
        id: email
        label: Email
        dataType: string
        stereotype: email
  - type: HorizontalLayout
    content:
      - type: Button
        label: Save
        actionId: save
        buttonStyle: primary
```

## Rules that keep a definition valid

- Use only the `type`s and keys the schema declares. Type names are case-sensitive.
- `dataType` is one of: integer, string, number, date, time, dateTime, bool, array, file, status,
  money, component, menu, range, action, actionGroup. There is **no** `decimal`: use `number` or
  `money`.
- A stack is `VerticalLayout`, a row is `HorizontalLayout`, fields go in a `FormLayout`.
- A page bound to a view model names it once at the root (`viewModel: com.acme.CustomerView`); its
  fields' `id`s and buttons' `actionId`s are that class's members. A page with **no** view model
  omits `viewModel:`; its buttons can then only run actions declared in the page's top-level
  `actions:` list (or the app's action catalogue).
- A classless page reads and writes through REST: a `Listing` with `rowsSource: { ref: <name> }`,
  and `actions:` entries (`id` = a button's `actionId`) carrying a `restAction` with
  `source: { ref: <name> }`. The named sources live in `sources.yaml` (`type: Sources`).
- `type: Partial` with `ref:` splices a file of `specs/ui/partials/`; `type: ComponentRef` with
  `ref:` uses an entry of `components.yaml`.
- Any component may carry a `note:` — a sentence of design intent. Nothing renders it; write one
  wherever the person asked for behaviour the layout cannot express.
- Texts may use `${state.x}`, `${data.x}` and `${i18n.key}` expressions.

## Other file kinds

Discriminated by the root `type:` — `UI` (a mount: `basePath`, `home`, `routes`), `Routes` (a list
of `route` → `layout` + optional `viewModel`), `Sources`, `Actions`, `Translations`, `Environment`,
`Types`, `Project` and `AppShell` (title, variant, menu). A file with `layout:` (and no `type:`) is a
page envelope; `content:` alone is a partial; `components:` is the business component catalogue.

Spend the effort on the right components, sensible labels and ids, and the structure the person
described; spacing and fine layout are adjusted later in the visual editor.
