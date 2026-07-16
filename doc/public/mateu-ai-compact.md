# Mateu — AI Reference (Compact)

Mateu is a model-driven UI framework for Java. Annotate Java classes with `@UI` and Mateu generates forms, CRUD screens, navigation, and a full web UI automatically. Zero frontend code for typical business apps.

**Maven dependency (Spring Boot MVC):**
```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mvc</artifactId>
  <version>LATEST</version>
</dependency>
```

---

## Simplest app

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

## Core rules

- `@UI("/path")` on a class = routed page. `@UI("")` = root.
- Fields = form fields. Collections = grids. Nested types = subforms.
- Methods annotated with `@Button` or `@Toolbar` become buttons.
- Bean validation (`@NotNull`, `@NotEmpty`, `@Min`, `@Max`) is automatic client + server.
- `HttpRequest` can be added to any method signature — Mateu injects it automatically.
- Labels auto-derive from field name (`lastName` → "Last Name"); override with `@Label("...")`.
- Labels support `${state.field}` / `${data.field}` template expressions.

---

## Key annotations

### App & routing

| Annotation | Use |
|---|---|
| `@UI("/path")` | Register class as a routed page |
| `@App(AppVariant.AUTO)` | Make class the app shell |
| `@App(themeToggle=true)` | Add dark/light mode toggle to header |
| `@Title("...")` | Page heading |
| `@Subtitle("...")` | Page subheading |
| `@PageTitle("...")` | Browser tab title |
| `@AI(sse="/api/ai")` | Embed AI chat assistant |
| `@ConfirmOnNavigationIfDirty` | Warn before leaving a form with unsaved changes (covers menu nav, browser back/forward, reload/close) |

### Layout

| Annotation | Use |
|---|---|
| `@Section("Name")` | Group fields under a heading |
| `@Section(value="Name", columns=2)` | Multi-column section |
| `@Section(zone="left")` | Assign section to a named zone column |
| `@Zones({@Zone(name="left",width="60%"),@Zone(name="right",width="40%")})` | Side-by-side columns |
| `@Compact` | High-density mode (smaller controls, tighter spacing) |
| `@Tabs` + `@Tab("Name")` | Tabbed layout |
| `@Accordion` + `@AccordionPanel(summary="Name")` | Collapsible accordion |
| `@FoldedLayout` | Each `@Section` becomes a collapsible panel |
| `@Inline` | Expand nested type inline into parent section (no extra card) |
| `@FormLayout(columns=3)` | Force N-column form layout |
| `@Colspan(2)` | Field spans 2 columns |
| `@ColumnWidth("120px")` | Fixed column width in grid |

### Actions

| Annotation | Use |
|---|---|
| `@Button` | Button at bottom of form |
| `@Toolbar` | Button in toolbar (top of page) |
| `@Action(validationRequired=true)` | Validate before executing |
| `@Action(confirmationRequired=true)` | Show confirmation dialog |
| `@Action(background=true)` | Fire-and-forget: start the job, keep the UI interactive (no busy indicator) |
| `@RowAction` | Per-row action in a listing |
| `@ListToolbarButton` | Listing toolbar button (acts on selected rows) |
| `@AutoSave` | Auto-save on field change (debounced) |
| `@WizardCompletionAction` | Final completion action in a wizard |
| `@Banner(theme=BannerTheme.INFO, title="...")` | Message block below page header |
| `@Fab(icon="vaadin:plus", label="New")` | Floating action button (bottom-right) |

### Display & fields

| Annotation | Use |
|---|---|
| `@KPI` | Render field as a KPI tile (dashboard numbers) |
| `@PlainText` | Render field as plain read-only text (no input chrome) |
| `@Multiline` | Allow `@PlainText` field to wrap instead of truncate |
| `@Stereotype(FieldStereotype.money)` | Format numeric field as currency amount (read-only/plain-text contexts) |
| `@Badge` | Boolean as coloured chip in form body |
| `@BadgeInHeader(color="success")` | Status chip in the page header strip |
| `@Status(mappings={...})` | Enum field as coloured badge |
| `@ReadOnly` | Non-editable field |
| `@Hidden` | Hide field completely |
| `@HiddenInList` | Hide only in list/grid view |
| `@HiddenInCreate` | Hide only in create mode |

