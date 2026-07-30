# Las APIs reales de los page templates de Redwood/VB — análisis para Mateu

> **Fuente primaria:** metadata de componente (properties + slots + events + methods) extraída de
> los loaders del pack **`oj-sp` 2604.1.0** servido por el CDN oficial
> (`https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0/<componente>/loader.js` — cada loader
> embebe su `component.json` o su `_metadata` de VComponent). Es la MISMA versión que consume
> nuestra app VB (`frontend/web/monorepo/apps/redwood/webApps/vbredwoodapp/app-flow.json`, requirejs paths).
> 34 componentes extraídos, 2026-07-30. Complementa (no sustituye) el plan
> `design/redwood-page-templates-plan.md`, que se hizo desde la anatomía visual de
> redwood.oracle.com; esto es la superficie de API real que Oracle da al desarrollador VB.

---

## 1. El hallazgo central: todos los templates comparten UNA gramática

Extraídos los 34, la conclusión no es "34 APIs distintas" sino **una gramática de 6 partes que
cada template instancia**. Esto valida la dirección de las Capas 1–4 del plan y la afina:

```
page template = header canónico
              + slots (vocabulario CERRADO por template)
              + displayOptions (interruptores tri-estado de affordances INCORPORADAS)
              + eventos (vocabulario FIJO de verbos sp*)
              + props de estado controlado (la UI-state es una prop leíble/escribible)
              + displayMode / density (tono y densidad)
```

### 1.1 El header canónico (se repite idéntico en ~todos los page templates)

| Elemento | Prop oj-sp | En Mateu hoy |
|---|---|---|
| Título / subtítulo | `pageTitle`, `pageSubtitle` | ✅ `@Title`/`subtitle` |
| Overline (texto sobre el título) | `overlineText` (welcome) | ❌ |
| Placeholder de título en modo create | `pageTitlePlaceholder` = "New Page" (create-edit) | ❌ |
| Avatar | `avatar {src, initials}` | ✅ `PageDto.avatar/icon` |
| Badge de estado | `badge {text, status: neutral\|danger\|warning\|success\|info}` | ✅ `@BadgeInHeader` (colores Lumo ≈ mismos 5) |
| Contextual info (pares clave/valor) | `contextualInfo [{label, value}]` + `displayOptions.contextualInfoLabel/-Sticky` | ✅ `@KPI` (sin sticky/label-toggle) |
| Timestamp | `timestamp` | ✅ `@Timestamp` |
| Acción primaria | `primaryAction {label, disabled/display}` | ✅ (por arquetipo; sin rol wire explícito) |
| Acciones secundarias | `secondaryActions [{id, label, icon, display}]` | ✅ toolbar/buttons |
| Volver al padre | `displayOptions.goToParent` + evento `spGoToParent` | 🟡 breadcrumbs aproximan |
| Back en flujo | `displayOptions.inFlowBack` + `spInFlowBack` | 🟡 cancel/back a la izquierda |
| Peer nav (objeto anterior/siguiente) | `previousItem/nextItem {id, label, display}` + `spPreviousItem/spNextItem` | ✅ `PeerNavigationSupplier`/`PeerNav` |
| **Switcher de contexto/registro** | `selectContext` / `selectObject` `{data, itemText, labelHint, secondaryText, avatar, icon}` + `selectContextValue(+Item)` + `dataSwitcherType: context\|object` + `displayOptions.switcherSearch` | 🟡 solo dentro de `GeneralOverview` (campo `record`); en oj-sp es un elemento DE CABECERA disponible en general-overview, dashboard-landing, smart-search, collection-detail y visual-space |
| Búsqueda global | slot `search` (presente en TODOS los page templates) | ✅ smart search bar / ⌘K a nivel app |
| Región de anuncios a11y | slot `announcement` | ❌ (aria-live) |

Puntos que el header oj-sp confirma de decisiones nuestras:
- **Roles de botón**: el template POSEE las affordances primary/save/cancel/next — el dev solo da
  label + handler. Nuestros arquetipos hacen exactamente eso (el diferimiento de `role` en el
  fluent `Button` sigue siendo correcto: la semántica vive en el arquetipo, no en el botón).
- **Peer nav y timestamp** (Fase 0) son 1:1 con la API real (`nextItem/previousItem`, `timestamp`).

### 1.2 `displayOptions`: la gramática de interruptores

Cada template trae una bolsa `displayOptions` de toggles **tri-estado** para affordances que el
template ya lleva incorporadas. Los valores son consistentemente `on | off | disabled` (o boolean
cuando no cabe "disabled"):

- Transaccionales: `save`, `saveAndClose`, `next: on|off|unconfigured`, `undo`, `redo`,
  `versionHistory`, `feedback`, `bottomActions`
- Estructura: `contextualInfoLabel`, `contextualInfoSticky`, `scoreboardSticky`, `switcherSearch`,
  `promoteInfoSlot`, `mobileMenu`, `checklistDisplay: current|all`, `editLayout`
- Presentación: `density: standard|compact` (en CADA page template), `responsivePadding: on|off`,
  `imageStretch`, `mobileImage`

