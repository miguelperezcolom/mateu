---
title: "Custom listing"
---

Build a listing screen with custom row types, row actions, toolbar buttons, and access to the HTTP request.

This case shows the `Listing<Filters, Row>` pattern, which gives you full control over what is shown and how data is fetched.

---

## What this case teaches

- how to use `Listing<Filters, Row>` for custom data sources
- how to define row types with actions and status badges
- how to add toolbar buttons that open forms
- how to access HTTP headers from an action (e.g., to extract a JWT)
- how to auto-trigger search on page load
- how to validate a form action with `@Action(validationRequired = true)`

---

## The pieces

- `ChangeRow` — the row type shown in the list
- `Changes` — the listing screen
- `CreateReleaseForm` — a form opened from the toolbar
- `ChangeQueryService` — the backend data source

---

## 1. The row type

```java
public record ChangeRow(
        @Hidden String id,
        String page,
        String country,
        String language,
        Status status,
        ColumnAction action
) implements Identifiable {}
```

Key points:

- `@Hidden` hides `id` from the table but makes it available for action routing
- `Status` renders as a colored badge, not plain text
- `ColumnAction` renders as an action button next to the row
- `implements Identifiable` is required for row selection and actions to work

---

## 2. The listing screen

```java
@Title("Changes")
@Service
@Scope("prototype")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("max-width:900px;margin: auto;")
public class Changes extends Listing<NoFilters, ChangeRow> {

    final ChangeQueryService queryService;
    final CreateReleaseForm createReleaseForm;

    @Override
    public ListingData<ChangeRow> search(
            String searchText,
            NoFilters filters,
            Pageable pageable,
            HttpRequest httpRequest) {

        var found = queryService.findAll(searchText, filters, pageable);
        return ListingData.<ChangeRow>builder()
                .page(Page.<ChangeRow>builder()
                        .searchSignature(found.page().searchSignature())
                        .totalElements(found.page().totalElements())
                        .pageSize(found.page().pageSize())
                        .pageNumber(found.page().pageNumber())
                        .content(found.page().content().stream()
                                .map(dto -> new ChangeRow(
                                        dto.pageId(),
                                        dto.page(),
                                        dto.country(),
                                        dto.language(),
                                        new Status(mapStatus(dto.status()), dto.status().name()),
                                        new ColumnAction("compare", "Compare")))
                                .toList())
                        .build())
                .build();
    }

    public Object compare(ChangeRow row) {
        var result = new ComparisonResult("x", "x", "x", "x", 1);
        return new ComparisonResultPage(result);
    }

    private StatusType mapStatus(ChangeStatus status) {
        if (status == ChangeStatus.Released) return StatusType.SUCCESS;
        return StatusType.DANGER;
    }

    @Toolbar
    public CreateReleaseForm createRelease(
            List<ChangeRow> selectedRows,
            HttpRequest httpRequest) {

        var auth = httpRequest.getHeaderValue("Authorization");
        var jwt = auth.split(" ")[1];
        String[] chunks = jwt.split("\\.");
        var payload = fromJson(new String(Base64.getUrlDecoder().decode(chunks[1])));
        var user = payload.get("preferred_username").toString();

        return createReleaseForm.withUser(user);
    }
}
```

Key points:

- `extends Listing<NoFilters, ChangeRow>` gives full control: you define `search()` and Mateu calls it
- `NoFilters` means no filter form above the list; replace it with a custom record to add filters
- `@Scope("prototype")` is required because the class holds state per request
- `@Trigger(type = TriggerType.OnLoad, actionId = "search")` automatically triggers `search()` when the page loads, so the list is not empty on first visit
- `compare(ChangeRow row)` handles the `ColumnAction("compare", ...)` defined in the row
- `@Toolbar` on `createRelease()` adds a button to the top toolbar of the listing
- `HttpRequest httpRequest` in `@Toolbar` methods gives access to HTTP headers

### Extracting the current user from the JWT

```java
@Toolbar
public CreateReleaseForm createRelease(
        List<ChangeRow> selectedRows,
        HttpRequest httpRequest) {

    var auth = httpRequest.getHeaderValue("Authorization");
    var jwt = auth.split(" ")[1];
    String[] chunks = jwt.split("\\.");
    var payload = fromJson(new String(Base64.getUrlDecoder().decode(chunks[1])));
    var user = payload.get("preferred_username").toString();

    return createReleaseForm.withUser(user);
}
```

This pattern lets you access the logged-in user (or any other header value) inside a toolbar action.

The first selected rows are passed as `List<ChangeRow> selectedRows`, making it straightforward to act on selected items.

---

## 3. The toolbar form

```java
@Service
@Title("Create release")
@Style("max-width:900px;margin: auto;")
public class CreateReleaseForm {

    @ReadOnly
    String user;

    @NotNull
    String site;

    @NotEmpty
    String name;

    @Toolbar
    @Action(validationRequired = true)
    Object create() {
        var businessKey = UUID.randomUUID().toString();
        return URI.create("/workflow/processes/" + businessKey + "?returnTo=/controlPlane/releases");
    }

    public CreateReleaseForm withUser(String user) {
        this.user = user;
        return this;
    }
}
```

Key points:

- `@ReadOnly` on `user` makes the field visible but not editable; it is populated from the JWT before the form is shown
- `@Action(validationRequired = true)` ensures validation runs before `create()` is called
- `@Toolbar` places the `create` button in the form toolbar (as opposed to a regular `@Button`)
- Returning a `URI` navigates the user to that URL

---

## How the pieces connect

```
Changes (Listing<NoFilters, ChangeRow>)
  └── search() → ChangeQueryService → maps DTOs to ChangeRow
  └── compare(ChangeRow) → opens ComparisonResultPage
  └── createRelease() [@Toolbar] → opens CreateReleaseForm (pre-filled from JWT)
        └── create() [@Toolbar, @Action] → navigates to workflow URL
```

---

## When to use `Listing` vs `AutoCrud`

| Pattern | When to use |
|---------|-------------|
| `AutoCrud<T>` | Data fits a single model; standard CRUD operations |
| `Listing<Filters, Row>` | Custom data source, rows differ from domain model, no standard CRUD |

---

## 4. Enabling export

Override `pdfExportable()`, `excelExportable()`, or `csvExportable()` to show export buttons in the toolbar. The framework calls `search()` with the current filters and produces the file.

```java
public class Changes extends Listing<NoFilters, ChangeRow> {

    @Override
    public boolean csvExportable() { return true; }

    @Override
    public boolean excelExportable() { return true; }

    // search() is reused for export — no extra method needed
    @Override
    public ListingData<ChangeRow> search(...) { ... }
}
```

All three methods default to `false`; override only the formats you want to expose.

---

## Mental model

- `Listing<Filters, Row>` = custom list, you control the data
- `NoFilters` = no filter form; replace with a record for custom filters
- `@Trigger(OnLoad, "search")` = auto-run search on page load
- `@Toolbar` on a method = button in the list toolbar (receives selected rows)
- Row action methods are matched by the `actionId` in `ColumnAction`
- `HttpRequest` in action parameters gives access to headers
- `pdfExportable()` / `excelExportable()` / `csvExportable()` = add export buttons, reuse `search()` data

---

## Next

- [Nested CRUD](/java-user-manual/use-cases/nested-crud/)
- [Listings (fluent API)](/java-user-manual/concepts/fluent-components/fluent-listings/)
- [Listing row actions](/java-user-manual/build/listing-row-actions/)
