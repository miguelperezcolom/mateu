# Partials

A reusable piece of layout with no route: `specs/ui/partials/<name>.yaml`.

```yaml
# specs/ui/partials/address-block.yaml — several components: a content: list, no type:
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
content:
  - {type: FormField, id: street, label: Street, dataType: string}
  - {type: FormField, id: city, label: City, dataType: string}
```

```yaml
# specs/ui/partials/legal-notice.yaml — one component: the file IS the component
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Text
text: Prices include VAT.
```

Use it anywhere a component goes:

```yaml
type: FormLayout
content:
  - {type: FormField, id: name, label: Name}
  - {type: Partial, ref: address-block}
```

- **`ref` spellings** (same in Java, .NET, Python, the visual editor and the bundle): the short
  name (`address-block` → `partials/address-block.yaml` or `.yml`), the specs-relative path
  (`partials/address-block.yaml`) or the classpath path (`specs/ui/partials/address-block.yaml`).
  On the Java server only, `ref` may also be a class name (a `ComponentTreeSupplier`).
- **It splices**: a multi-component partial's components become siblings in the parent's
  `content` (two fields stay two form cells). In a single-component slot they are stacked in a
  `VerticalLayout`.
- **No parameters**: fields bind against the page that uses it (`id: street` → that page's
  `state.street` / view-model field). Two pages using the same partial each bind their own.
- Resolved server-side (or by the bundle exporter) before anything reaches the wire; renderers never
  see a partial. A missing ref renders nothing (and logs); a cycle is cut.