**Equivalente Mateu:** los gates del Crud (`canView/canEdit/...`, `@Not*`), `editInDrawer()`,
`@Compact`, los overrides de label. Mismo espíritu (sustractivo sobre un pack completo), pero
disperso: cada arquetipo inventa su mecanismo (método boolean, anotación, override). La lección de
oj-sp es **un solo lugar y una sola forma** por template: una bolsa de affordances con nombre, con
tri-estado (el "disabled" — visible pero inerte — hoy no lo podemos expresar en casi ningún sitio).

### 1.3 Slots: vocabulario cerrado y pequeño por template

Nada de "N hijos posicionales": cada template define 2–6 slots CON NOMBRE Y ROL. El inventario
completo observado:

| Slot | Templates | Rol |
|---|---|---|
| *(default)* | casi todos | contenido principal |
| `main` / `info` | general-overview | contenido / panel contextual lateral (con `promoteInfoSlot` para subirlo en móvil) |
| `main` / `detail` / `innerEnd` | advanced-create-edit | formulario / panel contextual / panel lateral acoplado |
| `overview` / `main` | item-overview-page | panel key-info / cuerpo |
| `body` / `footer` | item-overview (panel) | cuerpo y pie del key-info |
| `detailTemplate` / `noSelection` | collection-detail | detalle (template slot con `data`) / vacío sin selección |
| `kpi` | dashboard-landing | banda scoreboard |
| `completionStep` | guided-process | pantalla de resultado |
| `header` | los 3 drawer templates | cabecera custom del drawer |
| `innerEnd` / `outerEnd` / `innerBottom` / `outerBottom` + `messages` | data-management | paneles acoplados (drawer lateral/inferior, dentro o fuera del contenido) |
| `overview` / `drilldown` | foldout-layout | panel siempre visible / drill-down |
| `noData` / `summary` / `recommendation` | foldout-panel | vacío / **contenido de la tira colapsada** / recomendación |
| `dashboard` | smart-filter-search | contenido mostrado ANTES de buscar |
| `search`, `announcement` | universales | búsqueda de cabecera, aria-live |
| `globalHeader` / `stretchingContents` | simple-ui-shell | shell |
| `interactiveList` / `detail` | visual-space | lista lateral / detalle |
| `eventTemplate` / `tooltipTemplate` / `eventDetailTemplate` | calendar | templates por evento |

**Equivalente Mateu:** `ContentLayout(main, aside, footer)` + `@Aside` (Capa 1–2) van exactamente
en esta dirección. El delta: oj-sp demuestra que el vocabulario correcto NO es un layout genérico
único sino **el layout genérico + 2–3 slots específicos por familia** (`kpi`, `completionStep`,
`noSelection`, `summary`…) — que en Mateu ya expresamos como métodos/campos del arquetipo
(`emptyDetail()`, último paso del wizard, `MetricCard` fields). Es decir: nuestro modelo "slot =
método overridable del arquetipo" es isomorfo al de oj-sp; lo que falta es DOCUMENTARLO como slots
(ver §4).

### 1.4 Eventos: un vocabulario fijo de verbos

Todos los templates emiten del MISMO conjunto (definido una vez en `EventDispatcher`):
`spPrimaryAction`, `spSecondaryAction{secondaryItem|actionId}`, `spCancel`, `spSave`,
`spSaveAndClose`, `spNext`/`spPrevious`, `spGoToParent`, `spInFlowBack`,
`spPreviousItem`/`spNextItem`, `spAdd`/`spDelete`/`spExport`, `spEdit`/`spShare`/`spExpand`,
`spSkip{skippedStepId}`, `spBeforeStepNavigate`/`spBeforeNext` (cancelables),
`spUnsavedChangesDiscard`/`spUnsavedChangesCancel`, `spPrimaryActionAndNext`/`spPrimaryActionAndClose`.

**Equivalente Mateu:** los actionIds convencionales (`view`, `edit`, `save`, `cancel-new`,
`search`, `update-row`, `selectCollectionItem`, `openTodoItem`…). Mismo modelo. Deltas
interesantes: los eventos **before** cancelables (validación por paso antes de navegar — nuestro
wizard valida en el action, no tiene hook "beforeStepNavigate" declarativo) y los verbos compuestos
(**save-and-next**, **save-and-close**, ver §3.9).

### 1.5 Estado de UI como props controladas

La UI-state del template es una prop que el host lee y escribe: `currentStep`, `selectedItems`,
`selectContextValue`, `drawerState: auto|closed|maximized|minimized`,
`endOpened/bottomOpened: inner|outer|none`, `overviewExpanded`, `editLayoutMode`,
`selectedViewType: table|list|cards`, `selectedPanel` (foldout). **Equivalente Mateu:** los campos
de estado del componentState (`_view`, `_month`, `_item`, `_selectedId`) — mismo modelo, y el
nuestro además persiste server-side. Sin gap conceptual.

### 1.6 displayMode y density

- `displayMode: light | mixed` en casi todos — el tono del lienzo (blanco vs banda gris del
  header). En Mateu equivale a la banda DS-NEUTRAL de `mateu-page` + el canvas `#F1EFED`/`#FBF9F8`
  del renderer redwood — hoy decisión del renderer, no del autor. Candidato a exponerse.
