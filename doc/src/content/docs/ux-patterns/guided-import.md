---
title: Guided import
description: A wizard that turns a user's CSV into typed, validated records — upload, map columns, review problems, import.
---

**Status:** ✅ Implemented

## Intent

Let end users **load data in bulk from a spreadsheet** — a price list, an initial product
catalogue, a batch of bookings — without asking IT to write a loader. The user brings a CSV that
almost never matches your model exactly: different column names, a `;` separator, missing cells,
`"quoted, values"`. A guided wizard absorbs those differences: it maps columns to fields, shows
what will fail **before** anything is written, and imports only the clean rows.

## Solution

Extend `ImportWizard<Row>` and implement `importRows` — the wizard contributes the four steps:

```java
@UI("/product-import")
public class ProductImport extends ImportWizard<Product> {

    @Override
    protected void importRows(List<Product> rows, HttpRequest httpRequest) {
        rows.forEach(repository::save);
    }
}
```

with a plain row class carrying the usual bean-validation annotations:

```java
public class Product {
    @NotEmpty String name;
    int units;
    boolean active;
}
```

The four steps:

1. **Upload** — a `@FileUpload(accept = ".csv")` field (the file is read client-side into a data
   URI, so no upload endpoint is involved) or a textarea to paste the CSV. Both `,` and `;`
   separators are detected automatically; quoted fields may embed separators, quotes and newlines.
2. **Mapping** — one grid row per CSV column showing a sample value from the first data row. The
   *target field* cell is an inline select over the row class's assignable fields, pre-filled by
   name similarity (exact case-insensitive match, then containment). Leave it blank to skip a
   column.
3. **Validation** — the report: valid/invalid row counts plus one issue line per problem, with the
   CSV line number, column, offending value and reason — conversion failures (`"abc"` into an
   `int`, a non-ISO date) and constraint violations (`@NotNull`, `@NotEmpty`, `@NotBlank`,
   `@Min`, `@Max`). This step carries the **Import** button.
4. **Result** — how many rows were imported and how many skipped.

Only the valid rows reach `importRows`, already **typed** (`List<Product>`, coerced basics:
strings, numbers, booleans, enums, ISO `LocalDate`/`LocalDateTime`/`LocalTime`).

- `rowClass()` defaults to the `Row` generic argument; override it when generics can't tell.
- Override `title()` for a custom heading (default: *Import Product*).
- Everything is standard wizard machinery — the progress indicator, Back/Next, cross-step state —
  so `@WizardProgress(STEPS)` and the other wizard options apply.

## The `@FileUpload` field

The upload step is built on a reusable piece: annotate any `String` field with
`@FileUpload(accept = ".csv")` and it renders as a generic file picker (chosen file's name +
Remove button, no preview — the generic sibling of `@UploadableImage`). The picked file travels in
the field value as a **data URI**, with the original file name embedded as a `name=` data-URI
parameter so it can be shown again and used as the download name; decode everything after the
first comma as base64 on the server.

```java
@FileUpload(accept = "application/pdf")
String contract;
```

## Principles served

- **Workflow over screens** — a multi-step task (upload → map → verify → commit) modeled as one
  guided flow instead of a form dump.
- **Recoverability** — nothing is written until the user has seen exactly which rows will fail
  and why; bad rows are skipped, never half-imported.

## Related

- [Bulk actions](/ux-patterns/bulk-actions/) — operating on many existing records at once
- [Inline CRUD editing](/ux-patterns/inline-crud-editing/) — the same in-place cell editors the
  mapping grid uses