### Metadata

| Annotation | Use |
|---|---|
| `@Label("...")` | Override field/method display label |
| `@Help("...")` | Tooltip / helper text |
| `@H1` – `@H5` | Render a `String` field as a heading |
| `@Trigger(type=TriggerType.OnLoad, actionId="load")` | Fire an action on lifecycle event |
| `@Rule(filter="...", field="...", attribute=..., value="...")` | Conditional show/hide/enable rule |

---

## Action return types

| Return type | Effect |
|---|---|
| `void` / `null` | Stay on current page |
| `URI.create("/path")` | Navigate to URL |
| `new Message("text")` | Toast notification |
| Any Java object | Navigate to that object as a new view |
| `new State(this)` | Push updated state to frontend (no navigation) |
| `Flux<?>` (or `LongTask.run(...)`) | Stream a sequence of updates over SSE — returning a `Flux` auto-enables `sse` |
| `PageBanner` / `List<PageBanner>` | Show dynamic banner on current page (replaces existing) |
| `PageBanners.append(banner)` | Append banner without replacing existing ones |
| `UICommand.markAsClean()` | Clear the unsaved-changes flag (e.g. after a successful save) |
| `UICommand.markAsDirty()` | Flag the form as having unsaved changes |

---

## CRUD — zero boilerplate

```java
@UI("/products")
public class Products extends AutoCrud<Product> {}

record Product(
    @NotEmpty @EditableOnlyWhenCreating String id,
    @NotEmpty String name,
    double price,
    boolean active
) implements Identifiable {}
```

`CrudRepository<T>` methods: `findById`, `save`, `findAll`, `deleteAllById`, and the **default**
`Page<T> find(String searchText, T filters, Pageable pageable)` — search + filter + sort + paginate;
default impl runs in memory over `findAll()` (override for DB-side paging). `Page<T>` carries
`totalElements`, so no separate `count()` is needed. `AutoCrud` calls `find` to fill the listing.

---

## Custom listing

```java
@UI("/orders")
public class Orders extends Listing<OrderFilters, OrderRow> {

    @Override
    public ListingData<OrderRow> search(
            String searchText, OrderFilters filters,
            Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(repository.findAll(searchText, pageable));
    }

    @Override
    public GridLayout gridLayout() { return GridLayout.table; }
}

record OrderFilters(String status, LocalDate from, LocalDate to) {}
record OrderRow(String id, String customer, double total, String status) {}
```

---

## Form with load trigger

```java
@UI("/customer/:id")
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

```java
@UI("/signup")
public class SignupWizard extends Wizard {
    AccountStep account = new AccountStep();
    PlanStep plan = new PlanStep();
    SuccessStep result;  // null → auto-instantiated after completion

    @WizardCompletionAction
    @Action(validationRequired = true)
    Object finish() {
        service.create(account, plan);
        return null;
    }
}

class AccountStep implements WizardStep { @NotEmpty String email; String password; }
class PlanStep    implements WizardStep { String planId; }
class SuccessStep implements WizardStep { @PlainText String msg = "Account created!"; }
```

Branching: override `stepApplies(String stepFieldName)` to skip steps based on earlier
answers (skipped in both directions, excluded from the progress bar).

---

## Dashboard

```java
@UI("/dashboard")
public class SalesDashboard extends Dashboard {
    // consecutive MetricCard fields → full-width KPI scoreboard band
    MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").unit("M€")
            .trend(MetricTrend.up).trendLabel("+8%").actionId("openOrders").build();
    MetricCard orders = MetricCard.builder().title("Orders").value("3,421").build();

