# Mateu — AI Reference (Full)

Mateu is a model-driven UI framework for Java. You annotate Java classes with `@UI` and Mateu generates forms, CRUD screens, navigation, and a full web UI automatically. Developers write zero frontend code for typical business apps.

**Dependency (Spring Boot MVC):**
```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mvc</artifactId>
  <version>LATEST</version>
</dependency>
```

---

## Core mental model

| Java concept | UI result |
|---|---|
| Class annotated with `@UI` | A routed page |
| `String`, `int`, `boolean`, `LocalDate`, enum field | Form field |
| `List<SomeRecord>` field | Grid / table |
| Nested class/record field | Subform (card inside form) |
| Method annotated with `@Button` or `@Toolbar` | Button |
| Method annotated with `@RowAction` | Per-row action in a grid |

**Key rules:**
- `@UI("/path")` → page mounted at that URL. `@UI("")` → root page.
- `HttpRequest` can be added to any method signature; Mateu injects it automatically.
- Bean validation (`@NotNull`, `@NotEmpty`, `@Min`, `@Max`, `@Pattern`) is applied client-side and server-side automatically.
- Labels auto-derive from field names (`lastName` → "Last Name"); override with `@Label("...")`.
- Any string label supports `${state.field}` / `${data.field}` template expressions.

---

## Minimal working example

```java
@UI("/hello")
@Title("My App")
public class HelloForm {
    @NotEmpty String name;

    @Button
    Message greet() { return new Message("Hello " + name); }
}
```

---

## App structure annotations

### `@UI`
Registers a class as a routed page.
```java
@UI("/orders")           // mounted at /orders
@UI("")                  // root
@UI("/customer/:id")     // path variable :id
```

### `@App`
Marks a class as the application shell.
```java
@App(value = AppVariant.AUTO, themeToggle = true)
```
`AppVariant` values: `AUTO` (auto-select), `HAMBURGUER_MENU`, `MENU_ON_LEFT`, `MENU_ON_TOP`, `TABS`, `MEDIATOR`.
`themeToggle = true` adds a moon/sun button to the header for dark/light mode switching. The user's choice persists in `localStorage`; the OS `prefers-color-scheme` is the default when no choice is stored.

### `@Title` / `@Subtitle` / `@PageTitle`
```java
@Title("Orders")           // heading inside the page
@Subtitle("All orders")    // subheading
@PageTitle("Orders — MyApp") // browser tab title
```

### `@Logo` / `@FavIcon`
```java
@Logo("/images/logo.svg")
@FavIcon("/images/favicon.ico")
```

### `@DrawerClosed`
Starts the navigation drawer in the closed state.

### `@KeycloakSecured`
```java
@KeycloakSecured(url="https://auth.example.com", realm="myrealm", clientId="myapp")
```

### `@AI`
Embeds an AI chat assistant.
```java
@AI(sse = "/api/ai/chat")
```

### `@ConfirmOnNavigationIfDirty`
Warns the user before leaving a form that has unsaved changes. The confirmation covers **every** way of leaving the form: in-app menu navigation, the browser back/forward buttons (URL is restored on cancel), and reloading or closing the tab. CRUD create/edit views opt in automatically.
```java
@UI("/customer/:id")
@ConfirmOnNavigationIfDirty
public class CustomerForm {
    String name;
    String email;

    @Toolbar @Action(validationRequired = true)
    Object save() {
        repo.save(name, email);
        return List.of(new Message("Saved"), UICommand.markAsClean()); // clear dirty flag after save
    }
}
```
Control the dirty state programmatically by returning `UICommand.markAsClean()` (clear, e.g. after a successful save) or `UICommand.markAsDirty()` (set) from any action. A backend-driven navigation (`NavigateTo`) clears the flag instead of prompting.

---

## Layout annotations

### `@Section`
Groups fields under a visible heading. New section starts at each `@Section`, ends at the next.
```java
@Section("Personal data")
String firstName;
String lastName;

@Section(value = "Contact", columns = 2, zone = "left")
String email;
String phone;
```
Attributes: `value` (required), `columns` (default 1), `style`, `zone`.

### `@Zones` / `@Zone`
Side-by-side columns. Sections are assigned to zones via `@Section(zone="name")`.
```java
@Zones({
    @Zone(name = "left",  width = "64%"),
    @Zone(name = "right", width = "36%")
})
```
Sections whose `zone` does not match any declared zone fall into a trailing flexible column.

### `@Compact`
High-density mode — tighter controls, smaller spacing, compressed labels, smaller form-layout minimum column width (7em vs default), compact grid row density. Opt-in and non-breaking.
```java
@Compact
```
Alternatively apply `@Style(StyleConstants.COMPACT)` to a specific field for partial dense mode.