- `density: standard | compact` en cada template ↔ `@Compact` ✅ (nuestro es de página, el suyo
  también — paridad conceptual completa).

---

## 2. Referencia por template (API real, condensada)

Para cada template: props distintivas (las del header canónico de §1.1 no se repiten), slots y
eventos propios. Metadata completa en el CDN (ver cabecera del doc).

### 2.1 `welcome-page`
- **Props:** `overlineText`, `descriptionText`, `themedImage: pebbles|none`,
  `backgroundColor: dark-ocean|dark-pine|dark-lilac|dark-teal|dark-rose|dark-pebble|dark-slate|dark-plum|dark-sienna|auto`,
  `illustrationBackground`/`illustrationForeground` (DOS capas de ilustración),
  `primaryAction`/`secondaryAction`/`secondaryActions` con `icon`,
  `displayOptions {imageStretch: none|full, mobileImage, inFlowBack, responsivePadding}`
- **Slots:** default (tiles bajo el hero), `search`
- **Eventos:** `spPrimaryAction`, `spSecondaryAction{actionId}`, `spInFlowBack`

### 2.2 `general-overview-page`
- **Props:** header canónico completo + `selectContext`/`selectObject` +
  `dataSwitcherType: context|object` + `previousItem/nextItem` +
  `displayOptions {promoteInfoSlot, switcherSearch, contextualInfoLabel, density…}`
- **Slots:** `main`, `info` (panel contextual lateral), `search`, `announcement`
- **Eventos:** header canónico + `spPreviousItem`/`spNextItem`

### 2.3 `item-overview-page` + patrón `item-overview`
- **Página:** slots `overview` (key info) / `main`; `overviewExpanded` (colapsable) +
  `spOverviewCollapse`; `nextItem/previousItem`; método `getPreviousNextItems`.
- **Patrón key-info:** `itemTitle/itemSubtitle`, `isFavorite`, `photo{src}`, `badge{…, style:
  strong|subtle, position: leading|trailing}`, `displayOptions {edit, share, favorite}`; slots
  `body`/`footer`; eventos `spEdit`, `spShare`, `spExpand`.

### 2.4 `collection-detail-page` (+ `collection-detail-stacker`)
- **Props:** `selectedItems` (¡plural!), `selectContext` switcher, header canónico,
  `displayOptions {mobileMenu, inFlowBack, goToParent, density}`
- **Slots:** default (la lista), `detailTemplate` (**template slot** que recibe `data` del ítem),
  `noSelection`, `search`, `announcement`
- **Eventos:** `spSecondaryAction`, `spGoToParent`, `spInFlowBack`

### 2.5 `smart-search-page` (+ patrón `smart-filter-search`)
- **Props:** `smartFilters {askHint, autofocus, expanded, autocompleteSource, filtersMetadata,
  resultsData, suggestions, suggestionFilters, appliedFilters, value, totalCount}`,
  `showAllTotalCount`/`allTotalCountMessage`, `collectionScroller: off|page`, `selectContext`.
- **Slots:** default (resultados), `search`, `announcement`; el patrón smart-filter-search añade
  `main` + **`dashboard`** (contenido pre-búsqueda).
- **Eventos:** `smartFiltersChangedAction` + header canónico.

### 2.6 `dashboard-landing-page` (+ `dashboard-grid`, `dashboard-panel`, `scoreboard`)
- **Props:** slot `kpi` + `displayOptions {scoreboardSticky, editLayout, editModeRestoreDefaults,
  switcherSearch…}`, **`editLayoutMode` + `contentLibraryData` + `editLayoutOptions {share,
  properties, contentLibraryFilters}`** (dashboards personalizables por el usuario final),
  `selectContext`/`selectObject`.
- **Eventos:** header + `spRestoreDefaults`, `spShare`.
- `dashboard-panel {panelTitle, panelSubtitle}` ↔ nuestro `@Panel`/`DashboardPanel` ✅.
  `scoreboard {data, maxKpis, selection, selectionMode: none|single}` ↔ `Scoreboard` +
  `MetricCard.actionId` ✅.

### 2.7 `guided-process` (wizard de página)
- **Props:** `processTitle/processSubtitle`, `avatar`, `steps[]`, `currentStep`,
  **`resumeStepId`** (reanudar donde se dejó), `primaryAction {label, disabled,
  **availableFromStep**, progressState}`, `displayOptions {save, saveAndClose, checklistDisplay:
  current|all, avatar, overviewAnimation, density}`, `completionStatus`, `continueWorkingStatus`.
- **Slots:** default (pasos), **`completionStep`**, `announcement`.
- **Eventos:** `spPrimaryAction`, **`spBeforeNext`/`spBeforeStepNavigate`** (validación
  cancelable), `spCancel`, `spSave`/`spSaveAndClose` (borrador), **`spSkip{skippedStepId}`**.

