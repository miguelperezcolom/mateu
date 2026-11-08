# inline-form

Pins NESTED data objects in a form (Java's `@Inline` / nested sub-form), first load.

- `supplier` is `@Inline`: its fields expand straight into the "Supplier" section as a full-row
  CustomField holding a form layout, with PREFIXED field ids (`supplier-name`, `supplier-email`).
  The nested class's `@Toolbar` method renders on the section's TITLE ROW (a small button next to
  the heading), its `@Button` method in a right-aligned row BELOW the content; both dispatch
  `nested-form-action-supplier-<method>` and are advertised on the component — the toolbar one
  with the `@Action(shortcut)` it carries, the button one `validationRequired`.
- `delivery` is a nested object WITHOUT `@Inline`: a sub-form — an outlined Card holding a level-1
  Page titled after the field, whose content is the nested class's own form (ids `delivery-city`,
  `delivery-days`).
- The state carries each nested object TWICE: as a nested map (`supplier: {name, email}`) and
  FLATTENED under the prefixed ids (`supplier-name`…), which is what the fields bind to; the
  component's `initialData` carries the nested maps only.

The second request (`inline-form-action`) pins that the flattened keys are read back.
