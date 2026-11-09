---
title: "Listings and capabilities"
description: "Start with rows, declare capabilities: search, filters, navigation, editing, creation, and deletion are opt-in interfaces on a Listing — a Crud is simply the full pack."
---

Every collection screen in Mateu is built on one idea: **you start with rows, and every further feature is a capability you declare on the class**. A read-only grid, a searchable catalogue, an editable listing, a full CRUD — they are all the same `Listing`, differing only in which capability interfaces the class implements.

---

## The core contract

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

A listing is a class implementing `Listing<Row>` with a single method:

```java
public interface Listing<Row> {
    ListingData<Row> search(SearchRequest request, HttpRequest httpRequest);
}
```

That alone puts a grid on screen with column sorting and pagination. Everything the search needs arrives in one object:

```java
public record SearchRequest(
    String searchText,             // populated when the listing is Searchable
    Object filters,                // populated when the listing is Filterable<F>
    List<FilterCriterion> criteria, // range / multi-select conditions (CRUD path)
    Pageable pageable,             // page, size, sort
    List<String> ids               // ?ids=A,B,C on the URL: exactly those rows (empty when unset)
) {}
```

`ids` is the framework's reserved id-set filter: any listing's URL can ask for a concrete set of
rows with `?ids=A,B,C` (no declaration needed). `AutoCrud`/`CrudStore` apply it themselves; a
hand-written `search` should honour it in its query (`WHERE id IN (:ids)`). As a fallback the
framework narrows the returned page to those ids, which is exact only when every requested row fits
in that page.

Adding a new search input in the future means adding a component to `SearchRequest` — the `search(SearchRequest, HttpRequest)` signature never changes.

```java
@UI("/books")
@Title("Books")
public class Books implements Listing<Book> {

    public record Book(String id, String title, int pages) {}

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
        return ListingData.from(List.of(
            new Book("b1", "El Quijote", 863),
            new Book("b2", "Rayuela", 600)));
    }
}
```

This bare listing shows **no search box, no filter bar, no buttons, and rows are not clickable** — nothing was declared. The grid's sort and page state arrives in `request.pageable()` for you to apply (returning everything is fine for small in-memory sets).

---

## The capabilities

There are two kinds. **Input capabilities** are marker/typed interfaces you *declare* — they add inputs to the search bar and feed `SearchRequest`. **Interaction capabilities** are interfaces you *implement* — each one adds exactly the UI affordance and routes it needs, and nothing else.

| Capability | You implement | What appears |
|---|---|---|
| `Searchable` | *(marker — nothing)* | Free-text search box; the typed text arrives as `request.searchText()` |
| `Filterable<F>` | *(nothing — `F` declares the filter fields)* | Filter bar built from `F`; read it typed via `filters(request)` |
| `Navigable<Detail, Id>` | `view(id, http)` | Rows become clickable; clicking opens the read-only detail at `/:id` |
| `Editable<Editor, Id>` | `edit(id, http)` + `save(http)` | Records can be edited; **without** `Navigable` the editor opens in a drawer over the listing |
| `Creatable<Form, Id>` | `creationForm(http)` + `create(http)` | New button; the form opens at `/new`, submitting calls `create` |
| `Deletable<Id>` | `deleteAllById(ids, http)` | Row selection checkboxes + Delete button |

A plain `@UI` class that declares any interaction capability is **promoted automatically** to the CRUD mediator — the page serves only the routes and buttons of the capabilities it declares. There is no orchestrator class to extend and no configuration: the declaration *is* the configuration.

Without `Searchable`, `request.searchText()` always arrives empty; without `Filterable`, `request.filters()` is `null`.

---

## Search box and filters

Declare `Searchable` for the free-text box and `Filterable<F>` for the filter bar. The filter widgets are built reflectively from `F` — typed fields get typed widgets (`DateRange`/`NumberRange` render from–to ranges, a `Set<SomeEnum>` renders a multi-select; see [Filters & Listing](/ux-patterns/filters-and-listing/)):

