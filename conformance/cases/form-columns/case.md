# form-columns

**Pins:** the inferred column count of a form that declares none. A form lays out in ONE column
when it has up to 6 visible fields and in TWO from 7 on, counted over the whole form (all its
sections share the result) and over the fields that actually render as form fields.

Seven plain string fields → `maxColumns: 2`, two fields per `FormRow`. The other side of the
threshold (≤ 6 → `maxColumns: 1`, one field per row) is pinned by every other form case in the
corpus (`simple-form`, `tabs`, `validation`…).

Declarations always win and are not inferred: `@FormLayout(columns = N)` /
`[FormLayout(Columns = N)]` / `@form_layout(columns=N)`, `@Section(columns = N)`, and `@Zones`
(the `zones` case keeps 2).
