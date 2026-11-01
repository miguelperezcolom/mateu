---
title: "Supported components"
---

Mateu provides a rich set of UI components.

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

All fluent components implement:

```text
io.mateu.uidl.fluent.Component
```

---

## Key idea

You do not manually build UI in most cases.

Mateu infers it.

But when needed, you can drop down to fluent components and mix both approaches in the same page.

👉 See [Fluent components](/java-ui-definition/fluent-components/)

---

## Summary

- declarative → fast, inferred UI
- fluent → explicit control
- both → fully compatible

---

## Every component

The same types serve the three ways to build a screen: a Java fluent tree (`new Card(...)`, the
records in `io.mateu.uidl.data` / `io.mateu.uidl.fluent`), a YAML definition (`type: Card`) and the
.NET/Python fluent ports. This list is generated from the component catalogue the build produces
(`backend/shared/uidl/uidl-catalog.json`), so it is always complete; each attribute list is the
record's components, and `uidl-schema.json` has their full types. Where a type has a page of its own
or a pattern page, its name links there.

<!-- GENERATED from backend/shared/uidl/uidl-catalog.json by scripts/gen-supported-components.mjs — do not edit -->

126 types (catalogue version 3.0). The common attributes every component takes — `style`, `cssClasses`, `note` and the access keys — are left out.

### Components

