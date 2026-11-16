# Lab 08 · Cada pantalla del CRUD, la suya (extra, 20′)

*[English](guide.md)* · Tracks: **Java**, **C#**, **Python** · Inicio: `<track>/start` (= la solución del lab 03) · Solución: `<track>/solution`

El CRUD de productos del lab 01 son cuatro pantallas: el **listado** (`/products`), el **formulario
de alta** (`/products/new`), el **detalle** —la página de solo lectura de un producto
(`/products/P-003`)— y el **editor** (`/products/P-003/edit`). Todas muestran los mismos campos
porque todas salen de `Product`. En este lab haces que difieran, sin salir del modelo:

| Nivel | Qué cambia | Java | C# | Python |
|---|---|---|---|---|
| 1 | qué campos muestra cada pantalla | ✅ anotaciones | ✅ atributos | ✅ marcadores |
| 2 | con qué empieza cada pantalla | ✅ `creationForm` / `view` / `edit` | 🟡 inicializadores + `Get` | 🟡 valores por defecto de la clase + `get` |
| 3 | una clase por pantalla | ✅ (extra) | ✅ (extra) | ✅ (extra) |

## 1. Un campo que el alta no muestra (7′)

Un producto tiene la fecha en que **entró en el catálogo**. Nadie la teclea: la pone el almacén
cuando se crea el producto; el detalle y el editor la muestran, el editor como solo lectura.

**Java** — `Product.java`, un último componente (importa `HiddenInCreate` y `ReadOnly` de
`io.mateu.uidl.annotations`, y `java.time.LocalDate`):

```java
@HiddenInCreate @ReadOnly LocalDate addedOn
```

dale una fecha a las cuatro muestras de `ProductStore.java` (`…, ProductStatus.Available, LocalDate.of(2026, 1, 15))`)
y deja que el almacén la rellene cuando un producto nuevo llega sin ella — al principio de `save`:

```java
var stored = product.addedOn() != null ? product
    : new Product(product.id(), product.name(), product.price(), product.stock(),
        product.status(), LocalDate.now());
db.put(stored.id(), stored);
return stored.id();
```

**C#** — `Products.cs`, en `Product`:

```csharp
[HiddenInCreate, ReadOnly] public DateOnly? AddedOn { get; set; }
```

(`AddedOn = new(2026, 1, 15)` en las muestras) y en `Save`, como primera línea:
`product.AddedOn ??= DateOnly.FromDateTime(DateTime.Today);`

**Python** — `views.py`, en `Product` (importa `HiddenInCreate` de `mateu_ui.uidl` y `date` de
`datetime`):

```python
added_on: Annotated[date | None, HiddenInCreate(), ReadOnly()] = None
```

(`p.added_on = date(2026, 1, 15)` en `_product`) y en `save`, lo primero:
`if entity.added_on is None: entity.added_on = date.today()`.

Reinicia y mira: **New** no tiene *Added on*; abre *Milk frother*: el detalle la muestra; **Edit**:
está, de solo lectura. Crea un producto: su detalle enseña la fecha de hoy.

**¿Por qué en el almacén y no en el formulario?** Lo que un formulario no deja escribir al usuario
nunca se toma del navegador: un alta parte de un objeto nuevo para los campos ocultos y de solo
lectura, y una edición conserva los valores guardados. La anotación es la regla de la pantalla *y*
del guardado.

