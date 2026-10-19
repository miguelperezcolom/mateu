# Pages and components

A page file is **one component tree**. Every node has `type:` = a component name from the
catalogue below; children go in `content:` (layouts), `items:` / `tabs:` / `metrics:` (specific
containers). Two equivalent shapes:

```yaml
# bare: the root component, with page keys beside it
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Listing
pageType: collection          # optional: landing|collection|detail|form|process|dashboard (drives default width)
title: Orders
rowsSource: {ref: orders}
columns:
  - {type: GridColumn, id: id, label: Order}
actions: []                   # optional: this page's actions
triggers: []                  # optional: OnLoadTrigger / OnCustomEventTrigger / OnValueChangeTrigger / AutoSaveTrigger …
```

```yaml
# envelope: the tree under layout:, page keys beside it (no top-level type:)
pageType: dashboard
layout:
  type: VerticalLayout
  content:
    - {type: Text, text: Hello, container: h2}
actions: []
viewModel: com.acme.Orders    # only for a layout used by ONE route; normally bind on the route
```

`layoutDelta:` (instead of `layout:`) keeps the view model's inferred layout and records only
what a human changed (`order`, `hidden`, `overrides: {field: {label, colspan, …}}`) — what the
visual editor writes for a bound page.

## The page types you will write most

### Listing (a collection over a REST source)

```yaml
type: Listing
title: Orders
searchable: true                       # search box → ${state.searchText}
rowRoute: orders/${row.id}             # click a row → its record page (mount-relative)
rowsSelectionEnabled: true             # checkboxes; pair with an action rowsSelectedRequired: true
pageSize: 20
gridLayout: table                      # auto(=table)|table|list|cards|masterDetail|tree
rowsSource: {ref: orders}              # a sources.yaml name (or an inline source)
toolbar:
  - {type: Button, label: New order, buttonStyle: primary, actionable: {type: RouteLink, route: orders/new}}
filters:                               # each a FormField; its id becomes ${state.<id>}
  - {type: FormField, id: status, label: Status, stereotype: select,
     options: [{value: OPEN, label: Open}, {value: SHIPPED, label: Shipped}]}
  - {type: FormField, id: total, label: Total, dataType: number, stereotype: numberRange}   # → total_from / total_to
columns:
  - {type: GridColumn, id: id, label: Order, identifier: true, sortable: true}
  - {type: GridColumn, id: customerName, label: Customer}           # column id = dot path into the row (or a source `fields:` alias)
  - {type: GridColumn, id: status, label: Status, dataType: status} # lifecycle words → coloured badge
  - {type: GridColumn, id: total, label: Total, stereotype: money, align: end}
```

**Status colours.** A `dataType: status` column colours only well-known lifecycle words by itself
(green: ACTIVE, AVAILABLE, COMPLETED, DONE, READY, SUCCESS, OK…; amber: PENDING, IN_PROGRESS,
WAITING, ACCEPTED…; red: FAILED, ERROR, CANCELLED, REJECTED, INACTIVE, STOPPED…); anything else
(SHIPPED, DELIVERED…) is grey. Say it explicitly with `tones:` on the column — value → tone, tones
`success | warning | danger | info | neutral`:

```yaml
  - {type: GridColumn, id: status, label: Status, dataType: status,
     tones: {PENDING: warning, PROCESSING: info, SHIPPED: info, DELIVERED: success, CANCELLED: danger}}
```

(or once, in `types.yaml`, as a field type the columns name with `fieldType:` — see other-kinds.md).

Without `totalPath` on the source, search/filter/sort/paging run in the browser over the fetched
rows; with it, the endpoint is trusted to have done them (send `${state.page}`, `${state.size}`,
`${state.sort…}`, `${state.searchText}`, the filter ids in its URL). Other keys: `groupBy`,
`emptyStateMessage`, `compact`, `rowStatusField`, `header`/`footer` components.

