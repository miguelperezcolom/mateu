---
title: "Components"
description: "The Mateu component catalogue organised by role: layout, fields and input, display, data and collections, navigation, feedback, overlays, charts and specialised canvases, composition. Plus field types and stereotypes, and how renderers map components."
---

Every page, whether it is written in YAML, built fluently in code or derived from a class, is a
tree of components from **one catalogue**. In YAML the `type:` of a node is the component's name;
in Java the same name is a record in `io.mateu.uidl.data` with a builder; C# and Python have the
same names. The catalogue's JSON Schema, `specs-schema.json`, is generated from those records, so
the schema, the visual editor's palette and the renderers cannot disagree.

This page lists the catalogue by **role**, one line per component, with a link to its page where
there is one. Annotated view models produce the same components: a field becomes a `FormField`, a
`List<Row>` a grid, a `@Section` a card, a `@Button` method a `Button`.

## Layout

Containers that arrange other components.

| Component | What it is for |
|---|---|
| [`VerticalLayout`](/java-ui-definition/components/vertical-layout/) / [`HorizontalLayout`](/java-ui-definition/components/horizontal-layout/) | stack children down or across; the everyday containers |
| [`FormLayout`](/java-ui-definition/components/form-layout/) | responsive columns of fields (`FormRow`, `FormItem`, `FormSection`, `FormSubSection` structure it) |
| `ContentLayout` | the content-page grammar: a `main` region, an `aside` (side, width, sticky) and a full-width `footer` |
| [`Card`](/java-ui-definition/components/card/) | a framed group with a title; what a `@Section` becomes |
| [`TabLayout`](/java-ui-definition/components/tab-layout/) / [`AccordionLayout`](/java-ui-definition/components/accordion-layout/) / [`Details`](/java-ui-definition/components/details/) | groups the user switches between, or expands |
| [`SplitLayout`](/java-ui-definition/components/split-layout/) / [`MasterDetailLayout`](/java-ui-definition/components/master-detail-layout/) | two resizable panes; a list with its detail |
| `DashboardLayout` + `DashboardPanel` | a responsive grid of titled tiles ([dashboard](/ux-patterns/dashboard/)) |
| `FoldoutLayout` + `FoldoutPanel` | an overview with lateral fold-out panels ([foldout](/ux-patterns/foldout/)) |
| `HeroSection` | a large title band with optional image and calls to action ([welcome page](/ux-patterns/welcome-page/)) |
| [`BoardLayout`](/java-ui-definition/components/board-layout/), `ResponsiveGrid` | rows and columns of tiles |
| [`CarouselLayout`](/java-ui-definition/components/carousel-layout/), [`Scroller`](/java-ui-definition/components/scroller/), [`Container`](/java-ui-definition/components/container/), [`FullWidth`](/java-ui-definition/components/full-width/), `Div` | carousels, scroll areas, plain wrappers |

## Fields and input