### `@Inline`
Expands a nested type's fields directly into the parent section without adding a card wrapper. If the nested class has `@Toolbar` methods, those buttons appear on the section title row; `@Button` methods appear below the section content.
```java
@Section("Guests") @Inline @Label("")
GuestSection guests = new GuestSection();
```

### `@FoldedLayout`
Each `@Section` becomes a collapsible panel.

### `@Tabs` / `@Tab`
```java
@Tabs
public class SettingsPage {
    @Tab("General") String language;
    @Tab("Security") String password;
}
```

### `@Accordion` / `@AccordionPanel`
```java
@Accordion(opened = 0)
public class SettingsPage {
    @AccordionPanel(summary = "General") String language;
    @AccordionPanel(summary = "Notifications") boolean email;
}
```

### `@FormLayout`
Multi-column form.
```java
@FormLayout(columns = 3)
```

### `@SplitLayout`
Two-panel resizable split.

### `@HorizontalLayout` / `@VerticalLayout`
Arrange content in a row or column.

### `@Scroller`
```java
@Scroller(direction = "vertical")
```

### `@Colspan`
```java
@Colspan(2) List<LineItem> lines;  // spans 2 columns
```

### `@ColumnWidth`
```java
@ColumnWidth("120px") String id;   // fixed-width grid column
```

### `@MasterDetail`
```java
@MasterDetail(minHeightWhenDetailVisible = "500px")
List<OrderRow> orders;
```

### `@DetailFormCustomisation`
```java
@DetailFormCustomisation(position = FormPosition.right, columns = 1)
List<OrderRow> orders;
```
`FormPosition` values: `right`, `left`, `top`, `bottom`, `modal`, `modalLeft`, `modalRight`.

### `@DivStyle`
Applies CSS to the wrapping div (vs `@Style` which targets the element itself).

---

## Action annotations

### `@Button`
Button at the bottom of the form.
```java
@Button(buttonStyle=ButtonStyle.primary, buttonColor=ButtonColor.success, order=1)
Object save() { ... }
```
Attributes: `buttonStyle`, `buttonColor`, `buttonSize`, `group`, `separatorBefore`, `order`.
Methods sharing the same `group` collapse into a dropdown button.

### `@Toolbar`
Button in the toolbar strip at the top of the page.
```java
@Toolbar(order=1)
@Action(validationRequired=true)
Object save() { ... }
```
Same attributes as `@Button`.

### `@Action`
Attaches configurable behaviour to a method.
```java
@Action(
    validationRequired = true,
    confirmationRequired = true,
    confirmationTitle = "Delete?",
    confirmationMessage = "This cannot be undone.",
    confirmationText = "Delete",
    confirmationDenialText = "Cancel",
    background = true,   // fire-and-forget: no busy indicator (orthogonal to streaming)
    sse = true,          // stream over SSE — auto-enabled when the method returns a Flux<?>
    shortcut = "ctrl+s"  // keyboard shortcut
)
```

### `@RowAction`
Per-row action in a listing.
```java
@RowAction
void approve(OrderRow row) { service.approve(row.id()); }
```

### `@ListToolbarButton`
Listing toolbar button acting on selected rows.
```java
@ListToolbarButton(confirmationRequired=false, rowsSelectedRequired=true)
Object export(List<Product> selection) { ... }
```

### `@ViewToolbarButton`
Toolbar button on a detail/editor screen.

### `@AutoSave`
Auto-saves on field change (debounced).
```java
@AutoSave(debounceMillis=800, action="save")
```

### `@WizardCompletionAction`
Final action in a wizard flow.

### `@Banner`
Message block rendered below the page header and above the first section.
```java
@Banner(theme = BannerTheme.WARNING, title = "Maintenance", closeable = true, timeoutSeconds = 30)
String notice() { return scheduled ? "Maintenance on Sunday 02:00 UTC." : null; }
```
`BannerTheme` values: `INFO`, `SUCCESS`, `WARNING`, `DANGER`, `NONE`.
Return `String` for dynamic description; return `void` for always-visible banner using `title`.

### `@Fab`
Floating action button fixed to the bottom-right corner.
```java
@Fab(icon="vaadin:plus", label="New order", order=0)
Object newOrder() { return new CreateOrderForm(); }
```
App-level: global FAB at `right: 1.5rem`. Page-level: scoped FAB at `right: 5.5rem`.

---

## Display & field type annotations

### `@KPI`
Renders a field as a KPI tile (large metric number for dashboards).

### `@PlainText`
Renders a field as plain read-only text — no input borders, no background.

### `@Multiline`
Allows a `@PlainText` field to wrap instead of truncate.

### `@Badge`
Renders a boolean field as a coloured chip **in the form body** — lit when `true`, muted when `false`.