    // @Panel component fields → titled tiles on a responsive grid
    @Panel(title = "Monthly sales", colSpan = 2)
    Chart sales = Chart.builder().chartType(ChartType.bar).chartData(...).build();

    @Action Object openOrders() { return URI.create("/orders"); }  // metric drill-in
}
```

Override `columns()` to fix the grid column count (default 0 = responsive auto-fit). Fluent
variant: build a `DashboardLayout` (+ `Scoreboard`/`DashboardPanel`/`MetricCard`) from
`ComponentTreeSupplier`.

---

## Foldout record page

```java
@UI("/booking/:id")
public class BookingFoldout extends Foldout {
    // first component field without @Panel → always-visible overview (left)
    Markdown overview = new Markdown("**Guest:** Jane Smith …", null, null);

    // @Panel fields → lateral fold-out panels (closed = narrow strip, click to unfold)
    @Panel(title = "Payments") Markdown payments = new Markdown("…", null, null);
    @Panel(title = "Notes", open = false) Markdown notes = new Markdown("…", null, null);
}
```

Fluent variant: `FoldoutLayout.builder().overview(c).panels(List.of(FoldoutPanel.builder()…))`.

---

## Hero search page

```java
@UI("/hotel-search")
public class HotelSearch extends HeroSearch<HotelFilters, Hotel> {
    public record HotelFilters(String zone, Integer minStars) {}   // fields → facets
    public record Hotel(String name, String zone, int stars, String price) {}  // → cards

    @Override protected String heroTitle() { return "Find your hotel"; }
    @Override protected String heroSubtitle() { return "Search by name or zone…"; }

    @Override
    public ListingData<Hotel> search(String searchText, HotelFilters filters,
                                     Pageable pageable, HttpRequest req) { /* query */ }
}
```

Big hero header + search box + facets + card results (override `gridLayout()` for table).
Starts empty; add `@Trigger(type=TriggerType.OnLoad, actionId="search")` to preload.
`HeroSection` is also a standalone fluent component (title, subtitle, image, content slot).

---

## Item overview page

```java
@UI("/product/:id")
public class ProductOverview extends ItemOverview {
    // first component field without @Panel → key-info panel (left, sticky)
    Markdown keyInfo = new Markdown("### EC-200\n**SKU:** EC-200-BLK", null, null);

    // @Panel fields → tabs on the right
    @Panel(title = "Sales")   Chart sales = Chart.builder()/* … */.build();
    @Panel(title = "Reviews") Markdown reviews = new Markdown("…", null, null);
}
```

Override `panelWidth()` (default "22rem"). Read-mostly → ItemOverview; editable →
AutoEditableView; categories side-by-side → Foldout.

---

## Inline editing on CRUD listings

```java
@UI("/stock") @InlineEditing                 // class-level: cells edit in place
public class StockCrud extends AutoCrud<StockItem> {
    @Override public GridLayout gridLayout() { return GridLayout.table; }
    @Override public CrudRepository<StockItem> repository() { /* … */ }
}
```

Each committed cell persists its row via repository().save (update-row action).
`@ReadOnly` fields stay display-only. (For form collections use `@InlineEditing`
on the `List` field — see Editable table.)

---

## Gantt / timeline

```java
Component plan = Gantt.builder().tasks(List.of(
        GanttTask.builder().title("Implementation")
                .start(LocalDate.of(2026, 7, 1)).end(LocalDate.of(2026, 8, 14))
                .progress(25).build())).build();
```

Read-only schedule view: month headers, progress fill, today marker. Optional per-task `color`.

---

## Empty states & skeletons

```java
Component empty = EmptyState.builder().icon("📭").title("No bookings yet")
        .description("When you create a booking it will show up here.")
        .actionId("createBooking").actionLabel("Create your first booking").build();
