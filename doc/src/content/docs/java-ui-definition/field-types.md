---
title: "Field types (types.yaml)"
description: "Name the domain concepts of your screens once — OrderStatus, Money, Email — and reference them from any field or column with fieldType."
---

Every page that shows an order status repeats the same thing: `dataType: status`, the same options,
the same badge colours. Every amount repeats `dataType: money` and `align: end`; every e-mail repeats
`stereotype: email`, a placeholder and `required: true`. A **field type** names that concept once, and
a field or a column references it by name.

It is the YAML twin of a [semantic (composed) annotation](/java-ui-definition/annotations/semantic-annotations/):
`@ImporteTotal` bundles `@Stereotype(money) @Label(…)` for a Java field; `fieldType: Money` does the
same for a field authored as data.

## Declaring the vocabulary

```yaml
# specs/ui/types.yaml
type: Types            # optional — a bare list is accepted too
types:
  - id: OrderStatus
    label: Status
    dataType: status
    options:
      - {value: OPEN, label: Open}
      - {value: SHIPPED, label: Shipped}
    tones: {OPEN: warning, SHIPPED: success}
  - id: Money
    dataType: money
    align: end
  - id: Email
    label: E-mail
    stereotype: email
    placeholder: name@example.com
    required: true
```

The keys are those of a `FormField` / `GridColumn`, spelled the same: `label`, `dataType`,
`stereotype`, `placeholder`, `description`, `required`, `readOnly`, `options`, `optionsSource`, `min`,
`max`, `step`, `colspan`, `style`, `cssClasses`, `align`, `width`, `autoWidth` — plus **`tones`**, a
status badge's tone per value (`success | warning | danger | info | neutral`, the same vocabulary as
`@RowStatus`). A value with no tone keeps the default reading of its word. The file is described by
the generated `types-schema.json` (and the `type: Types` branch of `specs-schema.json`), so an IDE
validates and completes it.

## Referencing a type

```yaml
type: Listing
title: Orders
rowsSource: {ref: orders}
columns:
  - {type: GridColumn, id: id, label: Id, identifier: true}
  - {type: GridColumn, id: status, fieldType: OrderStatus}
  - {type: GridColumn, id: total, fieldType: Money, label: Amount}
filters:
  - {type: FormField, id: status, fieldType: OrderStatus}
```

**The type supplies defaults; what the field declares wins** — `label: Amount` above overrides
nothing else of `Money`. Each target takes the attributes it has: a column takes `label`, `dataType`,
`stereotype`, `style`, `cssClasses`, `align`, `width`, `autoWidth` and `tones`; a form field takes
`label`, `dataType`, `stereotype`, `placeholder`, `description`, `required`, `readOnly`, `options`,
`optionsSource`, `min`, `max`, `step`, `colspan`, `style` and `cssClasses`. That is why the filter
above gets the options and the column gets the tones.

The key is `fieldType` rather than `type` (the component discriminator) or `ref` (already a source /
partial / component reference): it reads as the domain type of the field and cannot be mistaken for
either.

## How it resolves

`fieldType` is resolved on the authored tree **before** it becomes components — by the server's YAML
loader (pages, partials, the business-component catalogue), by the browser's expander (Play, the
visual editor's canvas, specs-mode bundles) and by the .NET and Python loaders, with the same rule
everywhere. The wire never carries `fieldType`. A static bundle ships its definitions with the
references already resolved at build time.

An **unknown** type is logged as a warning and the field renders as declared — never a failed page.

## Types from code

A bean implementing `FieldTypeCatalogSupplier` contributes types programmatically (the twin of
`RestSourceCatalogSupplier`). The authored `types.yaml` wins over it, entry by entry:

```java
@Component
public class DomainTypes implements FieldTypeCatalogSupplier {
  public List<FieldTypeEntry> fieldTypes() {
    return List.of(FieldTypeEntry.of("Money", FieldDataType.money, FieldStereotype.regular));
  }
}
```

.NET: `IFieldTypeCatalogSupplier`; Python: `FieldTypeCatalogSupplier`.

## Limits

- Validation beyond `required` / `min` / `max` (a pattern, a custom message) is not part of a type
  yet: a field has no per-field validation key to default.
- A type cannot extend another type.
- In the .NET and Python ports the YAML builders know fewer component kinds than Java (no YAML
  listing), so a typed column there is reached through a `[FieldType]` / `FieldType(...)` marker on a
  listing row instead.