### `@BadgeInHeader`
Renders a field as a status chip **in the page header strip** (excluded from form layout).
```java
@BadgeInHeader(label="VIP", color="success", primary=true, small=true, pill=true)
boolean vip;
```
For a `String` field the badge text = field value; `null`/blank hides it.

### `@Status` / `@StatusMapping`
Enum field rendered as a coloured badge.
```java
@Status(
    defaultStatus = StatusType.NONE,
    mappings = {
        @StatusMapping(from="ACTIVE",   to=StatusType.SUCCESS),
        @StatusMapping(from="INACTIVE", to=StatusType.DANGER)
    }
)
ItemStatus status;
```

### `@Stereotype` / `@Representation`
Control the input widget (`@Stereotype`) and read-only display (`@Representation`) independently.
`FieldStereotype` values: `regular`, `radio`, `checkbox`, `textarea`, `toggle`, `combobox`, `select`, `email`, `password`, `richText`, `listBox`, `html`, `markdown`, `image`, `icon`, `link`, `money`, `grid`, `color`, `choice`, `popover`, `slider`, `button`, `stars`, `searchable`, `badge`, `plainText`.

### Money formatting — `@Stereotype(FieldStereotype.money)`
Mark a numeric field (`BigDecimal`, `double`, `long`, …) with `@Stereotype(FieldStereotype.money)` so it is rendered as a formatted currency amount. In a **read-only / plain-text context** (the field or its declaring class is `@PlainText`) the field keeps the dense plain-text rendering but the number is formatted with a thousands separator and 2 decimals (`de-DE` style by default — e.g. `1.250,00`). Fields of type `Amount` (which carry their own `currency` + `locale`) are formatted as full currency automatically without needing the stereotype.
```java
@PlainText
public class FoliosSection {
    @Stereotype(FieldStereotype.money) @Label("Credit limit")  BigDecimal creditLimit;  // → 1.250,00
    @Stereotype(FieldStereotype.money) @Label("Balance due")   BigDecimal balanceDue;
}
```

### `@ReadOnly`
Non-editable field (shown but cannot be modified).

### `@Hidden` / `@HiddenInList` / `@HiddenInCreate` / `@HiddenInEditor` / `@HiddenInView`
Hide a field in all or specific contexts.

### `@Disabled`
Disables a field or button.

### `@EditableOnlyWhenCreating`
Field is editable only on record creation; read-only on edit.

### `@Details`
Wraps a field in a collapsible details/summary component.
```java
@Details(summary="Internal notes", opened=false)
String notes;
```

### `@H1` – `@H5`
Renders a `String` field as a heading.

### `@Text`
Renders a `String` field as static text.

---

## Metadata annotations

### `@Label`
```java
@Label("Full name") String name;
@Label("Save customer") @Button void save() { ... }
```

### `@Help`
Tooltip or helper text.
```java
@Help("Enter VAT including country prefix, e.g. ES12345678A")
String vat;
```

### Expression interpolation
Any label string supports `${state.field}` and `${data.field}` JS template expressions:
```java
@Tab("${state.guestName} — Details")
@Section("Room ${state.roomNumber}")
@Label("Email ${state.name}")
```
Available context vars: `state`, `data`, `appState`, `appData`.

---

## Styling annotations

### `@Style`
Inline CSS on the element.
```java
@Style("max-width: 900px; margin: auto;")
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
```
`StyleConstants` values: `CONTAINER` (900px centered), `FULL_WIDTH`, `FULL_WIDTH_WITH_PADDING`, `COMPACT`.

### `@CssClasses`
CSS class names.

### `@DivStyle`
Inline CSS on the wrapping `<div>`.

---

## Trigger annotation

```java
@Trigger(type = TriggerType.OnLoad, actionId = "load")
@Trigger(type = TriggerType.OnLoad, actionId = "load", timeoutMillis = 0)
@Trigger(type = TriggerType.OnSuccess, actionId = "poll", calledActionId = "poll", timeoutMillis = 10000)
@Trigger(type = TriggerType.OnEnter)   // fire an action when user presses Enter
```
`TriggerType` values: `OnLoad`, `OnSuccess`, `OnEnter`, `OnChange`.

---

## Validation

### Bean validation (automatic)
```java
@NotNull String name;
@NotEmpty String email;
@Min(1) @Max(100) int quantity;
@Pattern(regexp="[A-Z]{2}\\d{6}") String code;
```

### `@Validation` (cross-field, declarative)
```java
@Validation(filter="endDate < startDate", field="endDate", message="End must be after start")
public class BookingForm { ... }
```

### `ValidationSupplier` (cross-field, programmatic)
```java
public class BookingForm implements ValidationSupplier {
    @Override
    public List<Validation> validations() {
        return List.of(new Validation("endDate < startDate", "endDate", "End must be after start"));
    }
}
```

---

## Rules (conditional visibility / enable)