Component loading = Skeleton.builder().variant(SkeletonVariant.form).count(3).build();
```

Listings render an empty-state block automatically when they have no rows
(`Listing.emptyStateMessage` sets the message). Skeleton variants: text/card/grid/form.

---

## Welcome page

```java
@UI("/welcome")
public class WelcomeDemo extends Welcome {
    // Button fields → CTAs in the hero; actionId runs the matching @Action
    Button start = Button.builder().label("Start check-in")
            .actionId("startCheckin").buttonStyle(ButtonStyle.primary).build();

    // @Panel fields → highlight tiles below the hero
    @Panel(title = "1 · Search the booking")
    Markdown step1 = new Markdown("Find the reservation…", null, null);

    @Override protected String heroTitle() { return "Front desk check-in"; }

    @Action Object startCheckin() { return URI.create("/checkin"); }
}
```

---

## Navigation & menus

```java
@UI("/app")
@App(AppVariant.HAMBURGUER_MENU)
public class MyApp {
    @Menu Customers customers;
    @Menu Orders orders;
}
```

---

## Multi-zone dense form

```java
@UI("/checkin/:id")
@Compact
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@ConfirmOnNavigationIfDirty
@Zones({ @Zone(name="left", width="60%"), @Zone(name="right", width="40%") })
public class CheckInForm {

    @Section(value="Guest", columns=4, zone="left")
    String guestName;
    String roomNumber;

    @Section(value="Amounts", columns=1, zone="right")
    @PlainText
    @Stereotype(FieldStereotype.money) BigDecimal creditLimit;   // shown as "1.250,00"
    @Stereotype(FieldStereotype.money) BigDecimal balanceDue;

    @Section(value="Charges", zone="right")
    @Label("") @Stereotype(FieldStereotype.grid)
    List<ChargeRow> charges;

    @Toolbar
    @Action(validationRequired=true)
    Object checkIn() { return List.of(new Message("Checked in"), UICommand.markAsClean()); }
}
```

---

## Key interfaces

| Interface | When to use |
|---|---|
| `Identifiable` | Mark ID field for CRUD (`id()` method) |
| `ListingBackend<F,R>` | Custom searchable grid |
| `CrudRepository<T>` | Data port for AutoCrud |
| `Hydratable` | `hydrate(HttpRequest)` called before each render |
| `BannerSupplier` | Programmatic page banners (replaces `@Banner` methods) |
| `BadgeSupplier` | Programmatic header badges |
| `TitleSupplier` | Dynamic page title |
| `ValidationSupplier` | Cross-field validation logic |
| `WizardStep` | Marker for wizard step classes |

---

## Common mistakes to avoid

- **Missing `@NotNull`/`@NotEmpty`** on required fields — Mateu won't block the user otherwise.
- **Navigation with `URI.create()`** uses the browser URL, not the Java type. Return the Java object directly to navigate to it as a page.
- **Wizard result step** must implement `WizardStep`. If `null`, Mateu auto-instantiates it; or set it explicitly in `@WizardCompletionAction`.
- **`@Section` zone** only works when the class has `@Zones(...)`. Without it the zone attribute is ignored.
- **Badges**: use `@Badge` for in-form chips, `@BadgeInHeader` for header-strip status chips.
- **`@Inline` + `@Toolbar`/`@Button`** on the nested type: `@Toolbar` appears on the section title row, `@Button` below the section content.
- **Don't degrade structured data to a `String`**: search results and tables go in a `List<Pojo>` with `@Stereotype(FieldStereotype.grid)` (add `@OnRowSelected` if the user picks a row), never concatenated into a `@ReadOnly String`.
- **Don't model editable collections as delimited text**: use `@InlineEditing` on a `List<MutablePojo>` grid, never `"a; b"` strings.
- **Data-driven selects** use `@Lookup(search=…, label=…)` with supplier beans, never a free-text field.
- **Actions that mutate fields must return `new State(this)`** (typically `List.of(new Message("…"), new State(this))`) — returning only a `Message` does not refresh the client.
- **Form ViewModels with mutable fields need `@Scope("prototype")`** — a singleton shares form state across users.