```java
@UI("/books")
@Title("Books")
public class Books implements Listing<Book>, Searchable, Filterable<BookFilters> {

    public record Book(String id, String title, String author, int pages) {}
    public record BookFilters(String author, NumberRange pages) {}

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
        var searchText = request.searchText();
        var filters = filters(request);   // typed access, from Filterable
        var rows = catalogue.stream()
            .filter(b -> searchText.isBlank()
                || (b.title() + " " + b.author()).toLowerCase().contains(searchText.toLowerCase()))
            .filter(b -> filters.author() == null || filters.author().isBlank()
                || b.author().equalsIgnoreCase(filters.author()))
            .filter(b -> filters.pages() == null || filters.pages().contains(b.pages()))
            .toList();
        return ListingData.from(rows);
    }
}
```

---

## Clickable rows — `Navigable`

`Navigable<Detail, Id>` makes rows clickable and serves the detail route. `Detail` is any view model — Mateu renders its fields read-only:

```java
@UI("/books")
public class Books implements Listing<Book>, Navigable<Book, String> {

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
        return ListingData.from(store.all());
    }

    @Override
    public Book view(String id, HttpRequest httpRequest) {
        return store.byId(id);   // rendered read-only at /books/:id
    }
}
```

There is still no New, Edit, or Delete chrome — only what was declared.

### The whole row opens the record

On a navigable listing — one that implements `Navigable` (any CRUD), or declares a `rowRoute` — a click **anywhere on a row** opens the record, not only on the id link. The cells that have a click of their own keep it, and a click there never opens the row:

- the **selection checkbox** (it selects);
- **inline editors** (`@InlineEditing` / editable columns — they edit);
- **display columns**: buttons, links, menus and action groups (`ColumnActionGroup`), components, and any column carrying its own `actionId` — they run their own action.

Enter on a focused row opens it too, and a navigable row shows a pointer cursor. Modified clicks (Ctrl/Shift/⌘) never open, so multi-select and new-tab gestures keep working; dragging rows (`@DragRows`) is unaffected. The same rule applies on every renderer — Vaadin, Redwood, React Native (the whole row is one button; display cells are their own buttons) and the IntelliJ plugin (a click on a non-display cell, a double click when the listing has multi-selection, or Enter).

A table whose rows expand a `@Details` panel on click keeps that click for expanding; the record then opens from its id link.

### The technical id is not a column

Once the whole row opens the record, the id column has no job left — it was the link — and a
generated id (`…-54211fd5db0c`, `4711`) tells the user nothing. So on a listing whose rows open by
click, the **reflected column of the row's declared id is left out**, and the first remaining column
becomes the row's link. The row data keeps the id: opening, selecting and deleting still read it.

The rule, the same in Java, .NET and Python:

- only a listing whose rows open by click (a `Navigable` listing, any CRUD, `editInDrawer`);
- only the row's **declared** id — the field marked `@PrimaryKey`, else the field named `id`
  (.NET `[Id]` / `Id`, Python `id`) — whatever its type; when the row has neither, Mateu falls back
  to the first field as the id, and that field is a business field: it stays;
- a **`@Label` on the id keeps it** — you named the column, so you want it shown (a business code:
  `@Label("Code") String id`; .NET `[Label("Code")]`, Python `Annotated[str, Label("Code")]`);
- never the only column, and never a column you list yourself (a fluent or YAML `Listing`'s
  `columns:` are shown as written).

### A row that opens somewhere else: a `rowRoute` that is a URL

