# Lab 08 · Each CRUD screen its own (stretch, 20′)

*[Español](guide.es.md)* · Tracks: **Java**, **C#**, **Python** · Start: `<track>/start` (= lab 03's solution) · Solution: `<track>/solution`

The Products CRUD of lab 01 is four screens: the **listing** (`/products`), the **creation form**
(`/products/new`), the **detail** — a product's read-only page (`/products/P-003`) — and the
**editor** (`/products/P-003/edit`). They all show the same fields because they all come from
`Product`. In this lab you make them differ, without leaving the model:

| Level | What changes | Java | C# | Python |
|---|---|---|---|---|
| 1 | which fields each screen shows | ✅ annotations | ✅ attributes | ✅ markers |
| 2 | what each screen starts with | ✅ `creationForm` / `view` / `edit` | 🟡 initializers + `Get` | 🟡 class defaults + `get` |
| 3 | a class per screen | ✅ (stretch) | ✅ (stretch) | ✅ (stretch) |

## 1. A field New does not show (7′)

A product has a date it **entered the catalogue**. Nobody types it: the store sets it when the
product is created, the detail and the editor show it, the editor read-only.

**Java** — `Product.java`, a last component (import `HiddenInCreate`, `ReadOnly` from
`io.mateu.uidl.annotations` and `java.time.LocalDate`):

```java
@HiddenInCreate @ReadOnly LocalDate addedOn
```

give the four samples in `ProductStore.java` a date (`…, ProductStatus.Available, LocalDate.of(2026, 1, 15))`),
and let the store fill it in when a new product arrives without one — at the start of `save`:

```java
var stored = product.addedOn() != null ? product
    : new Product(product.id(), product.name(), product.price(), product.stock(),
        product.status(), LocalDate.now());
db.put(stored.id(), stored);
return stored.id();
```

**C#** — `Products.cs`, in `Product`:

```csharp
[HiddenInCreate, ReadOnly] public DateOnly? AddedOn { get; set; }
```

(`AddedOn = new(2026, 1, 15)` in the samples) and in `Save`, first line:
`product.AddedOn ??= DateOnly.FromDateTime(DateTime.Today);`

**Python** — `views.py`, in `Product` (import `HiddenInCreate` from `mateu_ui.uidl`, `date` from
`datetime`):

```python
added_on: Annotated[date | None, HiddenInCreate(), ReadOnly()] = None
```

(`p.added_on = date(2026, 1, 15)` in `_product`) and in `save`, first:
`if entity.added_on is None: entity.added_on = date.today()`.

Restart and look: **New** has no *Added on*; open *Milk frother*: the detail shows it; **Edit**: it
is there, read-only. Create a product — its detail shows today's date.

**Why the store, and not the form?** What a form does not let the user write is never taken from
the browser: a create starts the hidden and read-only fields from a fresh object, and an edit keeps
the stored values. The annotation is the rule of the screen *and* of the save.

The other per-screen annotations work the same way: `@HiddenInView`, `@HiddenInEditor`,
`@HiddenInList` (C# `[HiddenInView]`…, Python `HiddenInView()`…). And on a field only some users may
change, `@ReadOnlyUnless(roles = "manager")` — lab 06.

## 2. A code typed once (3′)

Open a product's editor: the **Id** is read-only, but on **New** you type it. That is
`@EditableOnlyWhenCreating` on `id` (C# `[EditableOnlyWhenCreating]`, Python
`EditableOnlyWhenCreating()`) — already in the generated `Product`. Remove it and restart: New has no
Id input at all, because a plain `id` is a *technical* id that the store assigns. Put it back.

## 3. New starts filled in (7′)

**Java** — the CRUD builds each screen's object with a method you can override:
`creationForm(httpRequest)` for New, `view(id, httpRequest)` for the detail, `edit(id, httpRequest)`
for the editor. In `Products.java` (import `io.mateu.uidl.interfaces.HttpRequest`), New proposes
the next free code and starts as *Available*:

```java
@Override
public Product creationForm(HttpRequest httpRequest) {
  return new Product(ProductStore.INSTANCE.nextId(), "", 0, 0, ProductStatus.Available, null);
}
```

with, in `ProductStore.java`:

```java
public String nextId() {
  int highest = db.keySet().stream().filter(id -> id.matches("P-\\d+"))
      .mapToInt(id -> Integer.parseInt(id.substring(2))).max().orElse(0);
  return "P-%03d".formatted(highest + 1);
}
```

Restart, press **New**: the Id says `P-005`. A value proposed like this is saved when the user may
change it (Id, Status here); on a field the user may *not* change, the create keeps it from a fresh
object — that is the store's job, as in step 1.

**C# and Python — not per screen in this version.** Their crud builds New from a fresh
`new Product()` / `Product()` and the detail and the editor from `Get(id)` / `get(id)`. So:

- New's defaults are the model's **initializers**: C# `public ProductStatus Status { get; set; } = ProductStatus.Available;`,
  Python `status: ProductStatus = ProductStatus.Available` (already there);
- a value computed when a product is opened goes in `Get` / `get` — and shows on the detail **and**
  the editor;
- a value that depends on the data, like the next free code, needs level 3. (C#'s `Crud<T>` has
  `CreationForm()`, `View(id)` and `Edit(id)` members, but the crud screens do not call them in this
  version: overriding them changes nothing.)

## 4. Test it (3′)

The solution adds a test that opens each screen and checks its fields — the same harness as lab 03:
`ProductScreensUiTest.java` / `Workshop.Tests/ProductScreensUiTests.cs` / `test_product_screens.py`.
Copy it into your project and run `mvn test` / `dotnet test Workshop.Tests` / `pytest`.

```java
var form = mateu.open("/products").button("New").press();
assertFalse(form.hasField("addedOn"));          // C# form.HasField, Python form.has_field
assertEquals("P-005", form.field("id").value()); // Java only (step 3)
```

✅ **Checkpoint**: New has no *Added on* (and, in Java, proposes `P-005`); the detail shows it; the
editor shows it read-only with the Id read-only; a product you create gets today's date. Tests green.

## Stretch: a class per screen (level 3)

When the screens need genuinely different fields — a two-field creation form, a detail made of
computed text — give each screen its own class:

- **Java**: extend `Crud<View, Editor, CreationForm, Filters, Row, IdType>`, or implement
  `Listing<Row>` plus only the screens you want: `Navigable<Detail, Id>` (`view`),
  `Editable<Editor, Id>` (`edit` + `save`), `Creatable<Form, Id>` (`creationForm` + `create`),
  `Deletable<Id>`.
- **C#**: `IListing<TRow>` + `INavigable<TDetail, TId>`, `IEditable<TEditor, TId>`,
  `ICreatable<TForm, TId>`, `IDeletable<TId>` — here `CreationForm()` *is* called.
- **Python**: `Listing[Row]` + `Navigable`, `Editable`, `Creatable`, `Deletable` — `creation_form()`
  can propose the next code.

Try a `NewProduct` with only `id` and `name` as the creation form of a second Products screen. The
guide walks one example through the three levels, in the three languages:
[Customise each screen](https://mateu.io/java-user-manual/build/customizing-crud-and-listings/#5-customise-each-screen-creation-form-detail-editor)
(C# and Python: the section of the same name in their manuals).