### `@Rule` (declarative)
```java
@Rule(filter="accountType == 'BUSINESS'", field="vatNumber",
      attribute=RuleFieldAttribute.visible, value="true")
```
`RuleFieldAttribute` values: `visible`, `enabled`, `required`, `readonly`, `value`.

### `RuleSupplier` (programmatic)
```java
public class AccountForm implements RuleSupplier {
    @Override
    public List<Rule> rules() {
        return List.of(Rule.builder()
            .filter("accountType == 'BUSINESS'")
            .action(RuleAction.set)
            .fieldName("vatNumber")
            .fieldAttribute(RuleFieldAttribute.visible)
            .value("true")
            .build());
    }
}
```

---

## Action return types

| Return | Effect |
|---|---|
| `void` / `null` | Stay on current page, no visual change |
| `URI.create("/path")` | Browser navigates to that URL |
| `new Message("text")` | Toast notification (bottom of screen) |
| `Message.builder().text("...").build()` | Same, builder form |
| Any Java object (form, listing, etc.) | Mateu navigates to that object as a new view |
| `new State(this)` | Push updated field values to frontend without navigating |
| `PageBanner` | Show banner on current page (replaces previous action banners) |
| `List<PageBanner>` | Same, multiple banners |
| `PageBanners.replace(banner...)` | Explicit replace |
| `PageBanners.append(banner...)` | Accumulate banners across action calls |
| `UICommand.markAsClean()` | Clear the unsaved-changes flag (e.g. after a successful save) |
| `UICommand.markAsDirty()` | Flag the form as having unsaved changes |

---

## CRUD patterns

### AutoCrud — zero boilerplate
```java
@UI("/products")
public class Products extends AutoCrud<Product> {}

record Product(
    @NotEmpty @EditableOnlyWhenCreating String id,
    @NotEmpty String name,
    double price,
    @Status(...) ProductStatus status
) implements Identifiable {}
```

### Repository — `CrudRepository<T>`
```java
class ProductRepository implements CrudRepository<Product> {
    public Optional<Product> findById(String id) { /* ... */ }
    public String save(Product e) { /* persist */ return e.id(); }
    public List<Product> findAll() { /* ... */ }
    public void deleteAllById(List<String> ids) { /* ... */ }

    // DEFAULT method: search + filter + sort + paginate -> Page<T>.
    // Default impl filters findAll() by searchText (Searchable/toString),
    // sorts by pageable.sort(), paginates in memory. Override for DB-side paging.
    // Page<T> carries totalElements, so no separate count() is needed.
    // public Page<Product> find(String searchText, Product filters, Pageable pageable) { ... }
}
```
`AutoCrud` calls `repository().find(...)` to fill the listing. `Page<T>` =
`(String searchSignature, int pageSize, int pageNumber, long totalElements, List<T> content)`;
`Pageable` = `(int page, int size, List<Sort> sort)`, `Sort` = `(String field, Direction direction)`.

### Custom listing with search
```java
@UI("/orders")
@Title("Orders")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class Orders extends Listing<OrderFilters, OrderRow> {

    @Override
    public ListingData<OrderRow> search(
            String searchText, OrderFilters filters,
            Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(repo.findAll(searchText, filters, pageable));
    }

    @Override
    public GridLayout gridLayout() { return GridLayout.table; }
}

record OrderFilters(String status, LocalDate from, LocalDate to) {}
record OrderRow(
    @ColumnWidth("80px") String id,
    String customer,
    @ColumnWidth("100px") double total,
    String status
) {}
```

`GridLayout` values: `auto`, `table`, `list`, `cards`, `masterDetail`.

### Export support
```java
public class OrdersListing extends Listing<OrderFilters, OrderRow> {
    @Override public boolean csvExportable()   { return true; }
    @Override public boolean excelExportable() { return true; }
    @Override public boolean pdfExportable()   { return true; }
}
```
Add `export-excel` and `export-pdf` Maven dependencies to enable those buttons.

### CRUD URL pagination
Mateu syncs page, sort, and filter to the URL automatically:
`/orders?page=2&sort=date:desc&status=PENDING`
No code needed — deep-linking and browser back/forward work out of the box.

---

## Form with load trigger

```java
@UI("/customer/:id")
@Title("Customer")
@Trigger(type = TriggerType.OnLoad, actionId = "load")
public class CustomerForm {
    String name;
    String email;

    Object load(HttpRequest req) {
        var c = repo.find(req.pathVariable("id"));
        name = c.name(); email = c.email();
        return new State(this);
    }

    @Toolbar
    @Action(validationRequired = true)
    Object save() {
        repo.save(name, email);
        return new Message("Saved");
    }
}
```

---

## Wizard

Extend `Wizard` and declare one field per step; each field type must implement `WizardStep`.
The **penultimate** step shows the `@WizardCompletionAction` button. The **last** step is a read-only result screen (no nav buttons, progress bar = 100%). The last step is auto-instantiated if `null` when completion runs.