A `rowRoute` is normally a route of the app (`people/${row.id}`). When it resolves to a **whole URL** — it starts with a scheme such as `https://`, or with `//` — the row leaves the app instead: a click opens that URL in a **new tab** (on React Native, in the phone's browser; in the IntelliJ plugin, in the system browser), and the app stays where it was. A row whose items have no page of their own can point at one that exists elsewhere:

```yaml
# a mission's photo gallery: each card opens the full-size photograph
type: Listing
gridLayout: cards
rowsSource: {ref: space-mission-gallery}
rowRoute: ${row.imageLarge}      # or https://images.nasa.gov/details/${row.nasaId}
columns:
  - {type: GridColumn, id: image, label: Photograph, stereotype: image}
  - {type: GridColumn, id: imageTitle, label: Title, identifier: true}
```

A template that is a single placeholder (`${row.imageLarge}`) takes the value as it is; a value inside a longer template is percent-encoded as a path segment (on every renderer), so `../../admin` or `x?y=1` cannot leave the mount or add a query. Only `http`, `https`, `mailto` and `tel` URLs are opened — a `javascript:` or `data:` value goes nowhere, the same rule as every other link that comes from data. In a table, the identifier column becomes an ordinary link to the URL with `target="_blank"`. A `mailto:` or `tel:` value opens the mail or phone app, from a click on the row and from its link alike. For an app route, the identifier link's address includes the app's mount (`/back-office/people/3` on an app mounted at `/back-office`), so opening it in a new tab lands on the same record.

---

## Editable listing — `Editable` without `Navigable`

`Editable<Editor, Id>` on its own is the "editable listing" idiom: clicking a row opens the editor **in a drawer sliding over the listing** (there is no detail page to navigate to), saving persists, closes the drawer, and refreshes the listing in place:

```java
@UI("/books")
public class Books implements Listing<Book>, Editable<Book, String> {

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
        return ListingData.from(store.all());
    }

    @Override
    public Book edit(String id, HttpRequest httpRequest) {
        return store.byId(id);   // the form shown in the drawer
    }

    @Override
    public String save(HttpRequest httpRequest) {
        var edited = httpRequest.getComponentState(Book.class);
        store.save(edited);
        return edited.id();      // the record id, to land back on the listing
    }
}
```

When the class declares **both** `Navigable` and `Editable`, the flow is the classic one instead: row click → read-only detail at `/:id` → Edit button → form at `/:id/edit`.

Add `Creatable<Book, String>` (`creationForm()` + `create()`) for the New button and `Deletable<String>` (`deleteAllById(ids, http)`) for selection + Delete — each is independent of the others.

### Undoable delete — `Restorable` (experimental)

A listing that can bring deleted records back declares `Restorable<Id>` next to `Deletable<Id>`.
Delete then **asks for no confirmation**: it deletes, and answers a toast — *"2 records deleted"* —
with an **Undo** button. Undo calls `restoreAllById(ids, http)` with the same ids and the listing
searches again (*"2 records restored"*). Without `Restorable`, Delete keeps asking first.

```java
@UI("/notes")
public class NotesCrud extends AutoCrud<Note> implements Restorable<String> {

    @Override
    public CrudStore<Note> store() { return notes; }

    @Override
    public void restoreAllById(List<String> ids, HttpRequest httpRequest) {
        notes.restore(ids);   // e.g. clear a soft-delete flag
    }
}
```

The same declaration works on an `AutoCrud`, a `Crud` and any capability listing; .NET declares
`IRestorable<TId>` (`RestoreAllById(ids)`) and Python `Restorable[str]` (`restore_all_by_id(ids)`).
Mateu ships UI only: how a record comes back is yours — a soft-delete flag, a trash table, a store
that keeps the removed rows for a while. Restore must accept ids it no longer holds (the toast may
be clicked late) and must not bring back what the caller could not delete; the server already
refuses the Undo of a CRUD that may not delete. The Undo runs the reserved action
`restore-deleted` with the ids in `_restoreIds` (`Restorable.RESTORE_ACTION` / `RESTORE_IDS`), on
every renderer that shows [undoable toasts](/ux-patterns/undo/).

Why a capability on the listing rather than a default method on `CrudStore`: Mateu has to know
**before** deleting whether an Undo can be offered (that is what drops the confirmation), and a
default method that throws can only be discovered by calling it — after the rows are gone.

---

## The full pack — `Crud` and `AutoCrud`

`Crud<View, Editor, CreationForm, Filters, Row, IdType>` is simply a `Listing` that declares **all** the capabilities:

```java
public abstract class Crud<View, Editor, CreationForm, Filters, Row, IdType>
    implements Listing<Row>,
        Searchable,
        Filterable<Filters>,
        Navigable<View, IdType>,
        Editable<Editor, IdType>,
        Creatable<CreationForm, IdType>,
        Deletable<IdType> { ... }
```

Extend it when every screen needs its own model — see [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/). And `AutoCrud<T>` / `FilteredAutoCrud<Filters, T>` derive the whole pack from a single entity plus a `CrudStore<T>` — capabilities are then **subtractive**: `@ReadOnly`, `@NotCreatable`, `@NotEditable`, `@NotDeletable`, `@NotNavigable` strip them one by one. See [AutoCrud&lt;T&gt;](/java-user-manual/build/auto-orchestrators/).

The three approaches are the same model at three altitudes:

| Approach | You bring | Capabilities |
|---|---|---|
| `Listing<Row>` + capability interfaces | Rows + one method per declared capability | **Additive** — start from nothing, declare what you need |
| `AutoCrud<T>` / `FilteredAutoCrud<F,T>` | An entity + a `CrudStore<T>` | **Subtractive** — start from everything, strip with `@Not*` / `@ReadOnly` |
| `Crud<V,E,C,F,R,Id>` | A model per screen + the lifecycle methods | **All declared** — full control over every screen's type |

## Choosing

- **`Listing` + capabilities** — when the rows come from a query service or an arbitrary data source, when rows differ from your domain model, or when you want *some* interactions but not a full CRUD (a read-only finder, an editable listing, a pick-and-delete queue). It is also the base of lookup [selectors](/ux-patterns/entity-picker/) and the search archetypes ([HeroSearch](/ux-patterns/hero-search/), [SmartSearchPage](/ux-patterns/smart-search/)).
- **`AutoCrud<T>`** — when a single entity backed by a `CrudStore` is the right model for every screen. Fastest path to a full CRUD; subtract what you don't want.
- **`Crud`** — when the view, editor, creation form, filters, and rows must be genuinely different types.

---

## Also on `Listing`

Independent of capabilities, a listing can:

- **Open empty** — a listing runs its search as soon as it opens. For a search-first page that should wait for the query, override `searchesOnOpening()` to return `false` (the `SmartSearchPage` and `HeroSearch` archetypes do; add `@Trigger(type = TriggerType.OnLoad, actionId = "search")` to preload them).
- **Force a layout** — override `gridLayout()` (`table`, `list`, `cards`, `masterDetail`, `tree`).
- **Toolbar actions** — `@Toolbar` and `@ListToolbarButton` methods become toolbar buttons; see [Listing&lt;Row&gt;](/java-user-manual/build/listing/).
- **Export** — override `pdfExportable()` / `excelExportable()` / `csvExportable()`.
- **Enable selection without Delete** — override `selectionEnabled()`.

---

## Next

- [Listing&lt;Row&gt;](/java-user-manual/build/listing/) — standalone listings: toolbar actions, export, selector support
- [AutoCrud&lt;T&gt;](/java-user-manual/build/auto-orchestrators/) — the entity-driven full pack
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — a separate model per screen
- [Filters & Listing](/ux-patterns/filters-and-listing/) — the smart search bar, typed filter widgets, and `CrudStore.find`

**See it live in the Explorer:** [Capability listings & whole-row click](https://explorer.mateu.io/behaviour/listings/capability-listings) · [Crud (capability listing)](https://explorer.mateu.io/archetypes/collections/crud)