### 2.8 Los 4 drawer templates
- **`general-drawer-template`:** `drawerTitle/Subtitle`, `drawerSize: sm|md|lg|xl`,
  `drawerState: auto|closed|maximized`, `displayOptions {maximize, header: auto|tabsOnly,
  goToParent}`, `primaryAction`/`secondaryActions`/`closeAction`, `nextItem/previousItem`; slots
  `header` + default; eventos `spClose`, `spPrevious/spNext`, `spGoToParent`.
- **`create-edit-drawer-template`:** + `primaryActionType: auto|create`, **`unsavedChanges`**
  (activa el diálogo discard/cancel), **`displayErrorMessageBanner` + `errorMessage`**,
  `nextItem/previousItem`; eventos **`spPrimaryActionAndNext`**, **`spPrimaryActionAndClose`**,
  `spUnsavedChangesDiscard/Cancel`.
- **`bottom-drawer-template`:** `drawerState: auto|closed|maximized|minimized`,
  `displayOptions {drawerMode: fixed|closable, title, maximize}`, **`discoverability: on|off`**
  (asoma una pestaña para descubrirlo); evento cancelable `spBeforeBottomDrawerStateChange`.
- **`guided-process-drawer-template`:** `processTitle`, `steps[]`, `currentStep`, `drawerSize`,
  `introductionPanel {secondaryText, indexDisplay}`, `displayErrorMessageBanner`; eventos
  `spBeforeStepNavigate`, `spSkip`, `spContinue`, `spCancel`, `spPrimaryAction`.

### 2.9 `data-management-page`
La API real es MUCHO más rica que "grid ⇄ gantt": es una página transaccional con **4 paneles
acoplables**: slots `innerEnd`/`outerEnd`/`innerBottom`/`outerBottom` (+ `messages`,
`announcement`, `search`), gobernados por `endOpened`/`bottomOpened: inner|outer|none`,
`endDisplay`/`bottomDisplay: reflowModeless|overlayModal`, `bottomDrawerState:
auto|closed|maximized|minimized`, `displayOptions {bottomDrawerMode: fixed|closable,
bottomDrawerHeight: medium|full, save, feedback, density…}` + header transaccional (save/cancel) +
`feedback` + método `openFeedback`. *inner vs outer* = el panel empuja el contenido (layout) o se
superpone al viewport.

### 2.10 `task-organizer-page` (nuestro TodoList)
API mínima: `pageTitle`, `primaryAction {label, icon, display}`, `displayOptions {density}`,
`displayMode`; slots default + `search`; evento `spPrimaryAction`. **Mateu ya lo cubre entero.**

### 2.11 `calendar`
- **Props:** `calendarEvents (DataProvider)`, **`calendarProviders[]` + `visibleCalendars[]`**
  (multi-calendario), **`selectedViewValue`** + `displayOptions {monthView, weekView, dayView,
  listView: on|off, firstDayOfWeek, eventCounter, eventSortCriteria, createEvent,
  createEventLabel, eventDetailMode}`, `selectionMode: none|single|multiple`, `readonly`,
  `emptyState {primaryText}`, `eventDetailActions[]`.
- **Slots:** `eventTemplate`, `tooltipTemplate`, `eventDetailTemplate` (todos template slots).
- **Eventos:** `spCalendarEventCreate/Update/DetailAction`.

### 2.12 `foldout-layout` + `foldout-panel`
- **Layout:** `orientation: horizontal|vertical`, `animate`, `selectedPanel` (controlado),
  `nextStep/previousStep` + `displayOptions {bidirectionalNavigation, goToParent, inFlowBack,
  background: default|transparent}`; slots default (paneles) + `overview` + **`drilldown`** +
  `search`; eventos `spPrevious/spNext`, `spGoToParent`, `spInFlowBack`.
- **Panel:** `panelTitle`, `secondaryActions`; slots default + **`summary`** (lo que se ve en la
  TIRA COLAPSADA) + `recommendation` + `noData`; evento `spAction{actionId}`.

### 2.13 `advanced-create-edit` + headers transaccionales
- **advanced-create-edit:** slots **`main` / `detail` / `innerEnd`** + `search`;
  `displayOptions {next: on|off|unconfigured, save, saveAndClose, bottomActions,
  contextualInfoSticky, density…}`, `endOpened: inner|none`, `badge`, `timestamp`.
- **`header-create-edit`** (el header transaccional reusable): añade `pageTitlePlaceholder`,
  `displayOptions {versionHistory, undo, redo, feedback, footerActions}` + `feedback
  {customFeedback[], acknowledgmentMessage, pageVersion}` + método `openFeedback`; eventos
  `spVersionHistory`, `spUndo`, `spRedo`, `spFeedbackAction`.
- **`simple-create-edit`:** subset (slot `main`; save/feedback).

### 2.14 `collection-container` (el chrome de listado)
`displayOptions {add, delete, columns, selector, export — todos on|off|disabled}`,
`viewTypes/selectedViewType: table|list|cards`, `groupOptions/selectedGroupValue` +
`groupSummaryLabel/Value`, `layoutSortOptions/selectedSortValue`, `layoutContextOptions`,
`functionalPrimaryActions/functionalSecondaryActions (+ groups)`, `smartFilters`,
`selectedItemsCount/totalItemsCount`, `activeColumns/hiddenColumns`; slots default + `search`;
eventos `spAdd`, `spDelete`, `spExport`, `spPrimaryAction`, `spSecondaryAction`.
**Es el espejo casi 1:1 de nuestro Crud/listing** (gates, GridLayout, @GroupBy+@Aggregate,
@ListToolbarButton, smart bar, column chooser, selección). Paridad fuerte ✅.

