# grid-field-detail

**Pins:** a grid field's row-detail customisation. The row type marks one field as its DETAIL
(Java `@Details`, .NET `[Details]`, Python `Details()`): the grid carries it as `detailPath` and
sets `useButtonForDetail`, so the renderer opens it under the row behind a button. The row editor
is customised (Java `@DetailFormCustomisation` + `@MasterDetail`, .NET `[DetailForm]`, Python
`DetailForm`): `formPosition` `bottom`, `formColumns` 1, `formStyle`, `formTheme` and
`minHeightWhenDetailVisible`.

Worth pinning because these members were set only by Java before 3.0 GA, and a renderer reads
them straight off the grid field.