Las demás anotaciones por pantalla funcionan igual: `@HiddenInView`, `@HiddenInEditor`,
`@HiddenInList` (C# `[HiddenInView]`…, Python `HiddenInView()`…). Y para un campo que solo algunos
usuarios pueden cambiar, `@ReadOnlyUnless(roles = "manager")` — lab 06.

## 2. Un código que se teclea una vez (3′)

Abre el editor de un producto: el **Id** es de solo lectura, pero en **New** lo tecleas. Es
`@EditableOnlyWhenCreating` sobre `id` (C# `[EditableOnlyWhenCreating]`, Python
`EditableOnlyWhenCreating()`), que ya trae el `Product` generado. Quítalo y reinicia: New se queda
sin campo Id, porque un `id` a secas es un id *técnico* que asigna el almacén. Vuelve a ponerlo.

## 3. El alta empieza rellena (7′)

**Java** — el CRUD construye el objeto de cada pantalla con un método que puedes sobrescribir:
`creationForm(httpRequest)` para New, `view(id, httpRequest)` para el detalle y
`edit(id, httpRequest)` para el editor. En `Products.java` (importa
`io.mateu.uidl.interfaces.HttpRequest`), New propone el siguiente código libre y empieza como
*Available*:

```java
@Override
public Product creationForm(HttpRequest httpRequest) {
  return new Product(ProductStore.INSTANCE.nextId(), "", 0, 0, ProductStatus.Available, null);
}
```

y en `ProductStore.java`:

```java
public String nextId() {
  int highest = db.keySet().stream().filter(id -> id.matches("P-\\d+"))
      .mapToInt(id -> Integer.parseInt(id.substring(2))).max().orElse(0);
  return "P-%03d".formatted(highest + 1);
}
```

Reinicia y pulsa **New**: el Id dice `P-005`. Un valor propuesto así se guarda cuando el usuario
puede cambiarlo (aquí Id y Status); en un campo que el usuario *no* puede cambiar, el alta lo toma de
un objeto nuevo — eso es cosa del almacén, como en el paso 1.

**C# y Python — no por pantalla en esta versión.** Su CRUD construye New con un `new Product()` /
`Product()` nuevo, y el detalle y el editor con `Get(id)` / `get(id)`. Así que:

- los valores iniciales de New son los **inicializadores** del modelo: C#
  `public ProductStatus Status { get; set; } = ProductStatus.Available;`, Python
  `status: ProductStatus = ProductStatus.Available` (ya está);
- un valor calculado al abrir un producto va en `Get` / `get` — y sale en el detalle **y** en el
  editor;
- un valor que depende de los datos, como el siguiente código libre, necesita el nivel 3. (El
  `Crud<T>` de C# tiene miembros `CreationForm()`, `View(id)` y `Edit(id)`, pero las pantallas del
  CRUD no los llaman en esta versión: sobrescribirlos no cambia nada.)

## 4. Pruébalo (3′)

La solución añade un test que abre cada pantalla y comprueba sus campos — el mismo harness del
lab 03: `ProductScreensUiTest.java` / `Workshop.Tests/ProductScreensUiTests.cs` /
`test_product_screens.py`. Cópialo a tu proyecto y ejecuta `mvn test` / `dotnet test Workshop.Tests` / `pytest`.

```java
var form = mateu.open("/products").button("New").press();
assertFalse(form.hasField("addedOn"));          // C# form.HasField, Python form.has_field
assertEquals("P-005", form.field("id").value()); // solo Java (paso 3)
```

✅ **Checkpoint**: New no tiene *Added on* (y, en Java, propone `P-005`); el detalle la muestra; el
editor la muestra de solo lectura, con el Id también de solo lectura; un producto que crees tiene la
fecha de hoy. Tests en verde.

## Extra: una clase por pantalla (nivel 3)

Cuando las pantallas necesitan campos realmente distintos —un alta de dos campos, un detalle hecho de
texto calculado— dale a cada pantalla su propia clase:

- **Java**: extiende `Crud<View, Editor, CreationForm, Filters, Row, IdType>`, o implementa
  `Listing<Row>` más solo las pantallas que quieras: `Navigable<Detail, Id>` (`view`),
  `Editable<Editor, Id>` (`edit` + `save`), `Creatable<Form, Id>` (`creationForm` + `create`),
  `Deletable<Id>`.
- **C#**: `IListing<TRow>` + `INavigable<TDetail, TId>`, `IEditable<TEditor, TId>`,
  `ICreatable<TForm, TId>`, `IDeletable<TId>` — aquí `CreationForm()` *sí* se llama.
- **Python**: `Listing[Row]` + `Navigable`, `Editable`, `Creatable`, `Deletable` —
  `creation_form()` puede proponer el siguiente código.

Prueba un `NewProduct` con solo `id` y `name` como formulario de alta de una segunda pantalla de
productos. La guía recorre un ejemplo por los tres niveles, en los tres lenguajes:
[Customise each screen](https://mateu.io/java-user-manual/build/customizing-crud-and-listings/#5-customise-each-screen-creation-form-detail-editor)
(C# y Python: la sección del mismo nombre en sus manuales).