### 2.15 `section` y `detail-panel`
- **`section`:** `sectionTitle`, `level: section|subsection`, `displayOptions {edit, viewMore,
  navigationActions: top|bottom}`, `primaryAction {type: edit|add}`; eventos `spEditAction`,
  `spViewMoreAction`, `spNavigationAction`. → affordances DE SECCIÓN (editar/añadir/ver más).
- **`detail-panel`:** `panelTitle/Subtitle`, `editMode: on|off`, `displayOptions {edit}`; eventos
  `spUpdate`, `spCancel`. → panel read-only con edición in-place (≈ nuestro `AutoEditableView`).

### 2.16 `simple-ui-shell`
`pageLayout: fixedWidth|fullWidth|edgeToEdge` (↔ **`PageWidthStyle` es 1:1** ✅ — nota: en VB es
prop del SHELL por página, como nuestro wire `pageWidth`), `chat {display, count}` (↔ AI FAB ✅);
slots `globalHeader` / `stretchingContents`.

### 2.17 `hero-search-page` (↔ nuestro `HeroSearch`)
- **Props:** `pageTitle`, `description`, `descriptionHotspot {label, data}` (texto clicable dentro
  de la descripción), `collectionView: on|off`, `suggestions[]` (chips de sugerencia bajo el
  buscador), `selection`, `avatar`.
- **Slots:** default (resultados), **`searchTemplate`** (el buscador), **`detailTemplate`**,
  `announcement`.
- **Eventos:** `spSuggestionAction`, `spDescriptionHotspotAction` + header canónico.
- Mateu `HeroSearch` cubre hero+listing; gaps menores: `suggestions` (chips), hotspot.

### 2.18 `step-by-step-page` y `configuration-drawer-template`
- **`step-by-step-page`** (proceso lineal a pantalla completa, pariente del guided-process):
  `processTitle`, `contextualInfo`, `steps[]`, `currentStep`, `displayOptions {optimizedFor,
  **timer**, **finishLater**, cancel}`, `timer {startTime, timeInterval}` (¡proceso cronometrado!);
  eventos `spBeforeStepNavigate`, **`spFinishLater`** (la forma canónica del "guardar y seguir
  luego"), `spCancel`.
- **`configuration-drawer-template`**: el 5º drawer (VPAT 25.04) — mínimo: `drawerTitle/Subtitle`,
  `primaryAction`; slots `header` + default; `spPrimaryAction`/`spClose`. Un drawer de ajustes.
- **`about-page`**: `versionInformation {release, jet, …}`, `copyrightUrl` — trivial, sin slots.

### 2.19 Sin equivalente Mateu (y está bien)
`canvas-page`, `visual-space-page`, `data-authoring-page`, `analytics-canvas`,
`diagram-builder`, `network-flow-diagram` — canvases de autoría/diagramado muy nicho. Fuera de
alcance salvo demanda concreta.

---

## 2bis. El mecanismo genérico de VB (investigación web, 2026-07-30)

Cómo define VB un "page template" en general (fuentes: docs.oracle.com de VB, deck oficial OCW24,
VPATs de Redwood Extensions 23.01/25.04 — el catálogo canónico del pack):

1. **Template** (Component Exchange) = un web component JET con el contrato estándar
   props/slots/events. Reglas oficiales: *"Templates are updated by Oracle. Templates are not
   typically used by themselves. Templates cannot be changed."* — el template es CERRADO; el dev
   solo configura y rellena slots. (= nuestro arquetipo: clase base cerrada + overrides.)
2. **Pattern** = template + GENERADOR: al instanciarlo crea en la página "all variables, events,
   listeners, and action chains required by the pattern to work" (p. ej. el simple-create-edit
   pattern genera Validation Group + Dynamic Form en `main` + diálogo unsaved-changes + action
   chain de save). (= nuestro scaffold `/mateu-screen` + lo que el arquetipo trae de serie:
   dirtyGuard, validación, persist — Mateu lo hace en runtime, VB lo genera como código.)
3. **Fragment como page template** = cualquier fragment marcado "Used For: page": slots CON NOMBRE
   (los fragments no tienen default slot) + input parameters que aparecen como propiedades de la
   página. (= composición fluent / `ContentLayout`.)

Correcciones de catálogo que dejó la investigación (VPAT 25.04):
- Los nombres reales NO llevan sufijo `-page-template` (son `oj-sp-welcome-page`,
  `oj-sp-collection-detail-page`…), y cada template suele tener su `-pattern` gemelo.
- **`to-do list` NO existe** en el pack oj-sp (solo `task-card`/`activity-list-item`); nuestro
  `TodoList` viene del pattern book de diseño de redwood.oracle.com, no del pack. El equivalente
  de componente más cercano es `task-organizer-page` (§2.10).