### Form (a record page or an input form)

```yaml
type: Form
title: Order ${state.id}               # header; also overline, titlePlaceholder, timestamp, badges, kpis, banners, fabs, peerNav, recordSwitcher
subtitle: Read-only view
toolbar:                               # header buttons (a back-style id renders as a < chevron)
  - {type: Button, actionId: backToList, label: Back, actionable: {type: RouteLink, route: orders}}
content:
  - type: FormLayout                   # responsive columns; maxColumns, labelsAside
    content:
      - {type: FormField, id: customer, label: Customer, dataType: string, required: true}
      - {type: FormField, id: total, label: Total, dataType: number, min: 0}
      - {type: FormField, id: country, label: Country, stereotype: select, optionsSource: {ref: countries}}
      - {type: FormField, id: notes, label: Notes, stereotype: textarea, colspan: 2}
buttons:                               # footer buttons
  - {type: Button, label: Save, actionId: save, buttonStyle: primary}
actions:
  - id: save
    validationRequired: true
    restAction: {source: {ref: order-update}, successMessage: Saved, successRoute: "orders/${state.id}"}
```

`FormField` keys: `id` (binds `state.<id>` / the view-model field), `label`, `dataType`,
`stereotype`, `required`, `readOnly`, `placeholder`, `description`, `options` /
`optionsSource`, `min`/`max`/`step`, `colspan`, `initialValue`, `fieldType` (from `types.yaml`),
`eyesOnly`/`readOnlyUnless`/`disabledUnless` (access). Read-only record pages: `readOnly: true`
per field and a route `data:` source that fetches the record.

### Landing / dashboard

```yaml
pageType: dashboard
layout:
  type: VerticalLayout
  fullWidth: true
  horizontalAlignment: STRETCH
  content:
    - type: Scoreboard
      metrics:
        - {type: MetricCard, title: Revenue, value: "1.2M", unit: EUR, trend: up, trendLabel: +8%, timeframe: This month}
        - {type: MetricCard, title: Orders, value: "3,480", actionId: openOrders}   # clickable tile
    - type: DashboardLayout
      columns: 2
      items:
        - type: DashboardPanel
          title: Sales by region
          content: {type: Chart, chartType: bar, chartData: {labels: [Q1, Q2], datasets: [{label: North, data: [120, 135]}]}}
actions:
  - id: openOrders
    steps: [{type: Navigate, route: orders}]
```

A landing page: `HeroSection` (`title`, `subtitle`, `centered`, `tone`, `content:` with CTA
`Button`s whose `actionable` is a `RouteLink`).

## Buttons, actions and triggers

- `Button`: `label`, `buttonStyle` (`primary|secondary|tertiary|tertiaryInline|none`), `color`
  (`success|error|warning|contrast|normal`), `iconOnLeft`, `shortcut`, and EITHER
  `actionable: {type: RouteLink, route: …}` (navigate) OR `actionId: <id>` (run an action).
- Page `actions:` entries: `id` + one of `restAction` (REST call run by the browser, or by the
  server when the source is `proxy: true`) or `steps` (client flow: `Navigate`, `RunAction`,
  `Emit`, `CloseOverlay`, `MarkClean`, `MarkDirty`). Options: `validationRequired`,
  `confirmationRequired` + `confirmationTexts: {title, message, confirmationText, denialText}`,
  `rowsSelectedRequired`, `access`, `shortcut`.