```java
@UI("/signup")
@Title("Create account")
public class SignupWizard extends Wizard {
    AccountStep account = new AccountStep();
    PlanStep    plan    = new PlanStep();
    ResultStep  result;  // auto-instantiated or set explicitly

    @WizardCompletionAction
    @Action(validationRequired = true)
    Object finish() {
        service.create(account, plan);
        return null;
    }
}

class AccountStep implements WizardStep {
    @NotEmpty String email;
    @NotEmpty String password;
}
class PlanStep implements WizardStep {
    @NotNull PlanType plan;
}
class ResultStep implements WizardStep {
    @PlainText String summary = "Account created successfully!";
}
```

### Branching (conditional steps)

Override `stepApplies(String stepFieldName)` to skip steps based on the answers so far — evaluated on every render/navigation, skipped in both directions, excluded from the progress bar and from the accordion/recap layouts. The result step always applies; if the penultimate step is skipped, the completion button moves to the last applicable step.

```java
@Override
protected boolean stepApplies(String stepFieldName) {
    if ("company".equals(stepFieldName)) {
        return account.accountType == AccountType.COMPANY;   // skip for personal accounts
    }
    return true;
}
```

---

## Dashboard

Extend `Dashboard` for a landing page with a KPI band and a responsive grid of titled panels:

```java
@UI("/dashboard")
@Title("Sales dashboard")
public class SalesDashboard extends Dashboard {

    // Consecutive MetricCard fields → one full-width Scoreboard band
    MetricCard revenue = MetricCard.builder()
            .title("Revenue").value("1.2").unit("M€")
            .trend(MetricTrend.up).trendLabel("+8% vs last month")   // green ▲
            .icon("vaadin:dollar")
            .build();

    MetricCard orders = MetricCard.builder()
            .title("Orders").value("3,421")
            .actionId("openOrders")            // clickable → runs the @Action below
            .build();

    // @Panel component fields → titled tiles; colSpan/rowSpan control the footprint
    @Panel(title = "Monthly sales", subtitle = "Units sold per month", colSpan = 2)
    Chart sales = Chart.builder()
            .chartType(ChartType.bar)
            .chartData(ChartData.builder()
                    .labels(List.of("Jan", "Feb", "Mar"))
                    .datasets(List.of(ChartDataset.builder()
                            .label("2026").data(List.of(120d, 190d, 300d)).build()))
                    .build())
            .build();

    @Panel(title = "Notes")
    Markdown notes = new Markdown("- Summer campaign starts **July 15th**", null, null);

    @Action
    Object openOrders() { return URI.create("/orders"); }
}
```

- `MetricCard` fields: `title`, `value`, `unit`, `trend` (`up`/`down`/`neutral`), `trendLabel`, `icon`, `description`, `actionId` (drill-in).
- Override `columns()` to fix the grid column count; default `0` = responsive auto-fit.
- Populate fields in the constructor / initializers (query use cases or repositories there).
- Fluent variant: build a `DashboardLayout` with `Scoreboard` / `DashboardPanel` / `MetricCard` items from `ComponentTreeSupplier.component(...)`.

---

## Foldout record page

Extend `Foldout` for a record workspace: a fixed overview panel on the left plus lateral fold-out panels with categories of associated information (Redwood foldout pattern):

```java
@UI("/booking/:id")
@Title("Booking 2026-08117")
public class BookingFoldout extends Foldout {

    // First component field without @Panel → the always-visible overview (left)
    Markdown overview = new Markdown("**Guest:** Jane Smith\n**Dates:** 12–19 Aug", null, null);

    @Panel(title = "Payments", subtitle = "Charges and refunds")
    Markdown payments = new Markdown("| Date | Amount |\n|---|---|\n| 02/05 | 620 € |", null, null);

    @Panel(title = "Occupancy")
    Chart occupancy = Chart.builder().chartType(ChartType.line) /* … */ .build();

    @Panel(title = "Notes", open = false)   // starts folded (narrow strip)
    Markdown notes = new Markdown("- Late checkout", null, null);
}
```

- Closed panels render as a narrow strip with the rotated title; clicking folds them out. Several panels can be open side by side; the row scrolls horizontally on overflow.
- `@Panel` attributes here: `title` (defaults to field label), `subtitle`, `icon`, `open` (default `true`).
- Fluent variant: `FoldoutLayout.builder().overview(component).panels(List.of(FoldoutPanel.builder().title("…").open(false).content(component).build())).build()`.

---

## Hero search page

Extend `HeroSearch<Filters, Row>` for a search-first landing page: a big centered hero header, a prominent search box with filter facets, and results as cards:

```java
@UI("/hotel-search")
@Title("Hotel search")
public class HotelSearch extends HeroSearch<HotelFilters, Hotel> {

    public record HotelFilters(String zone, Integer minStars) {}   // fields become the facet bar
    public record Hotel(String name, String zone, int stars, String price) {}  // one card per row

    @Override protected String heroTitle() { return "Find your hotel"; }
    @Override protected String heroSubtitle() { return "Search by name or zone…"; }
    // @Override protected String heroImage() { return "/images/hero.jpg"; }   // optional background

    @Override
    public ListingData<Hotel> search(String searchText, HotelFilters filters,
                                     Pageable pageable, HttpRequest httpRequest) {
        // query your use case / repository; return a ListingData page
    }
}
```

- Implement `search(...)` exactly like a declarative `Listing` — same contract, same pagination.
- Results render as **cards** by default; override `gridLayout()` for `table`/`list`.
- The listing starts **empty** and searches on enter; add `@Trigger(type = TriggerType.OnLoad, actionId = "search")` to preload results.
- `HeroSection` is also a standalone fluent component: `HeroSection.builder().title("…").subtitle("…").image("…").centered(true).content(List.of(…)).build()` — compose it in welcome pages or any `ComponentTreeSupplier`.

---

## Item overview page

Extend `ItemOverview` to keep the item's key information pinned in a sticky left panel while the rest of the page is organised in tabs:

```java
@UI("/product/:id")
@Title("Ergonomic chair EC-200")
public class ProductOverview extends ItemOverview {

    // First component field without @Panel → key-info panel (left, sticky while scrolling)
    Markdown keyInfo = new Markdown("### EC-200\n**SKU:** EC-200-BLK · **Price:** 349 €", null, null);

    // @Panel fields → tabs on the right (label defaults to the field label)
    @Panel(title = "Sales")          Chart sales = Chart.builder()/* … */.build();
    @Panel(title = "Specifications") Markdown specs = new Markdown("…", null, null);
    @Panel(title = "Reviews")        Markdown reviews = new Markdown("…", null, null);
}
```

- Override `panelWidth()` (default `"22rem"`) to size the key-info panel.
- Pick by need: read-mostly detail → `ItemOverview`; editable → `AutoEditableView`; categories visible simultaneously → `Foldout`; long single flow with index → `@Toc` + sticky sections.

---

## Inline editing on CRUD listings

Annotate the `AutoCrud` class with `@InlineEditing` to edit rows directly in the listing grid — each committed cell persists its row through the repository, no detail-form round-trip:

```java
@UI("/stock")
@Title("Stock (edit in place)")
@InlineEditing
public class StockCrud extends AutoCrud<StockItem> {

    @Override public GridLayout gridLayout() { return GridLayout.table; }  // cell editing lives in the table layout

    @Override public CrudRepository<StockItem> repository() { /* … */ }
}
```

- Editors derive from each field's Java type (same mapping as editable tables); `@ReadOnly` fields stay display-only.
- Each commit dispatches `update-row` with the edited row; `AutoCrud` rebuilds the entity and calls `repository().save(entity)`. Override `updateRow(Map, HttpRequest)` for partial updates / optimistic locking.
- For **form collections** (a `List` field inside a form) use `@InlineEditing` on the field instead — edits accumulate in the form state and persist with the form's action.

---

## Gantt / timeline

Show time-based work as bars on a shared time axis — read-only monitoring of schedules:

```java
@Section("Schedule")
Component plan = Gantt.builder()
        .tasks(List.of(
                GanttTask.builder().title("Discovery")
                        .start(LocalDate.of(2026, 6, 1)).end(LocalDate.of(2026, 6, 12))
                        .progress(100).build(),
                GanttTask.builder().title("Implementation")
                        .start(LocalDate.of(2026, 7, 1)).end(LocalDate.of(2026, 8, 14))
                        .progress(25).build(),
                GanttTask.builder().title("QA & launch")
                        .start(LocalDate.of(2026, 8, 17)).end(LocalDate.of(2026, 8, 31))
                        .color("#10b981").build()))
        .build();
```

The axis, month headers and today marker derive from the tasks' dates; `progress` renders as a fill inside the bar; `color` overrides the fill color. Dependency-free and dark-mode aware.

---

## Empty states & skeletons

Never show a blank void — `EmptyState` for "nothing here yet", `Skeleton` while content loads:

```java
@Section("Bookings")
Component empty = EmptyState.builder()
        .icon("📭").title("No bookings yet")
        .description("When you create a booking it will show up here.")
        .actionId("createBooking").actionLabel("Create your first booking")
        .build();

@Action Object createBooking() { return URI.create("/bookings/new"); }

Component loading = new HorizontalLayout(
        Skeleton.builder().variant(SkeletonVariant.form).count(3).build(),
        Skeleton.builder().variant(SkeletonVariant.grid).count(5).build());
```

