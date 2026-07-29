---
title: "Listings and capabilities"
description: "Start with rows, declare capabilities: search, filters, navigation, editing, creation, and deletion are opt-in interfaces on a Listing — a Crud is simply the full pack."
---

Every collection screen in Mateu is built on one idea: **you start with rows, and every further feature is a capability you declare on the class**. A read-only grid, a searchable catalogue, an editable listing, a full CRUD — they are all the same `Listing`, differing only in which capability interfaces the class implements.

---

## The core contract

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
    Pageable pageable              // page, size, sort
) {}
```

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
@Trigger(type = TriggerType.OnLoad, actionId = "search")
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

- **Auto-load on open** — `@Trigger(type = TriggerType.OnLoad, actionId = "search")` on the class (a listing otherwise starts empty and searches on enter).
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