- **`calendar` es un componente, no un page template** — Oracle lo aloja dentro del General
  Overview template; nuestro `CalendarPage` es por tanto MÁS template que el suyo.
- Drawers: son CINCO templates (create-edit, general, bottom, guided-process, configuration).
- Otros templates de página del pack sin analizar en detalle: `multimedia-content-page-pattern`,
  `nbox-page-pattern`, `gantt-page-pattern` (nuestro `GanttPage` tiene gemelo oficial como
  pattern), `data-collections-organizer-pattern`.
- La convención de eventos del pack está confirmada como `on-sp-*`/`onsp*` y las tablas API
  completas solo se publican dentro del Component Exchange (auth) — de ahí el valor de la
  extracción del CDN de este doc.

---

## 3. Deltas concretos que merece la pena copiar (priorizados)

Lo ya cubierto no se lista (peer nav, timestamp, KPI, badges, pageWidth, density, drawer sizes,
maximize, bottom drawer, collection chrome, scoreboard, completion step…). Gaps reales, por valor:

1. **`displayOptions` unificado por arquetipo** *(gramática, no feature)* — una sola forma de
   encender/apagar affordances incorporadas, con tri-estado `on|off|disabled`, en lugar del mix
   actual (@Not*, overrides boolean, anotaciones). Propuesta mínima: método overridable
   `displayOptions()` (o anotación `@Display(...)`) por arquetipo, documentado con el MISMO nombre
   de affordance que oj-sp donde exista. El tri-estado "disabled" (visible pero inerte, con
   tooltip de porqué) hoy es inexpresable y es útil para permisos (`@DisabledUnless` ya apunta ahí).
2. **Slot `info` en `GeneralOverview`** (main/info + `promoteInfoSlot`) — quedó fuera de la
   migración a `ContentLayout` a propósito; la API real confirma que la anatomía es main+info.
3. **Wizard (guided-process): `saveDraft`/`saveAndClose`, `availableFromStep`, `resumeStepId`,
   `skip`** — borradores y reanudación son las piezas transaccionales que nuestro Wizard no tiene;
   `stepApplies` ya cubre el branching pero no el skip explícito del usuario.
4. **Create-edit drawer: `spPrimaryActionAndNext`** ("guardar y siguiente" al editar en serie
   sobre un listado — combina con el peerNav del drawer que ya tenemos) y el **error banner**
   embebido (`displayErrorMessageBanner`/`errorMessage`) como respuesta estándar de un save fallido
   en drawer.
5. **Foldout: slot `summary` de la tira colapsada + `orientation: vertical`** — nuestra tira solo
   muestra el título rotado; la API real permite contenido resumen en el panel plegado.
6. **Calendar: vistas week/day/list conmutables + template slots de evento** — documentado como
   no construido; la API confirma qué forma tendría (`selectedViewValue` + `displayOptions.xView`).
7. **Data management: paneles acoplados** — los slots `innerEnd/outerEnd/innerBottom/outerBottom`
   con `reflowModeless|overlayModal` son la versión formal del "pendiente opcional" de la Fase 2;
   los drawers base ya existen, faltaría la variante *layout* (empuja contenido) que el plan ya
   lista como pendiente en 5.1/5.2.
8. **Switcher de contexto/registro como concepto de CABECERA** — generalizar el `record` de
   `GeneralOverview` (p. ej. `RecordSwitcherSupplier`, junto a `PeerNavigationSupplier`) para que
   cualquier página detail/dashboard/colección lo pueda declarar; distinción `context|object`.
9. **Header: `overlineText` y `pageTitlePlaceholder`** — dos strings baratos: el overline del
   welcome/hero, y el placeholder de título en modo create ("Nueva reserva…").
10. **Eventos `before*` cancelables** (spBeforeNext/spBeforeStepNavigate) — hook declarativo de
    validación por paso; hoy se hace dentro del action a mano.
11. **Affordances de sección** (`section`: edit/add/viewMore por `@Section`) — encaja con el
    patrón multi-estado de islas (DocumentoView) pero declarativo.
12. **Welcome: paleta de tonos** (`backgroundColor: 9 tonos oscuros + auto`, `themedImage`,
    ilustración en dos capas fg/bg) — el bridge VB ya rota tonos (`mateuWelcomeTheme`);
    formalizarlo DS-neutral en el arquetipo (`heroTone()`?) para que todos los renderers lo pinten.
13. **Slot `announcement`** (aria-live) — a11y transversal, barato en el `mateu-page` compartido.
14. **Slot `dashboard` del smart-filter-search** (contenido pre-búsqueda) — hoy `SmartSearchPage`
    arranca vacía; un `preSearchContent()` cubriría el patrón "dashboard hasta que busques".

### Qué NO copiar
- Las props tipadas `DataProvider` (modelo client-side de JET; Mateu es server-driven — nuestra
  `ListingData`/paginación ya es el equivalente correcto).
- Las bolsas `translations` por componente (nuestro `Translator` es transversal).
- `feedback` (encuesta embebida), `editLayoutMode`+content library (dashboards editables por el
  usuario final), versionHistory/undo/redo de página — piezas grandes de Fusion Apps; solo bajo
  demanda concreta.