| Type | What it is | Main attributes |
|---|---|---|
| [`AccordionLayout`](/java-ui-definition/components/accordion-layout/) | A stack of collapsible panels where one or more can be expanded at a time. | `id`, `panels`, `variant` |
| [`AccordionPanel`](/java-ui-definition/components/accordion-layout/) | One collapsible panel of an accordion, with a label and its content. | `label`, `content`, `active`, `disabled` |
| [`ActionPanel`](/ux-patterns/action-panel/) | A categorised ACTION PANEL: a trigger button that opens a layer over the page with the actions of the record grouped in columns, one per category (e.g. | `id`, `label`, `shortcut`, `categories`, `maxPerCategory`, `hideUnpopulatedToggle` |
| [`AddOnPicker`](/ux-patterns/addon-picker/) | Priced extras with a live running total (e.g. upsell packages at check-in): a responsive grid of AddOn cards, each with a +/✓ toggle, and a header-right total (totalLabel + currency + sum of added prices, computed client-side). | `id`, `totalLabel`, `currency`, `actionId`, `items` |
| [`Anchor`](/java-ui-definition/components/anchor/) | A hyperlink with text that opens a URL, optionally in another window (target). | `text`, `url`, `target` |
| `AppData` | Invisible holder that sets the data available to expressions across the app. | `data` |
| [`AppShell`](/define/yaml/app-shell/) | The application frame: title, menu, header widgets, layout variant and home route of an app. | `clientSideComponentId`, `route`, `homeRoute`, `homeBaseUrl`, `homeServerSideType`, `homeUriPrefix`, `homeConsumedRoute`, `serverSideType`, `favicon`, `pageTitle`, `title`, `subtitle`, `menu`, `variant`, `layout`, `widgets`, `drawerClosed`, `logo`, `accentColor`, `backLink`, `actions`, `themeToggle`, `commandCenter`, `chromeless`, `accessKeys`, `shortcuts`, `headerValues`, `liveUpdates`, `idleTimeoutMinutes`, `idleWarningSeconds`, `idleSignOutUrl`, `mobileQr`, `contextSelectors`, `headerActions`, `notifications`, `globalSearch` |
| `AppState` | Invisible holder that sets the app-wide state shared by all screens. | `state` |
| [`Avatar`](/java-ui-definition/components/avatar/) | A round user avatar showing an image, initials or a name abbreviation. | `name`, `abbreviation`, `image` |
| [`AvatarGroup`](/java-ui-definition/components/avatar/) | A compact row of overlapping avatars that collapses extras into a +N chip. | `avatars`, `maxItemsVisible` |
| [`Badge`](/java-ui-definition/components/badge/) | A small colored label (chip) for a status or count, optionally with icons. | `text`, `iconOnLeft`, `iconOnRight`, `color`, `primary`, `small`, `pill` |
| [`BoardLayout`](/java-ui-definition/components/board-layout/) | A responsive dashboard board made of rows of items that share the row width in columns. | `id`, `rows` |
| [`BoardLayoutItem`](/java-ui-definition/components/board-layout/) | One cell of a board row holding a component, spanning a number of board columns. | `content`, `boardCols` |
| [`BoardLayoutRow`](/java-ui-definition/components/board-layout/) | A row of a board layout; its items share the width. | `content` |
| `Bpmn` | A BPMN diagram rendered from BPMN 2.0 XML. | `xml` |
| [`Breadcrumbs`](/java-ui-definition/components/breadcrumbs/) | A breadcrumb trail of links showing where the current page sits in the hierarchy. | `currentItemText`, `breadcrumbs` |
| `BulletedList` | A plain bulleted list — renders as a simple of text items. | `id`, `items` |
| [`Calendar`](/ux-patterns/calendar/) | A calendar with events. month is the ANCHOR date: any day of the month to show in the month and list views, the day of the day view, a day of the week in the week view. | `id`, `month`, `events`, `view`, `views`, `days`, `dayActionId` |
| [`CalloutCard`](/ux-patterns/callout-card/) | A highlighted call-to-action block: an icon, a title, a description and an optional CTA button (ctaLabel + actionId). theme tints it — one of "info", "success", "warning" or "danger" (default info). | `id`, `title`, `description`, `icon`, `ctaLabel`, `actionId`, `theme` |
| [`Card`](/java-ui-definition/components/card/) | A card: optional media, a header (prefix, title, subtitle, suffix), the content and a footer — each slot any component. | `id`, `media`, `headerPrefix`, `header`, `title`, `subtitle`, `headerSuffix`, `content`, `footer`, `variants` |
| [`CarouselLayout`](/java-ui-definition/components/carousel-layout/) | A slideshow that shows one child component at a time with navigation controls. | `id`, `content`, `alt`, `animating`, `auto`, `direction`, `disabled`, `disableSwipe`, `disableKeys`, `duration`, `dots`, `end`, `loop`, `nav`, `selected`, `total` |
| [`Chart`](/java-ui-definition/components/chart/) | A chart (bar, line, pie and others) drawn from labelled datasets. | `chartType`, `chartData`, `chartOptions` |
| `Chat` | The AI assistant chat panel as a component. | `sseUrl`, `uploadUrl` |
| [`Checklist`](/ux-patterns/checklist/) | A checklist with a progress bar: a list of ChecklistItems (done/undone) and a header showing how many are complete. | `id`, `title`, `items` |
| [`CommentThread`](/ux-patterns/comment-thread/) | A read-only discussion thread: a list of Comments, each with an author, text, timestamp and nested replies. | `id`, `comments` |
| [`ComparisonCard`](/ux-patterns/comparison-card/) | A side-by-side comparison of two values (e.g. two periods, plans or options): a title, a left and right label+value, and a delta with a trend ("up" / "down" / "flat") between them. | `id`, `title`, `leftLabel`, `leftValue`, `rightLabel`, `rightValue`, `delta`, `trend` |
| [`ComponentRef`](/define/yaml/partials/) | A reference to a named business component in the ComponentCatalog (coherence-plan .13): drop new ComponentRef("AgencySelector") anywhere a component goes and it stands for that catalogue entry's bound composition. | `ref` |
| [`ConfirmDialog`](/java-ui-definition/components/confirm-dialog/) | A modal that asks the user to confirm, reject or cancel, running an action for each choice. | `header`, `content`, `canCancel`, `canReject`, `rejectText`, `confirmText`, `openedCondition`, `confirmActionId`, `rejectActionId`, `cancelActionId` |
| [`Container`](/java-ui-definition/components/container/) | A plain wrapper around one component, used for styling or grouping. | `content` |
| `ContentLayout` | Redwood-style content page layout: the uniform slot grammar shared by the page archetypes. | `id`, `main`, `aside`, `footer`, `asidePosition`, `asideWidth`, `asideSticky` |
| [`ContentSlot`](/java-ui-definition/components/content-slot/) | A hole for managed content filled by the content service, resolved by the host while it builds the view and replaced by its fallback when there is none. | `key`, `fallback`, `timeoutMs`, `description`, `degradeToClient` |
| `ContextMenu` | A menu that opens on right click (or left click) over a wrapped component. | `menu`, `wrapped`, `activateOnLeftClick` |
| [`CookieConsent`](/java-ui-definition/components/cookie-consent/) | A cookie-consent banner with a message, learn-more link and dismiss button. | `position`, `cookieName`, `message`, `theme`, `learnMore`, `learnMoreLink`, `dismiss` |
| `CustomComponent` | A genuinely NEW component type the platform does not ship (coherence-plan .14): the explicit, relegated per-renderer escape hatch. | `id`, `name`, `props`, `content` |
| `CustomField` | A form field slot that holds an arbitrary component with a label. | `label`, `content`, `colspan` |
| [`DashboardLayout`](/ux-patterns/dashboard/) | A responsive grid of dashboard tiles (Scoreboard, DashboardPanel, MetricCard or any other component). columns fixes the number of grid columns; 0 (the default) lets the renderer pick a responsive column count. | `id`, `columns`, `items` |
| [`DashboardPanel`](/ux-patterns/dashboard/) | A titled tile inside a DashboardLayout. | `id`, `title`, `subtitle`, `content`, `colSpan`, `rowSpan` |
| `Data` | An action result that sets the enclosing component's DATA — values the screen reads (options, search results, anything referenced as ${data.…}) without being part of the form state. newState, when set, also replaces the state. | `data`, `newState` |
| [`Details`](/java-ui-definition/components/details/) | A collapsible block with a summary that expands to reveal its content. | `summary`, `content`, `opened` |
| [`Dialog`](/java-ui-definition/components/dialog/) | A modal dialog with optional header, content and footer, opened over the current page. | `id`, `headerTitle`, `header`, `content`, `footer`, `noPadding`, `modeless`, `top`, `left`, `draggable`, `width`, `height`, `resizable`, `closeButtonOnHeader`, `initialData` |
| [`Directory`](/java-ui-definition/components/directory/) | A page listing menu entries as a browsable directory of links. | `menu` |
| `Div` | A generic block element holding text or child components, for custom layout and styling. | `content`, `children` |
| [`Drawer`](/ux-patterns/drawer/) | A panel that slides in from a side of the viewport, overlaying the current page. | `id`, `headerTitle`, `subtitle`, `header`, `content`, `footer`, `position`, `width`, `size`, `maximizable`, `collapsible`, `peerNav`, `noPadding`, `modeless`, `layout`, `initialData` |
| [`DropZone`](/ux-patterns/drag-to-a-destination/) | A place to DROP dragged listing rows (a listing marked @DragRows(type)): a titled area — a card, a column, an item of a list of destinations — wrapping any content. | `id`, `accept`, `actionId`, `parameters`, `title`, `subtitle`, `content` |
| [`Element`](/java-ui-definition/components/element/) | An arbitrary HTML element or web component with attributes, event bindings and content. | `name`, `attributes`, `on`, `content`, `html` |
| `EmbeddedView` | Embeds a routed view (a @UI/@Route model view — e.g. a Wizard) as an INDEPENDENT server-side component: it renders inside the host tree but routes its OWN actions back to itself (its step navigation, saves, etc.), unlike ModelViewComponent, which renders the view inline and lets its actions bubble to the host. | `view` |
| [`EmptyState`](/ux-patterns/empty-states-and-skeletons/) | A friendly placeholder for "there is nothing here yet": an icon, a title, a description and an optional call-to-action button. | `id`, `icon`, `title`, `description`, `actionId`, `actionLabel` |
| [`EntityHeader`](/ux-patterns/entity-header/) | A persistent context banner for the entity a flow operates on (e.g. the guest of a check-in wizard): the title with its badges (Chips), a subtitle, key facts (Fact label-over-value pairs) and one highlighted metric on the right (metricLabel, big accent-colored metricValue, metricCaption). | `id`, `title`, `badges`, `subtitle`, `facts`, `metricLabel`, `metricValue`, `metricCaption` |
| [`Faq`](/ux-patterns/faq/) | A read-only FAQ list: collapsible question/answer rows. | `id`, `items` |
| [`FeatureGrid`](/ux-patterns/feature-grid/) | A responsive grid of feature cards (icon + title + description), for landing/marketing pages. | `id`, `features`, `columns` |
| [`FileList`](/ux-patterns/file-list/) | A read-only list of attached files, each shown with a type icon, name and size. | `id`, `files` |
| [`FoldoutLayout`](/ux-patterns/foldout/) | Redwood-style foldout: a fixed overview panel on the left with general information about the current record, plus two or more lateral FoldoutPanels with categories of associated information that the user folds in and out. | `id`, `overview`, `panels`, `headerTitle`, `badges`, `orientation`, `navigation`, `overviewEditActionId` |
| [`FoldoutPanel`](/ux-patterns/foldout/) | One lateral panel of a FoldoutLayout: a category of information associated to the record shown in the overview. | `id`, `title`, `subtitle`, `icon`, `open`, `width`, `content`, `summary` |
| [`Form`](/java-ui-definition/components/form/) | A page: a header (title, subtitle, toolbar…) over its content — what a YAML page authors as type: Form. | `id`, `title`, `subtitle`, `noHeader`, `avatar`, `content`, `header`, `footer`, `toolbar`, `buttons`, `overline`, `titlePlaceholder`, `timestamp`, `badges`, `kpis`, `peerNav`, `recordSwitcher`, `banners`, `fabs`, `template` |
| `FormEditor` | A form-definition editor component. value is the JSON FormDefinition string. | `value` |
| [`FormField`](/java-ui-definition/components/form-field/) | One field of a fluent form: an id (the key of the component state it is bound to), a label, a FieldDataType and an optional FieldStereotype (how it is edited — select, textarea, grid…), plus the usual modifiers (required, read-only, placeholder, options…). | `id`, `label`, `dataType`, `stereotype`, `readOnly`, `required`, `autofocus`, `placeholder`, `description`, `options`, `remoteCoordinates`, `optionsSource`, `initialValue`, `columns`, `inlineEditing`, `onItemSelectionActionId`, `rowSelectionShortcut`, `colspan`, `formPosition`, `formStyle`, `formTheme`, `formColumns`, `sliderMin`, `sliderMax`, `stepButtonsVisible`, `step`, `min`, `max`, `itemIdPath`, `attributes`, `detailPath`, `useButtonForDetail`, `minHeightWhenDetailVisible`, `optionsColumns`, `mainFilter`, `treeLeavesOnly`, `multiline`, `propertyRow`, `link`, `fieldType` |
| [`FormItem`](/java-ui-definition/components/form-layout/) | One item of a form layout, wrapping the components that make up a field. | `id`, `content` |
| [`FormLayout`](/java-ui-definition/components/form-layout/) | A responsive form grid: its content (fields, rows) flows into up to maxColumns columns, with labels on top or, with labelsAside, to the left of each field. | `id`, `content`, `autoResponsive`, `labelsAside`, `maxColumns`, `columnWidth`, `expandColumns`, `expandFields`, `responsiveSteps`, `itemLabelWidth`, `columnSpacing`, `itemRowSpacing`, `itemLabelSpacing` |
| [`FormRow`](/java-ui-definition/components/form-layout/) | A row of a form layout grouping components side by side. | `id`, `content` |
| [`FormSection`](/java-ui-definition/components/form-layout/) | A titled section of a form that groups fields, with an optional toolbar. | `title`, `toolbar`, `content` |
| [`FormSubSection`](/java-ui-definition/components/form-layout/) | A titled sub-group of fields inside a form section. | `title`, `content` |
| [`FullWidth`](/java-ui-definition/components/full-width/) | Wraps a component so it stretches across the full width of its container. | `content` |
| [`Funnel`](/ux-patterns/funnel/) | A read-only conversion funnel: stacked horizontal bars, each narrower than the last, showing how a value drops through stages with the conversion percentage between them. | `id`, `stages` |
| `FutureComponent` | A placeholder for a component that is resolved asynchronously on the server. | `instance` |
| [`Gantt`](/ux-patterns/gantt/) | A Gantt/timeline chart: one row per GanttTask, bars spanning the task's dates on a shared time axis, with per-task progress and a today marker. | `id`, `tasks`, `onTaskSelectionActionId` |
| [`Grid`](/java-ui-definition/components/grid/) | A data table with columns, rows and optional tree, striping and border options. | `id`, `content`, `page`, `tree`, `size`, `wrapCellContent`, `compact`, `noBorder`, `noRowBorder`, `columnBorders`, `rowStripes`, `vaadinGridCellBackground`, `vaadinGridCellPadding` |
| [`GridColumn`](/java-ui-definition/components/grid/) | A column of a grid or listing: header label, data type, alignment, sorting and width. | `id`, `label`, `dataType`, `stereotype`, `align`, `sortable`, `sortingProperty`, `filterable`, `frozen`, `frozenToEnd`, `autoWidth`, `flexGrow`, `resizable`, `width`, `tooltipPath`, `actionId`, `text`, `captionPath`, `leadingPath`, `priority`, `identifier`, `editable`, `editorType`, `editorOptions`, `weight`, `aggregate`, `line`, `tones`, `valueLabels`, `fieldType` |
| [`GridGroupColumn`](/java-ui-definition/components/grid/) | A column header that groups several grid columns under a shared label. | `id`, `label`, `columns` |
| [`Heatmap`](/ux-patterns/heatmap/) | A read-only calendar heatmap (GitHub-contributions style): one square per day, laid out in week-columns, colored by intensity from 0 to the maximum value. | `id`, `cells` |
| [`HeroSection`](/ux-patterns/hero-search/) | A prominent page hero: a large title and subtitle, optionally over a background image, with slotted content below (search box, call-to-action buttons…). | `id`, `title`, `subtitle`, `image`, `height`, `centered`, `tone`, `overline`, `content` |
| [`HorizontalLayout`](/java-ui-definition/components/horizontal-layout/) | Lays its content out side by side, with optional spacing, alignment and wrapping (wrap lets a child drop below the others on a narrow screen; flexGrows gives each child its share of the width). | `id`, `content`, `spacing`, `padding`, `margin`, `spacingVariant`, `verticalAlignment`, `justification`, `wrap`, `flexGrows`, `fullWidth` |
| [`Icon`](/java-ui-definition/components/icon/) | A single icon from the built-in icon set. | `icon` |
| [`Image`](/java-ui-definition/components/image/) | An image, by url or data URI. | `src`, `alt` |
| [`KPI`](/java-ui-definition/components/kpi/) | A small key-performance-indicator pair showing a title and a value. | `title`, `text` |
| [`Kanban`](/ux-patterns/kanban/) | A read-only kanban board: columns of cards. | `id`, `columns` |
| [`Ledger`](/ux-patterns/ledger/) | A folio/invoice breakdown with a total: lines (LedgerLine) rendered as concept-left, monospace-amount-right rows (negative amounts in error red, included lines show their label instead of an amount), then a divider and the totalLabel with the big total (null → the client computes the sum of non-included amounts). | `id`, `currency`, `totalLabel`, `lines`, `total` |
| [`Listing`](/define/yaml/pages/) | A searchable, filterable, paginated list of rows with columns, a toolbar and row actions. | `listingType`, `id`, `title`, `subtitle`, `triggers`, `toolbar`, `columns`, `searchable`, `filters`, `emptyStateMessage`, `searchOnEnter`, `autoFocusOnSearchText`, `allRowsVisible`, `size`, `lazyLoading`, `lazyColumnRendering`, `infiniteScrolling`, `useButtonForDetail`, `columnReorderingAllowed`, `pageSize`, `rowsSelectionEnabled`, `header`, `footer`, `preSearch`, `wrapCellContent`, `compact`, `noBorder`, `noRowBorder`, `columnBorders`, `rowStripes`, `vaadinGridCellBackground`, `vaadinGridCellPadding`, `gridStyle`, `detailPath`, `rowRoute`, `onRowSelectionChangedActionId`, `contentHeight`, `initialPage`, `filtersLayout`, `gridLayout`, `groupBy`, `groupActions`, `rowsSource`, `rowStatusField`, `dragType` |
| [`Map`](/java-ui-definition/components/map/) | A street map: tiles centred on position ("lat, lon") at zoom, with optional markers. | `id`, `position`, `zoom`, `markers`, `markerActionId`, `tileUrl`, `attribution` |
| [`Markdown`](/java-ui-definition/components/markdown/) | A block of text rendered from Markdown. | `markdown` |
| [`MasterDetailLayout`](/java-ui-definition/components/master-detail-layout/) | A two-pane layout with a master list and a detail area that shows the selected item. | `id`, `master`, `detail`, `orientation`, `variant` |
| [`MatrixGrid`](/ux-patterns/matrix-grid/) | A MATRIX of values by column — typically metrics or types (rows) by dates (columns), the shape of an availability or forecast grid. | `id`, `rowHeaderLabel`, `columns`, `sections`, `cellActionId`, `editActionId` |
| [`MenuBar`](/java-user-manual/build/navigation-and-menus/) | A horizontal bar of menu entries, some of which may open submenus. | `options` |
| `MessageInput` | A chat-style message input. | `id`, `actionId` |
| `MessageList` | A read-only chat-style list of MessageListItems (Vaadin/PatternFly message list). | `id`, `items` |
| [`Meter`](/ux-patterns/meter/) | Consumption against a limit (e.g. balance vs preauthorization): a small-caps label, the formatted value big with the unit symbol appended, a progress track filled to value/max, and a muted caption (absent → the computed fill percent). | `id`, `label`, `value`, `max`, `unit`, `caption`, `warnAt`, `dangerAt` |
| [`MetricCard`](/ux-patterns/dashboard/) | A KPI tile for dashboards: a title, a prominent value, an optional trend indicator and an optional drill-in action. | `id`, `title`, `value`, `unit`, `trend`, `trendLabel`, `icon`, `description`, `actionId`, `timeframe` |
| [`MicroFrontend`](/java-ui-definition/components/micro-frontend/) | Embeds a UI served from another backend (baseUrl) or route inside the current page. | `baseUrl`, `route`, `consumedRoute`, `serverSideType`, `appState`, `actionId`, `resolve`, `timeoutMs` |
| [`NotFound`](/ux-patterns/not-found/) | The page shown in place of a screen whose record or route does not exist: an icon, a heading, a short explanation and a way back. | `id`, `title`, `message`, `backRoute`, `backLabel` |
| [`Notice`](/ux-patterns/notice/) | A compact inline banner: a rounded, theme-tinted strip with a small severity icon and one line of text — for notices like "2 quejas pendientes" embedded anywhere in the UI (inside cards, columns, forms). | `id`, `text`, `theme`, `icon`, `noIcon`, `actionLabel`, `actionId`, `status`, `slim`, `fullWidth`, `inlineContent`, `content` |
| [`Notification`](/java-ui-definition/components/notification/) | A transient toast notification with an optional title and text. | `title`, `text` |
| [`OfferCard`](/ux-patterns/offer-card/) | A current-vs-upgrade offer card: an optional image header, a floating tag chip, title + subtitle, features as outline chips and a footer. | `id`, `tag`, `title`, `subtitle`, `image`, `features`, `priceLabel`, `actionLabel`, `actionId`, `current`, `currentLabel`, `added`, `addedLabel` |
| [`OrgChart`](/ux-patterns/org-chart/) | A read-only top-down hierarchy chart (org chart, category tree): a single root OrgNode whose children fan out below it, connected by lines. | `id`, `root` |
| [`Partial`](/define/yaml/partials/) | A reference to a reusable piece of UI, usable anywhere a component is. | `ref` |
| [`PaymentPicker`](/ux-patterns/payment-picker/) | A payment method picker with context and confirm CTA: a row of segmented buttons (PaymentMethod, initial selection seeded from selected, toggled client-side), an optional success-tinted context chip (contextLabel over contextValue) and a primary confirmLabel button dispatching actionId with { "_method": selectedId }. | `id`, `actionId`, `methodActionId`, `methods`, `selected`, `contextLabel`, `contextValue`, `confirmLabel` |
| [`PlanningBoard`](/ux-patterns/planning-board/) | A planning board / tape chart: one row per PlanningResource, one column per day between from and to, and colored PlanningBlocks spanning their date ranges on their resource's row — the rooms × days grid every hotel/rental/staffing back-office needs. | `id`, `resources`, `blocks`, `from`, `to`, `moveActionId`, `selectActionId`, `attributeColumns`, `resizeActionId`, `openActionId`, `rangeSelectActionId` |
| [`Popover`](/java-ui-definition/components/popover/) | A popover: the wrapped component, and the content shown in a small floating panel next to it — on click by default, or on hover/focus with trigger = hover (read-only details: a rate breakdown, a reservation summary). | `id`, `content`, `wrapped`, `trigger` |
| [`PricingTable`](/ux-patterns/pricing-table/) | A pricing / plan-comparison table: a row of PricingPlan cards side by side, one optionally marked featured (highlighted). | `id`, `plans` |
| [`ProcessMonitor`](/ux-patterns/process-monitor/) | A monitored-automations health board: a bordered list of ProcessItem rows, each with a colored status dot, the process name and involved systems, OK/warning/error counters and an optional fix button dispatching the item's actionId with no parameters. | `id`, `items` |
| [`ProgressBar`](/java-ui-definition/components/progress-bar/) | A progress bar showing a value between a minimum and maximum, or an indeterminate wait. | `indeterminate`, `min`, `max`, `value`, `valueKey`, `text`, `theme` |
| [`ProgressSteps`](/ux-patterns/progress-steps/) | A read-only horizontal progress indicator: a row of numbered Steps connected by a line, showing where a multi-step process stands. | `id`, `steps`, `vertical`, `resultTitle` |
| [`RecordMerge`](/ux-patterns/record-merge/) | COMPARE AND MERGE: two (or more) records of the same type side by side, one column per record and one row per field, with the rows whose values differ highlighted and a pick per row ("use the value from A") — plus a free edit where a field is editable. | `id`, `title`, `records`, `fields`, `mergeActionId`, `mergeLabel`, `parameters`, `differencesOnly` |
| [`ResourceGrid`](/ux-patterns/resource-grid/) | An availability/selection grid (e.g. a room picker): a CSS grid of ResourceItem cards with a fixed columns count (0/absent → responsive auto-fill). | `id`, `actionId`, `columns`, `recommendedLabel`, `items` |
| `ResponsiveGrid` | One responsive grid — THE general layout foundation (coherence-plan .9). | `id`, `columns`, `gap`, `content`, `colSpans`, `stackBelow`, `gridTemplateAreas`, `stickyAreas`, `reorderable` |
| [`Scoreboard`](/ux-patterns/dashboard/) | A horizontal band of MetricCards summarising essential status information, typically placed at the top of a dashboard. | `id`, `metrics` |
| [`Scroller`](/java-ui-definition/components/scroller/) | A scrollable viewport around a component whose content may overflow. | `content` |
| `Separator` | A horizontal divider line () separating contents inside a section, form or any layout. | `id`, `attributes` |
| [`Skeleton`](/ux-patterns/empty-states-and-skeletons/) | A shimmering placeholder shown while real content loads. | `id`, `variant`, `count` |
| `Slotted` | Places a component into a named slot of a template (coherence-plan .7). | `slot`, `content` |
| [`SplitLayout`](/java-ui-definition/components/split-layout/) | A two-pane layout separated by a draggable splitter. | `id`, `master`, `detail`, `orientation`, `variant`, `fullWidth` |
| [`Stat`](/ux-patterns/stat/) | A compact KPI stat: a label, a big value (with optional unit), a delta with a trend direction ("up" / "down" / "flat") and an inline sparkline drawn from spark. | `id`, `label`, `value`, `unit`, `delta`, `trend`, `spark`, `actionId` |
| `State` | An action result that sets the enclosing component's STATE from an object's fields — typically return new State(this); after the action changed the view model's fields, so the form shows the new values without re-rendering the whole screen. | `state` |
| [`StatusList`](/ux-patterns/status-list/) | A bordered list of rows with an icon, a title plus description, and a status chip and/or a small action button on the right (see StatusItem) — incidents, side-effects checklists, pending-tasks lists. | `id`, `items`, `compact`, `frameless`, `rowActionId`, `columns`, `itemHeadingLevel` |
| [`Tab`](/java-ui-definition/components/tab-layout/) | One tab of a TabLayout: a label (with an optional badge) and the content it shows. active makes it the tab selected on first render; shortcut (e.g. "alt+1") selects it from the keyboard. | `label`, `content`, `shortcut`, `active`, `routeKey`, `badge` |
| [`TabLayout`](/java-ui-definition/components/tab-layout/) | A set of tabs where selecting a tab shows its content. | `id`, `tabs`, `orientation`, `variant`, `groupRelationship`, `adaptable` |
| [`TaskProgress`](/ux-patterns/task-progress/) | A subtask completion banner (e.g. "pax 1/4 registered"): a label, done/total pills (filled up to done) and a right-aligned button (actionLabel + actionId, dispatched with no parameters; hidden when absent). | `id`, `label`, `total`, `done`, `actionLabel`, `actionId` |
| [`TaskQueue`](/ux-patterns/task-queue/) | A grouped work queue rail (e.g. "Llegadas hoy" / "Salidas hoy"): vertical groups (QueueGroup) of clickable cards (QueueItem). | `id`, `actionId`, `groups` |
| [`Testimonials`](/ux-patterns/testimonials/) | A responsive grid of testimonial / quote cards (a quote, an author with role and avatar, an optional star rating), for landing/marketing pages. | `id`, `items` |
| [`Text`](/java-ui-definition/components/text/) | A piece of text: a block (div) by default, or a paragraph, a span or a heading (TextContainer h1…h6), with an optional TextSize and variants. text may carry ${…} templates over the component's state and data. noMargins drops the container's block margins (for tight captions). | `id`, `text`, `container`, `variants`, `size`, `noMargins`, `attributes` |
| [`Timeline`](/ux-patterns/timeline/) | A read-only vertical timeline / activity feed: a chronological list of TimelineItems, each a dot on a vertical rail with a title, optional description, timestamp label and icon. | `id`, `items` |
| [`Tooltip`](/java-ui-definition/components/tooltip/) | Wraps a component and shows explanatory text when the user hovers or focuses it. | `text`, `wrapped` |
| [`TrendChart`](/ux-patterns/trend-chart/) | A read-only lightweight line/area chart: a single series of values plotted as an SVG line (optionally area-filled), with optional x-axis labels, min/max markers and a hover tooltip. | `id`, `title`, `values`, `labels`, `color`, `area` |
| [`VerticalLayout`](/java-ui-definition/components/vertical-layout/) | Stacks its content vertically, with optional spacing, padding and alignment (flexGrows gives each child its share of the height). | `id`, `content`, `spacing`, `padding`, `margin`, `spacingVariant`, `horizontalAlignment`, `justification`, `wrap`, `flexGrows`, `fullWidth`, `hiddenOverflow` |
| [`VirtualList`](/java-ui-definition/components/virtual-list/) | A lazily rendered, scrollable list of components that loads pages on demand. | `page` |
| `Workflow` | A workflow-definition editor component. value is the JSON WorkflowDefinition string. | `value` |

### Toolbar and button entries

What a `toolbar:` or `buttons:` list holds.

| Type | What it is | Main attributes |
|---|---|---|
| [`Button`](/java-ui-definition/components/button/) | A button of a component tree (the fluent counterpart of @Button/@Toolbar): a label and/or icons, an appearance (ButtonStyle, ButtonColor, ButtonSize) and what it does — an actionId the enclosing component runs (an action method of the same name), or a handler of its own (runnable/callable). parameters travel to the action. | `id`, `label`, `iconOnLeft`, `iconOnRight`, `image`, `color`, `variant`, `buttonStyle`, `size`, `autofocus`, `disabled`, `actionId`, `actionable`, `runnable`, `callable`, `parameters`, `shortcut`, `separatorBefore`, `rowsSelectedRequired` |
| `ButtonGroup` | A group of buttons shown together, usually collapsed into a single dropdown trigger. | `id`, `label`, `iconOnLeft`, `iconOnRight`, `separatorBefore`, `buttons` |

<!-- END GENERATED -->