- `restAction`: `source` (`{ref: …}` or inline), `successMessage`, `successRoute`, `resultPath`
  (`""` merges the response into the state), `forEachSelectedRow: true` (one call per checked row,
  `${state.id}` = that row's id).
- `triggers:` — `{type: OnLoadTrigger, actionId: refresh}`,
  `{type: OnCustomEventTrigger, eventName: product-saved, actionId: refresh}`, … run page actions
  without a click.
- An `actionId` that is neither a page action, an `actions.yaml` entry, nor a method of the bound
  view model does nothing.

## Expressions

Any text takes `${…}`: `${state.name}`, `${data.total}`, `${appState.hotel}`, `${row.id}` (in
`rowRoute`), `${i18n.orders.title}`, with `??`, `?.`, ternaries and `encodeURIComponent(…)`.
Sandboxed: no other globals.

## The catalogue (every `type:` the schema accepts)

Field-level details: the schema (`$defs/<Type>`), or
https://mateu.io/java-ui-definition/components/ (the YAML keys are the Java record's components).

- **Page roots**: `Form`, `Listing`, `AppShell` (see app-shell.md), `HeroSection`, `EntityHeader`,
  `EmptyState`, `NotFound`, `Skeleton`
- **Layout**: `VerticalLayout`, `HorizontalLayout`, `FormLayout`, `FormRow`, `FormItem`,
  `FormSection`, `FormSubSection`, `TabLayout` + `Tab`, `AccordionLayout` + `AccordionPanel`,
  `SplitLayout`, `MasterDetailLayout`, `BoardLayout` + `BoardLayoutRow` + `BoardLayoutItem`,
  `CarouselLayout`, `ResponsiveGrid`, `DashboardLayout` + `DashboardPanel`, `FoldoutLayout` +
  `FoldoutPanel`, `ContentLayout`, `Container`, `Div`, `FullWidth`, `Scroller`, `Details`,
  `Slotted`, `Separator`
- **Fields & data**: `FormField`, `CustomField`, `FormEditor`, `Grid` + `GridColumn` +
  `GridGroupColumn`, `VirtualList`, `Directory`
- **Display**: `Text`, `Markdown`, `Image`, `Icon`, `Anchor`, `Badge`, `Avatar`, `AvatarGroup`,
  `Card`, `CalloutCard`, `ComparisonCard`, `OfferCard`, `Notice`, `Notification`, `Tooltip`,
  `Popover`, `BulletedList`, `StatusList`, `Checklist`, `FileList`, `Faq`, `FeatureGrid`,
  `PricingTable`, `Testimonials`, `Timeline`, `OrgChart`, `Ledger`
- **Metrics & charts**: `KPI`, `Stat`, `MetricCard`, `Scoreboard`, `Meter`, `ProgressBar`,
  `ProgressSteps`, `TaskProgress`, `Chart`, `TrendChart`, `Funnel`, `Heatmap`
- **Planning & domain views**: `Calendar`, `Gantt`, `Kanban`, `PlanningBoard`, `MatrixGrid`,
  `Map`, `Bpmn`, `Workflow`, `ResourceGrid`, `TaskQueue`, `ProcessMonitor`, `RecordMerge`
- **Actions & overlays**: `Button`, `ButtonGroup`, `MenuBar`, `ContextMenu`, `ActionPanel`,
  `Dialog`, `ConfirmDialog`, `Drawer`, `DropZone`, `AddOnPicker`, `PaymentPicker`,
  `CookieConsent`, `Breadcrumbs`
- **Conversation**: `Chat`, `MessageInput`, `MessageList`, `CommentThread`
- **Composition & escape hatches**: `Partial` (partials.md), `ComponentRef` (business component,
  other-kinds.md), `EmbeddedView`, `MicroFrontend` (a remote Mateu route inside the page),
  `Element` (a custom web component), `CustomComponent`, `FutureComponent`
- **State carriers** (rarely authored): `Data`, `State`, `AppData`, `AppState`

Not every renderer draws every type (Redwood coverage: https://mateu.io/reference/parity/), and a
static `specsOnly` bundle expands only roots of type `AppShell`, `Listing`/`Crud`/`Crudl`, `Form`,
`VerticalLayout`, `HorizontalLayout`, `Div`, `Card`, `CustomComponent` in the browser — any other
root is pre-rendered at build time.