- Los canvases de autoría (§2.17).

---

## 4. El "modelo a seguir": cómo se define una página en Mateu

La traducción del modelo oj-sp al alma de Mateu (declarativo server-driven, sin frontend):

```
Una página Mateu = ARQUETIPO (elige la familia = qué template)
                 + HEADER canónico (anotaciones/suppliers: @Title, @KPI, @BadgeInHeader,
                   @Timestamp, PeerNavigationSupplier, [RecordSwitcherSupplier], acciones)
                 + SLOTS (métodos/campos overridables del arquetipo, con el vocabulario
                   cerrado de §1.3; ContentLayout main/aside/footer como base genérica)
                 + DISPLAY OPTIONS (affordances tri-estado del arquetipo, una sola forma)
                 + ACCIONES (actionIds del vocabulario fijo; before-hooks cancelables)
                 + ESTADO controlado (campos de componentState)
                 + pageWidth / pageType / density (ya en el wire)
```

Equivalencias de mecanismo (por qué esto ES el modelo VB, no una imitación):

| VB / oj-sp | Mateu |
|---|---|
| template = componente con props tipadas | arquetipo = clase base con métodos overridables |
| slot con nombre | método/campo del arquetipo (o slot de `ContentLayout`) |
| template slot con `data` (detailTemplate) | método con el row tipado (`detail(Row, rq)`) |
| prop controlada (currentStep…) | campo de componentState |
| evento sp* | actionId convencional |
| displayOptions | gates/overrides del arquetipo (a unificar, §3.1) |
| pageLayout del shell | `pageWidth` wire |
| dynamic layouts (oj-dynamic) | la inferencia (`@AutoLayout`/`@AutoPage`) |

Pasos accionables que este análisis añade al plan (no estaban o estaban sin fundamentar):

1. **Publicar la tabla de API por arquetipo** en la doc de usuario (como el Component Exchange):
   por cada arquetipo, sus slots (métodos), sus display options, sus actionIds y su estado — la
   misma tabla de 6 filas para los ~15. Convierte "15 arquetipos" en "un sistema con una API".
2. **`displayOptions()` unificado** (§3.1) — la pieza de gramática que falta.
3. Los deltas §3.2–3.14 como backlog ordenado (cada uno = release + SyncTest + doc + paridad,
   el patrón de siempre).
4. **Sincronizar el `contract.json` de Figma** con los nombres de slots/props reales de oj-sp
   donde difieran (los kinds de page templates ya existen; ahora tenemos los nombres canónicos).

---

## 5. Propuesta de API Java (aditiva, idioms de la casa)

### 5.1 Vocabulario compartido (uidl.data)

```java
public enum Toggle { on, off, disabled }          // el tri-estado de affordance
public enum Density { standard, compact }         // @Compact queda como azúcar de density=compact
public enum SwitcherType { context, object }      // dataSwitcherType
public enum PanelMode { reflow, overlay }         // panel acoplado: empuja vs solapa
public enum Dock { end, bottom }
public record DockedPanel(Component content, Dock dock, PanelMode mode, boolean open) {}
public record RecordSwitcher(List<Option> options, String value, SwitcherType type,
                             boolean searchable) {}
```

### 5.2 Header canónico — añadidos

- `@Overline("Bienvenido a")` (clase) → `PageDto.overline`.
- `@TitlePlaceholder("Nueva reserva")` (clase) → `PageDto.titlePlaceholder` (título en modo create).
- `RecordSwitcherSupplier` (uidl.interfaces, hermano de `PeerNavigationSupplier`):
  ```java
  public interface RecordSwitcherSupplier {
    RecordSwitcher switcher(HttpRequest rq);
    Object switchTo(String value, HttpRequest rq);   // devuelve this / URI / State
  }
  ```
  `GeneralOverview` pasa a IMPLEMENTARLA (su switcher `record` actual se convierte en la
  implementación por defecto); cualquier página detail/dashboard puede declararla. Wire:
  `PageDto.switcher` (`RecordSwitcherDto`), render en `mateu-content-header`.
- `UICommand.announce(text)` → región aria-live del `mateu-page` compartido (slot announcement).

### 5.3 `displayOptions()`: un record tipado POR ARQUETIPO + un método overridable

No una bolsa genérica: cada arquetipo define SU record (como oj-sp define su shape), con defaults
en un factory. Los gates existentes (`canX`, `@Not*`) no se rompen — pasan a alimentar los
defaults del record; el record es el punto único de consolidación.

```java
// en Crud
public record CrudDisplay(Toggle newButton, Toggle delete, Toggle export, Toggle columns,
                          Toggle selector, Toggle importButton, Toggle history,
                          Toggle saveAndNext, Density density) {
  public static CrudDisplay defaults() { ... }     // hoy: derivado de canX/@Not*
}
public CrudDisplay display() { return CrudDisplay.defaults(); }

// en Wizard
public record WizardDisplay(Toggle saveDraft, Toggle saveAndClose, Toggle skip,
                            ChecklistDisplay checklist, Density density) {
  public static WizardDisplay defaults() { ... }
}
protected WizardDisplay display() { return WizardDisplay.defaults(); }
```