- Listings/grids render the empty-state block automatically when they have no rows; `Listing.emptyStateMessage` customises the message.
- `Skeleton` variants: `text` (lines), `card` (tile), `grid` (rows), `form` (label + field pairs); `count` repeats the shape. Typical use: initial value of a component field that an `OnLoad` action replaces with real content.

---

## Welcome page

Extend `Welcome` for a friendly entry point to a flow — hero + call-to-action buttons + highlight tiles:

```java
@UI("/welcome")
@Title("Welcome")
public class WelcomeDemo extends Welcome {

    // Button fields → CTAs inside the hero; the actionId runs the matching @Action method
    Button start = Button.builder().label("Start check-in")
            .actionId("startCheckin").buttonStyle(ButtonStyle.primary).build();

    // @Panel component fields → highlight tiles on a responsive grid below the hero
    @Panel(title = "1 · Search the booking")
    Markdown step1 = new Markdown("Find the reservation by locator, guest name or room.", null, null);

    @Override protected String heroTitle() { return "Front desk check-in"; }
    @Override protected String heroSubtitle() { return "Everything you need, in three steps"; }

    @Action
    Object startCheckin() { return URI.create("/checkin"); }   // navigate into the flow
}
```

Use for occasional/first-time users at a flow's entry route; power users are better served by a `Dashboard` or the operational screen directly.

---

## Navigation & menus

```java
@UI("/app")
@App(AppVariant.HAMBURGUER_MENU)
@Logo("/logo.svg")
@FavIcon("/favicon.svg")
public class MyApp {
    @Menu Customers customers;
    @Menu Orders orders;
    @Menu Reports reports;
}
```

---

## Dense multi-zone screen

```java
@UI("/checkin/:id")
@Compact
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@ConfirmOnNavigationIfDirty
@Zones({
    @Zone(name = "left",  width = "64%"),
    @Zone(name = "right", width = "36%")
})
public class CheckInForm {

    @Section(value = "Reservation", columns = 4, zone = "left")
    @ReadOnly @PlainText String locator;
    @ReadOnly @PlainText String hotel;

    @Section(value = "Guests", columns = 1, zone = "left")
    @Inline @Label("")
    GuestSection guests = new GuestSection();

    @Section(value = "Amounts", columns = 1, zone = "right")
    @PlainText
    @Stereotype(FieldStereotype.money) @Label("Credit limit") BigDecimal creditLimit; // → 1.250,00
    @Stereotype(FieldStereotype.money) @Label("Balance due")  BigDecimal balanceDue;

    @Section(value = "Charges", zone = "right")
    @Label("") @Stereotype(FieldStereotype.grid)
    List<ChargeRow> charges;

    @Toolbar @Action(validationRequired = true)
    Object checkIn(HttpRequest req) {
        return List.of(new Message("Checked in"), UICommand.markAsClean());
    }
}

@PlainText
public class GuestSection {
    @Label("") @Stereotype(FieldStereotype.grid)
    List<GuestRow> guests;

    @Toolbar @Label("Print welcome card")
    Object printCard(HttpRequest req) { return new Message("Sent to printer"); }
}
```

---

## Banners

### Declarative `@Banner`
```java
@Banner(theme = BannerTheme.WARNING, title = "Notice", closeable = true)
String bannerText() { return degraded ? "Some features may be slow." : null; }
```

### Programmatic `BannerSupplier`
```java
public class MyPage implements BannerSupplier {
    @Override
    public List<PageBanner> banners() {
        return List.of(new PageBanner(BannerTheme.INFO, "Info", "Welcome back."));
    }
}
```

### Action-returned banners
```java
@Toolbar
Object validate() {
    if (hasErrors()) return new PageBanner(BannerTheme.DANGER, "Error", errorSummary());
    return new PageBanner(BannerTheme.SUCCESS, "OK", "All checks passed.");
}
// Accumulate banners:
return PageBanners.append(new PageBanner(BannerTheme.WARNING, "Warning", detail));
```

---

## Header badges

### `@BadgeInHeader` (field-level, boolean or String)
```java
@BadgeInHeader(label = "VIP", color = "success") boolean vip;
@BadgeInHeader(color = "warning") String alertCode;
```

### `BadgeSupplier` (programmatic)
```java
public class BookingPage implements BadgeSupplier {
    @Override
    public List<Badge> badges() {
        return List.of(Badge.builder().text(status).color("success").pill(true).build());
    }
}
```

---

## Floating action buttons (FABs)

```java
// App-level FAB (global, visible on all pages)
@UI("/app")
@App(AppVariant.AUTO)
public class MyApp {
    @Fab(icon="vaadin:plus", label="New order", order=0)
    Object newOrder() { return new CreateOrderForm(); }
}

// Page-level FAB (scoped to this page)
@UI("/customers")
public class CustomerList {
    @Fab(icon="vaadin:plus", label="Add customer")
    Object add() { return new CreateCustomerForm(); }
}
```

