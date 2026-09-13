# grid-field

Pins the grid field contract: a List of nested rows renders as a form field with dataType "array", stereotype "grid", one GridColumn per row-type field, rows identified by itemIdPath "_rowNumber", and the initial rows riding as camelCase dicts. @OnRowSelected binds the row click on the wire (onItemSelectionActionId) and forces the action to be advertised in the component's actions list — without that advertisement the renderer silently drops the click, which is exactly the kind of gap that only shows up when a port forgets it. This is the master/detail entry point, so the three backends must agree on the column set and the selection wiring, not just on scalar fields.

## Known divergence

Both ports will xfail structurally against the Java golden: (1) Java's GridColumnBuilder appends a trailing "_select" button column (id "_select", stereotype "button", actionId "guests_select" — the detail-edit affordance) that neither port emits; (2) Java grid columns normalise numeric dataTypes to "string" via ColumnTypeMapper, while the ports emit the field-level inferred type (age column → "integer"). The core contract — array/grid stereotype, itemIdPath "_rowNumber", the name/age columns, the initial rows and onItemSelectionActionId "onSel" — agrees on all three.