`Toggle.disabled` = visible e inerte (mapea al `disabled` que `ButtonDto` ya transporta; casa con
`@DisabledUnless`). Sin tipo wire nuevo: el record se consume server-side al componer.

### 5.4 Slots nuevos (métodos overridables, nombres canónicos oj-sp)

```java
// GeneralOverview — anatomía main+info real
protected Component info(Row row, HttpRequest rq) { return null; }   // slot info
// (si != null compone ContentLayout(main=overview, aside=info); display().promoteInfo())

// SmartSearchPage — slot dashboard (contenido pre-búsqueda)
protected Component preSearchContent(HttpRequest rq) { return null; }

// Foldout — fluent FoldoutPanel gana summary (tira colapsada) y el layout orientation
public FoldoutPanel summary(Component c);          // + FoldoutPanelInfoDto.summary (wire)
protected Orientation orientation() { return Orientation.horizontal; }

// DataManagement / páginas transaccionales densas — paneles acoplados
protected DockedPanel endPanel(HttpRequest rq)    { return null; }    // innerEnd/outerEnd
protected DockedPanel bottomPanel(HttpRequest rq) { return null; }    // innerBottom/outerBottom
```

`CollectionDetail.detail/emptyDetail` ya SON `detailTemplate/noSelection`; el último paso del
`Wizard` ya ES `completionStep` — solo se documentan con el nombre canónico.

### 5.5 Wizard transaccional (guided-process parity)

```java
// capability opcional (uidl.interfaces), como Draftable en el idiom de capacidades
public interface Draftable {
  Object saveDraft(HttpRequest rq);                      // botón "Guardar" (display().saveDraft())
  default String resumeStep(HttpRequest rq) { return null; }   // reanudar donde se dejó
}
// en Wizard, junto a stepApplies:
protected boolean stepSkippable(String stepFieldName) { return false; }  // acción skip
protected void beforeStepNavigate(String from, String to, HttpRequest rq)
    throws ValidationException {}                        // hook cancelable (spBeforeStepNavigate)
```

### 5.6 Welcome — tono del hero

```java
public enum HeroTone { ocean, pine, lilac, teal, rose, pebble, slate, plum, sienna, auto }
protected HeroTone heroTone() { return HeroTone.auto; }   // DS-neutral; redwood-oj mapea a RDS
```

### 5.7 Paridad de puertos

Mismos nombres: .NET `Toggle`/`CrudDisplay` records + `virtual Display()`, `IRecordSwitcherSupplier`,
`IDraftable`; Python `Toggle` enum, `display()` con dataclass, mixins `RecordSwitcherSupplier`/
`Draftable`, decoradores `@overline(...)`/`@title_placeholder(...)`.

### 5.8 Impacto wire (mínimo)

Solo 4 campos nuevos: `PageDto.overline`, `PageDto.titlePlaceholder`, `PageDto.switcher`
(`RecordSwitcherDto`), `FoldoutPanelInfoDto.summary` — más los que salgan de DockedPanel si se
materializa (candidato: reutilizar `DrawerDto` con `mode`). Todo lo demás (display options, slots,
hooks) se consume al componer server-side y viaja con los tipos wire existentes.

---

## 6. Apéndice: dónde está la metadata completa

Los `component.json`/`_metadata` completos de los 34 componentes se extraen reproduciblemente de:

```
https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0/<nombre>/loader.js
```

(los composites viejos embeben `text!...component.json`; los VComponents nuevos llevan
`X._metadata={...}` o `registerCustomElement(tag, comp, name, {metadata})`). Nombres extraídos:
welcome-page, general-overview-page, item-overview-page, item-overview, collection-detail-page,
smart-search-page, smart-filter-search, smart-search, smart-filters, hero-search-page,
data-management-page, dashboard-landing-page, dashboard-grid, dashboard-panel, scoreboard,
guided-process, guided-process-drawer-template, step-by-step-page, create-edit-drawer-template,
general-drawer-template, bottom-drawer-template, configuration-drawer-template,
advanced-create-edit, simple-create-edit, header-create-edit, header-general-overview,
header-welcome-banner, task-organizer-page, calendar, foldout-layout, foldout-panel,
collection-container, section, detail-panel, canvas-page, visual-space-page, about-page,
simple-ui-shell, in-app-navigation, dynamic-foldout-page. (data-authoring-page: metadata no
extraíble del bundle minificado.)

Fuentes de la investigación web (§2bis): VPAT Redwood Extensions 23.01
(docs.oracle.com/en/corporate/accessibility/templates/t2-13170.html) y 25.04
(oracle.com/corporate/accessibility/templates/t2-15476.html); deck oficial OCW24 "Develop Visual
Apps using Redwood Page Templates" (static.rainfocus.com); docs VB "Create Pages from Redwood Page
Patterns" / "from Fragments"; blogs.oracle.com/vbcs (smart search, collection details, calendar,
guided process); Siebel Open UI "Configuring a Foldout Layout".