---

## Key interfaces

| Interface | Purpose |
|---|---|
| `Identifiable` | Mark the ID field for CRUD. Return `id()`. |
| `ListingBackend<F,R>` | Custom searchable/filterable grid |
| `CrudRepository<T>` | Data port for `AutoCrud` |
| `Hydratable` | `hydrate(HttpRequest)` called before each render — load data from DB |
| `ComponentTreeSupplier` | Return a fluent component tree instead of annotated fields |
| `BannerSupplier` | Programmatic page banners |
| `BadgeSupplier` | Programmatic header-strip badges |
| `TitleSupplier` | Dynamic page title |
| `SubtitleSupplier` | Dynamic page subtitle |
| `ValidationSupplier` | Programmatic cross-field validation |
| `RuleSupplier` | Programmatic conditional UI rules |
| `MenuSupplier` | Dynamic navigation menu |
| `ActionHandler` | Programmatic action dispatch |
| `WizardStep` | Marker for wizard step types |
| `PostHydrationHandler` | `onHydrated(HttpRequest)` called after client state is applied |

---

## Useful types

| Type | Use |
|---|---|
| `Message` | Toast notification: `new Message("text")` or `Message.builder().text("...").build()` |
| `State` | Push updated field values to frontend: `new State(this)` |
| `PageBanner` | Dynamic banner: `new PageBanner(BannerTheme, title, description)` |
| `PageBanners` | Banner collection with replace/append: `PageBanners.replace(...)`, `.append(...)` |
| `UICommand` | Frontend command: `UICommand.markAsClean()` / `markAsDirty()` (works with `@ConfirmOnNavigationIfDirty`) |
| `Badge` | Fluent badge component (used in `BadgeSupplier`, grid cells): `Badge.builder()...build()` |
| `ListingData<R>` | Search result: `ListingData.of(list)` or builder |
| `Pageable` | Pagination/sort from the grid: `page`, `size`, `sort` |
| `HttpRequest` | Access path vars, query params, headers, auth |

---

## Common patterns — quick reference

### Page with KPI headers
```java
@UI("/orders-overview")
public class OrdersOverview {
    @KPI int totalOrders = orderRepo.count();
    @KPI String totalRevenue = "€ " + revenueService.total();
    @KPI double avgOrderValue = revenueService.average();
}
```

For a full dashboard landing page (KPI scoreboard + titled chart panels on a grid), extend the `Dashboard` archetype — see the **Dashboard** section above.

### Detail form with tabs
```java
@UI("/product/:id")
@Tabs
@Trigger(type=TriggerType.OnLoad, actionId="load")
public class ProductDetail {
    @Tab("General") @NotEmpty String name;
    @Tab("General") String description;
    @Tab("Pricing") double price;
    @Tab("Stock")   int stock;

    Object load(HttpRequest req) { /* populate fields */ return new State(this); }

    @Toolbar @Action(validationRequired=true)
    Object save() { return new Message("Saved"); }
}
```

### AutoSave settings page
```java
@UI("/settings")
@AutoSave(debounceMillis=800, action="save")
public class SettingsPage {
    String displayName;
    String email;
    boolean newsletter;

    @Toolbar
    Message save() {
        settingsService.update(displayName, email, newsletter);
        return new Message("Saved");
    }
}
```

### Long-running job with SSE progress
```java
@UI("/import")
public class ImportPage {
    @Button
    Flux<?> runImport() {                    // returning a Flux auto-enables SSE streaming
        return LongTask.create("Importing…")
                .withProgressBar()
                .done("Done", "Import complete")
                .run(progress -> importService.rows()
                        .map(r -> progress.step("Imported " + r.name(),
                                r.index() / (double) r.total())));
    }
}
```
> `background` is **not** what streams — it is an orthogonal flag that hides the busy
> indicator (fire-and-forget). Streaming comes from returning a `Flux<?>`.

### Navigation from action
```java
@Toolbar
Object openDetail() {
    return URI.create("/orders/" + orderId);          // browser URL navigation
}

// Or navigate to a Java object directly:
@Toolbar
Object openDetail() {
    return new OrderDetailForm(orderId);              // Mateu builds the view
}
```

---

## What Mateu does NOT support declaratively

- **Complex custom layouts** beyond `@Zones` + `@Compact` — use the Fluent Component API or `ComponentTreeSupplier`.
- **Real-time push without polling** — return a `Flux<?>` (streams over SSE) or use the `@AI` chat panel; WebSocket is not a native primitive.
- **Per-cell custom rendering** beyond `@Stereotype` / `@Status` / `@ColumnAction` — implement a custom web component.