| Component | What it is for |
|---|---|
| [`Form`](/java-ui-definition/components/form/) | a page or region with a header, fields and buttons |
| [`FormField`](/java-ui-definition/components/form-field/) | one input, bound to `state.<id>`; its data type and stereotype pick the widget (see [below](#fields-and-field-types)) |
| `CustomField` | a field whose value is a component, so any component can sit in a form row |
| [`Button`](/java-ui-definition/components/button/) / `ButtonGroup` | run an action, navigate, or open a menu |
| `DropZone` | a target that rows can be dragged onto ([drag to a destination](/ux-patterns/drag-to-a-destination/)) |
| `AddOnPicker`, `PaymentPicker`, `ResourceGrid` | task-specific pickers ([add-on picker](/ux-patterns/addon-picker/), [payment picker](/ux-patterns/payment-picker/), [resource grid](/ux-patterns/resource-grid/)) |
| `MessageInput` | a chat-style input ([AI chat](/ai/)) |

## Display

Read-only presentation of values and records.

| Component | What it is for |
|---|---|
| [`Text`](/java-ui-definition/components/text/), [`Markdown`](/java-ui-definition/components/markdown/), [`Image`](/java-ui-definition/components/image/), [`Icon`](/java-ui-definition/components/icon/) | text in five sizes, formatted text, pictures and icons |
| [`Avatar`](/java-ui-definition/components/avatar/), `AvatarGroup`, [`Badge`](/java-ui-definition/components/badge/) | people and status chips |
| `EntityHeader` | a record's banner: title, badges, facts, a metric ([entity header](/ux-patterns/entity-header/)) |
| [`KPI`](/java-ui-definition/components/kpi/), `MetricCard`, `Scoreboard`, `Stat` | key numbers, alone or as a band ([stat](/ux-patterns/stat/)) |
| `Meter`, `TaskProgress` | a value against a limit; done/total progress ([meter](/ux-patterns/meter/), [task progress](/ux-patterns/task-progress/)) |
| `BulletedList`, `StatusList`, `Checklist`, `Separator` | lists of items, of statuses, of tasks; a divider ([status list](/ux-patterns/status-list/), [checklist](/ux-patterns/checklist/)) |
| `Timeline`, `CommentThread`, `FileList` | activity, conversation, attachments ([timeline](/ux-patterns/timeline/), [comment thread](/ux-patterns/comment-thread/), [file list](/ux-patterns/file-list/)) |
| `Ledger`, `ProcessMonitor`, `RecordMerge` | a folio breakdown, process health, merging two records ([ledger](/ux-patterns/ledger/), [process monitor](/ux-patterns/process-monitor/), [record merge](/ux-patterns/record-merge/)) |
| `CalloutCard`, `OfferCard`, `ComparisonCard`, `PricingTable`, `FeatureGrid`, `Testimonials`, `Faq` | marketing-style and landing blocks ([callout card](/ux-patterns/callout-card/), [offer card](/ux-patterns/offer-card/), [comparison card](/ux-patterns/comparison-card/), [pricing table](/ux-patterns/pricing-table/), [feature grid](/ux-patterns/feature-grid/), [testimonials](/ux-patterns/testimonials/), [FAQ](/ux-patterns/faq/)) |
| `OrgChart` | a hierarchy of people or units ([org chart](/ux-patterns/org-chart/)) |

## Data and collections

| Component | What it is for |
|---|---|
| `Listing` + `GridColumn` | the searchable, filterable, paginated collection: table, list, cards, tree or master-detail ([filters and listing](/ux-patterns/filters-and-listing/)) |
| [`Grid`](/java-ui-definition/components/grid/), `GridGroupColumn` | a plain or editable table, with grouped headers ([editable table](/ux-patterns/editable-table/)) |
| [`VirtualList`](/java-ui-definition/components/virtual-list/) | a long, lazily rendered list |
| `TaskQueue` | counted buckets of actionable cards ([task queue](/ux-patterns/task-queue/)) |
| `Kanban` | cards in columns ([kanban](/ux-patterns/kanban/)) |
| `Calendar` | month, week, day and list views of events ([calendar](/ux-patterns/calendar/)) |
| `MatrixGrid` | rows × dates with collapsible sections and in-place editing ([matrix grid](/ux-patterns/matrix-grid/)) |
| `PlanningBoard` | resources × days tape chart, drag to move ([planning board](/ux-patterns/planning-board/)) |
| `Gantt` | tasks on a timeline ([Gantt](/ux-patterns/gantt/)) |

## Navigation

| Component | What it is for |
|---|---|
| Menu entries: `RouteLink`, `RuleLink`, `Menu`, `RemoteMenu` | the app menu; see [navigation and menus](/ux/app-structure/#navigation-and-menus) |
| `MenuBar`, `ContextMenu` | a bar of menus; a menu on right-click (or left-click) around another component |
| [`Directory`](/java-ui-definition/components/directory/) | a categorised directory of links, for landing pages |
| [`Breadcrumbs`](/java-ui-definition/components/breadcrumbs/), [`Anchor`](/java-ui-definition/components/anchor/), `Tab` | where you are; a link; one tab of a `TabLayout` |
| `ProgressSteps` | where you are in a process ([progress steps](/ux-patterns/progress-steps/)) |

## Feedback

| Component | What it is for |
|---|---|
| `Notice` | an inline message strip inside the body, with an optional action ([notice](/ux-patterns/notice/)) |
| [`Notification`](/java-ui-definition/components/notification/) | a toast (actions usually return a `Message` instead) |
| [`ProgressBar`](/java-ui-definition/components/progress-bar/) | progress of a step or a job |
| `EmptyState`, `Skeleton` | nothing to show yet; still loading ([empty states and skeletons](/ux-patterns/empty-states-and-skeletons/)) |
| `NotFound` | a route that does not exist ([not found](/ux-patterns/not-found/)) |
| [`Tooltip`](/java-ui-definition/components/tooltip/), [`CookieConsent`](/java-ui-definition/components/cookie-consent/) | hints; the consent banner |

Page banners are page metadata rather than components; see [page anatomy](/ux/app-structure/#page-anatomy).

## Overlays

| Component | What it is for |
|---|---|
| [`Dialog`](/java-ui-definition/components/dialog/), [`ConfirmDialog`](/java-ui-definition/components/confirm-dialog/) | a modal question; a confirmation |
| `Drawer` | a side or bottom panel over the page ([drawer](/ux-patterns/drawer/)) |
| [`Popover`](/java-ui-definition/components/popover/) | details on hover or click ([hover details](/ux-patterns/hover-details/)) |
| `ActionPanel` | a categorised "I want to…" overlay ([action panel](/ux-patterns/action-panel/)) |

## Charts and specialised canvases

| Component | What it is for |
|---|---|
| [`Chart`](/java-ui-definition/components/chart/), `TrendChart`, `Funnel`, `Heatmap` | bar, line, pie and friends; a dependency-free trend line; a funnel; a calendar heatmap ([trend chart](/ux-patterns/trend-chart/), [funnel](/ux-patterns/funnel/), [heatmap](/ux-patterns/heatmap/)) |
| [`Map`](/java-ui-definition/components/map/) | a street map with clickable markers |
| `Bpmn`, `Workflow` | a BPMN diagram; a workflow-definition editor |
| `Chat`, `MessageList` | a conversation ([AI chat](/ai/)) |

## Composition and extension

These carry no look of their own; they assemble or delegate.

| Component | What it is for |
|---|---|
| `Partial` | a named piece of layout spliced in by reference ([partials](/define/yaml/partials/)) |
| `ComponentRef` | a named business component bound to a data source ([business components](/java-ui-definition/component-catalogue/)) |
| `CustomComponent` | a rendering the catalogue does not have, registered per renderer ([custom components](/java-ui-definition/custom-components/)) |
| [`Element`](/java-ui-definition/components/element/) | any HTML element or web component by tag name ([custom web components](/java-user-manual/advanced/custom-web-components/)) |
| [`MicroFrontend`](/java-ui-definition/components/micro-frontend/), `EmbeddedView` | another Mateu UI, or another view, embedded as an island |
| `FutureComponent`, `Slotted` | a component that arrives later; a child placed in a named slot |
| `State`, `AppState`, `Data`, `AppData` | not visual: values an action returns to update a [state scope](/concepts/state-and-triggers/) |

The full, always-current list is the generated schema,
[`specs-schema.json`](https://github.com/miguelperezcolom/mateu/blob/master/backend/shared/uidl/specs-schema.json).

## Fields and field types

A `FormField` (or an annotated field) is drawn according to two properties:

- **`dataType`**: what the value is: `string`, `integer`, `number`, `bool`, `date`, `time`,
  `dateTime`, `dateRange`, `money`, `status`, `file`, `array`, `range`, `component`, `menu`,
  `action`, `actionGroup`.
- **`stereotype`**: how to edit or show it: `regular`, `textarea`, `richText`, `html`,
  `markdown`, `email`, `password`, `select`, `combobox`, `listBox`, `radio`, `checkbox`, `toggle`,
  `multiSelect`, `treeSelect`, `choice`, `searchable`, `slider`, `stars`, `color`, `icon`, `link`,
  `money`, `badge`, `plainText`, `bulletedList`, `grid`, `image`, `uploadableImage`, `fileUpload`,
  `signature`, `camera`, `dateRange`, `numberRange`, `popover`, `button`, `primary`.

In code, both are inferred from the Java, C# or Python type (a `LocalDate` is a date picker, a
small enum is a radio group, a `List<Row>` is a grid) and overridden with `@Stereotype` or a
shorthand annotation (`@Badge`, `@UploadableImage`, `@Signature`, `@TreeSelect`…). See
[field stereotypes](/java-user-manual/concepts/field-stereotypes/) and
[field annotations](/java-ui-definition/annotations/field-types/).

To name a **domain concept** once (`OrderStatus`, `Money`, `Email`) and reuse it on every field
and column, declare a [field type](/java-ui-definition/field-types/) in `types.yaml`
(`fieldType: OrderStatus`) or, for annotated classes, a
[semantic annotation](/java-ui-definition/annotations/semantic-annotations/).

## How renderers map components

A component on the wire says *what* to show; each renderer decides *how*, with its own widgets:

| Renderer | Paints components with | Details |
|---|---|---|
| Vaadin (web) | Vaadin web components, plus Mateu's own design-neutral elements for the rest | [Vaadin](/design-systems/vaadin/) |
| Redwood (web) | Oracle JET and Redwood components, inside a Visual Builder app | [Redwood](/design-systems/oracle-redwood/), [Redwood coverage](/reference/parity/#redwood-component-coverage) |
| React Native (mobile) | native views | [The Mateu app](/native/react-native/) |
| IntelliJ (desktop) | Swing components in tool windows and editor tabs | [IntelliJ](/native/) |

A renderer that has no view for a component shows a visible *unsupported* placeholder instead of
silently dropping it, which is what the conformance suite counts. What a renderer must implement,
and the **Core / Standard / Full** conformance levels, are in the
[renderer contract](/design-systems/renderer-contract/). Which feature works where is in the
[parity matrix](/reference/parity/).
