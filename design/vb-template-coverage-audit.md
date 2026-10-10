# Auditoría de cobertura de los page templates de Redwood/VB

> **Actualización 2026-10-10 (rama `feat/pattern-gaps`).** Los 12 deltas que seguían abiertos
> (§2) se han cerrado o decidido, con paridad Java / .NET / Python y en los cuatro renderers
> abiertos — Vaadin, Redwood, React Native e IntelliJ —, *patterns sí, estilo de Oracle no*: cada
> renderer los pinta con su propio sistema de diseño. El estado actual está en §0; el resto del
> documento se conserva como el histórico que justificó el trabajo.

## 0. Estado actual (2026-10-10)

| # | Delta | Decisión y superficie de autoría | Wire | Estado |
|---|---|---|---|---|
| 1 | `displayOptions` | `Toggle {on, off, disabled}` + **un record por arquetipo** devuelto por `display()`: `WizardDisplay(saveDraft, saveAndClose, skip)`, `CrudDisplay(create, delete, saveAndNext, errorBanner)`, `GeneralOverviewDisplay(info, promoteInfoSlot)`. Se consume en servidor al componer (`disabled` = botón deshabilitado y rechazado en servidor; `off` = no viaja). **No** se inventan records para los arquetipos sin affordances que conmutar: sería superficie sin comportamiento. Los gates existentes (`canX`, `@Not*`) siguen decidiendo si la affordance existe | — | ✅ |
| 2 | Slot `info` de `GeneralOverview` | `info(row, rq)` + `infoWidth()` + `promoteInfoSlot`; compuesto en el `ResponsiveGrid` único (`"main info"`, apila bajo 48rem; promote = info primero en el DOM) | — | ✅ (Redwood: sin promote al apilar) |
| 3 | Wizard transaccional | `Draftable {saveDraft, closeDraft, resumeStep}` → "Save" / "Save and close" + reanudación; `stepSkippable(step)` → "Skip"; `@WizardCompletionAction(availableFromStep)` | — | ✅ |
| 4 | Create-edit drawer | `CrudDisplay.saveAndNext` (+ `nextIdAfter(id, rq)`, `saveAndNextLabel()`): reenvía el drawer con el MISMO id (se refresca in situ) para la fila siguiente; `CrudDisplay.errorBanner`: un save fallido reenvía el drawer con un `Notice` danger + lo tecleado + anuncio asertivo | — (contrato "mismo `Drawer.id` refresca in situ", ahora en los 4 renderers) | ✅ |
| 5 | Foldout `summary` | `FoldoutPanel.summary` + `Foldout.panelSummary(field)` | hijo con slot `summary-N` | ✅ |
| 6 | DataManagement: paneles acoplados | `DockedPanel(id, title, content, size, open)` vía `endPanel(rq)` / `bottomPanel(rq)`; *reflow* (variante `inner`), toggles en la toolbar, estado en la página. La variante `outer`/overlay = devolver un `Drawer` desde una acción (ya existía) | — | ✅ inner / 🟡 outer |
| 7 | Switcher genérico | `RecordSwitcherSupplier {switcher(rq), switchTo(value, rq)}` + `RecordSwitcher(options, value, type: object\|context, label, searchable, disabled)` en CUALQUIER página con cabecera. `GeneralOverview` conserva su switcher de cuerpo (compatibilidad) | `PageDto.switcher` + acción `_switchRecord` (`_record`) | ✅ |
| 8 | Eventos `before*` cancelables | `Wizard.beforeStepNavigate(from, to, rq)`: null = seguir, cualquier otra cosa cancela y es la respuesta (next/back/skip/goToStep/completion) | — | ✅ |
| 9 | Affordances de sección | `@Section(editAction, addAction, viewMoreAction)` → botones Add/Edit en la fila del título, "View more" bajo el contenido | — | ✅ |
| 10 | Paleta de tonos del Welcome | `HeroTone` (ocean, pine, lilac, teal, rose, pebble, slate, plum, sienna, auto) vía `Welcome.heroTone()` / `@WelcomeBanner(tone)`; paleta PROPIA de Mateu en los renderers abiertos, `dark-<tone>` en Redwood | `HeroSectionDto.tone` | ✅ |
| 11 | Slot `announcement` | `UICommand.announce(text)` / `announceAssertive(text)` | comando `Announce {text, assertive}` | ✅ |
| 12 | Contenido pre-búsqueda | `SmartSearchPage.preSearchContent(rq)` / `Listing.preSearch` | `CrudlDto.preSearch` | ✅ |

Tests: `WizardTransactionalSyncTest`, `CrudDisplaySyncTest`, `PageSlotsSyncTest`,
`PageAffordancesSyncTest` (Java); `PatternGapsTests` (.NET); `test_pattern_gaps.py` (Python);
`recordSwitcherModel`/`listingPreSearch`/`heroRenderer`/`mateu-drawer.state` (vitest);
`poc/test-patterns.mjs` (Redwood); `patternGaps.test.ts` (RN); `PageSlotsTest` +
`PageSlotsRenderTest` (IntelliJ). Escaparate en el SUT: `mvc-app1` `/patterns/*` +
`e2e/patterns-shots.mjs`.

Un defecto real salió al conducir el drawer de edición en un navegador (no lo veía ningún test
en JVM): el formulario de un drawer cliente no tenía `mateu-component` propio, así que su Save
llegaba al CRUD con solo los campos TOCADOS — sin id — y cada re-render del dueño re-sembraba el
drawer desde `initialData`, borrando lo tecleado. Arreglado en `mateu-drawer` (sus valores viajan
como `initiatorState`).

**Lo que queda abierto, a propósito:** variantes `outer` de los paneles de DataManagement como
slot (se cubren con `Drawer`), `suggestions`/hotspot del hero search, `timer` del
step-by-step, y los `⚪` de siempre (feedback, version history, content library).

> **Fecha:** 2026-08-12. **Fuente de la superficie real:** `design/vb-page-template-apis.md`
> (34 componentes extraídos de los loaders de `oj-sp` 2604.1.0 del CDN de Oracle, 2026-07-30).
> **Pregunta que responde:** ¿entendemos y soportamos los parámetros y slots de *todos* los page
> templates, y están bien documentados?
>
> **Método y honestidad sobre el alcance:** los 14 deltas de §3 de aquel análisis se han
> **reverificado hoy con grep sobre `backend/shared`**; la columna "Mateu" del resto de props se
> apoya en el análisis del 30-jul, no en una reverificación prop a prop. La columna "Doc" sí se ha
> auditado hoy fichero a fichero.

---

## Resumen ejecutivo

| Dimensión | Estado |
|---|---|
| **Cobertura de templates** (¿existe el arquetipo?) | ✅ **completa** — 19 familias VB en alcance ↔ 21 arquetipos Mateu |
| **Cobertura de parámetros y slots** | ✅ **2026-10-10: los 14 cerrados o decididos** (§0); en agosto seguían abiertos los 14 |
| **Cobertura documental** | ✅ **cerrada 2026-08-12** — las 14 guías tienen ya su *Redwood parameter and slot reference* (era el hueco real: antes ninguna la tenía) |

La conclusión práctica es que el problema **no es de soporte sino de superficie declarada**: los
templates están, las guías están, pero nadie puede saber —sin leer el código— qué parámetros y
slots de cada template soporta Mateu y cuáles no.

---

## 1. Cobertura de templates: completa

| Template VB (§2) | Arquetipo/pieza Mateu | |
|---|---|---|
| `welcome-page` | `Welcome` | ✅ |
| `general-overview-page` | `GeneralOverview` | ✅ |
| `item-overview-page` + patrón key-info | `ItemOverview` | ✅ |
| `collection-detail-page` (+ stacker) | `CollectionDetail` | ✅ |
| `smart-search-page` (+ smart-filter-search) | `SmartSearchPage` | ✅ |
| `dashboard-landing-page` (+ grid/panel/scoreboard) | `Dashboard` | ✅ |
| `guided-process` | `Wizard` + `@WizardProgress(RAIL)` | ✅ |
| Los 4 (5) drawer templates | `Drawer` + `editInDrawer()` | ✅ (2026-10-10: save-and-next + error banner) |
| `data-management-page` | `DataManagement` | ✅ inner / 🟡 outer (2026-10-10: `DockedPanel`) |
| `task-organizer-page` | `TodoList` | ✅ **cubierto entero** |
| `calendar` | `CalendarPage` | 🟡 vistas mes/semana/día/lista ✅ (2026-10-10); sin template slots de evento |
| `foldout-layout` + `foldout-panel` | `Foldout` | ✅ (2026-10-10: `summary`) |
| `advanced-create-edit` + headers transaccionales | `@Toc`/`@Aside` + header canónico | 🟡 |
| `collection-container` | `Crud`/`Listing` | ✅ **espejo casi 1:1** |
| `section` / `detail-panel` | `@Section` / `AutoEditableView` | ✅ (2026-10-10: edit/add/viewMore) |
| `simple-ui-shell` | app shell + `@PageWidth` | ✅ `PageWidthStyle` 1:1 |
| `hero-search-page` | `HeroSearch` | 🟡 sin `suggestions` ni hotspot |
| `step-by-step-page` / `configuration-drawer` | `Wizard` / — | 🟡 finishLater ≈ `Draftable` save-and-close; sin timer |
| `canvas-page`, `visual-space`, `diagram-builder`… | — | ⚪ fuera de alcance a propósito (§2.19) |

**No falta ningún template.** Todo 🟡 de esta tabla es un gap de *parámetros/slots*, que es la
sección siguiente.

---

## 2. Parámetros y slots: los 14 gaps siguen abiertos

> ⚠️ **Trampa metodológica, para quien repita esta auditoría.** Un `grep` sobre `backend/shared`
> produce falsos positivos abundantes: `backend/shared/frontend/redwood/**` contiene **la app VB de
> Oracle empaquetada** (`vb-app-bundle.js` + source maps) y `backend/shared/frontend/vaadin-lit/**`
> los bundles de Vaadin/UI5. Es decir, **la propia API de oj-sp está dentro del repo como
> artefacto**, así que buscar el nombre de una prop de Redwood la encuentra siempre. Hay que
> restringir a fuentes: `backend/shared/{core,uidl,dtos}/src` y `frontend/web/monorepo/libs`.
> Esta primera pasada cayó en la trampa: `availableFromStep` y `announcement` parecían aterrizados
> y no lo estaban.

Estado de los 14 deltas priorizados en §3 del análisis, **reverificado hoy solo sobre fuentes**:

| # | Delta | Marcador buscado | Estado |
|---|---|---|---|
| 1 | `displayOptions` unificado por arquetipo (tri-estado `on\|off\|disabled`) | `displayOptions` | ❌ abierto |
| 2 | Slot `info` en `GeneralOverview` (`promoteInfoSlot`) | `promoteInfoSlot` | ❌ abierto |
| 3 | Wizard: `saveDraft`/`saveAndClose`/`resumeStepId`/`skip`/`availableFromStep` | `saveDraft`, `resumeStepId`, `availableFromStep` | ❌ abierto |
| 4 | Create-edit drawer: `spPrimaryActionAndNext` + error banner | `spPrimaryActionAndNext`, `displayErrorMessageBanner` | ❌ abierto |
| 5 | Foldout: slot `summary` + `orientation: vertical` | `FoldoutOrientation`, `FoldoutNavigation` | 🟡 **parcialmente cerrado**: `orientation()` → `FoldoutOrientation.vertical` **sí existe**, y `FoldoutNavigation` ya cubre `goToParent` (parentLabel/actionId) y prev/next. Solo falta el slot `summary` de la tira colapsada |
| 6 | Calendar: vistas week/day/list + template slots de evento | — | ❌ abierto (doc ya lo declara no construido) |
| 7 | Data management: paneles acoplados (`innerEnd`/`outerEnd`/…) | — | ❌ abierto |
| 8 | Switcher de contexto/registro generalizado | `RecordSwitcher` | ❌ abierto |
| 9 | Header: `overlineText` + `pageTitlePlaceholder` | ambos | ✅ **cerrado 2026-08-12** — `@Overline`/`OverlineSupplier` y `@TitlePlaceholder`/`TitlePlaceholderSupplier` → `PageDto.overline`/`.titlePlaceholder`, pintados por el header compartido; paridad .NET/Python |
| 10 | Eventos `before*` cancelables | `spBeforeNext` | ❌ abierto |
| 11 | Affordances de sección (edit/add/viewMore) | — | ❌ abierto |
| 12 | Welcome: paleta de tonos (`heroTone`) | `heroTone` | ❌ abierto |
| 13 | Slot `announcement` (aria-live) | `announcement` | 🟡 **la fontanería sí, el slot no**: `installAnnouncer()` (`libs/mateu/.../mateu-ui.ts`) instala las live regions en el boot, pero el backend no puede declarar contenido de anuncio |
| 14 | Slot `dashboard` del smart-search (`preSearchContent`) | `preSearchContent` | ❌ abierto |

**Ninguno ha aterrizado como tal desde el 30 de julio**, pero dos están parcialmente cubiertos por
vías distintas a las que el análisis anticipaba — y eso solo se ve mirando prop a prop:

- **#5** — `orientation: vertical` y la navegación del header del foldout **ya existían**
  (`FoldoutOrientation`, `FoldoutNavigation`); el delta se reduce al slot `summary`.
- **#13** — la accesibilidad se resolvió en cliente (`installAnnouncer()` instala las live regions
  en el boot) sin exponer un slot declarable desde el backend.

Es el argumento a favor de la referencia por template de la sección 4: una lista de deltas envejece
mal; una tabla prop a prop en la guía envejece con el código.

**El más barato con diferencia es el #9**: `overlineText` y `pageTitlePlaceholder` son dos strings
del header canónico. **El más estructural es el #1**, porque no es una feature sino una *gramática*:
hoy encender o apagar una affordance se hace con una mezcla de `@Not*`, overrides booleanos y
anotaciones sueltas, y el tri-estado `disabled` (visible pero inerte, con motivo) no es expresable
— que es justo lo que hace falta para permisos.

---

## 3. Documentación: el hueco real

Cada arquetipo tiene su guía en `ux-patterns/`, y `page-templates.md` es un buen **mapa**
(template → pieza → demo → guía). Lo que no existe en ninguna parte es una **referencia de
parámetros y slots**: qué puede configurar el desarrollador en cada template, con qué nombre, y qué
parte de la API de Redwood está deliberadamente fuera.

> ✅ **Cerrado el 2026-08-12.** Las 14 guías llevan ya una sección *Redwood parameter and slot
> reference* con el formato **prop/slot de Redwood · equivalente Mateu · estado**
> (✅ / 🟡 / — / ⚪). Tres decisiones de formato, por si hay que extenderlo a más templates:
> el **header canónico no se repite** (se referencia desde `page-templates.md`, o serían 14 copias
> de la misma tabla de 15 filas); los **extras de Mateu se listan aparte**, porque la tabla mide
> cobertura de Redwood y sin ese apunte Mateu parecería un subconjunto; y se distingue **"no
> está"** de **"está en otro sitio"** (el slot `search` es 🟡 con nota, no —, porque existe a nivel
> de app).
>
> Lo que sigue es el estado **previo**, que documenta por qué se hizo:

Auditado el 2026-08-12 fichero a fichero — "tabla" = cualquier tabla markdown en la guía:

| Guía | Líneas | Tablas | Referencia de params/slots |
|---|---|---|---|
| `wizard.md` | 163 | 8 | 🟡 parcial |
| `advanced-create-and-edit.md` | 93 | 9 | 🟡 parcial |
| `drawer.md` | 211 | 0 | ❌ |
| `dashboard.md` | 93 | 0 | ❌ |
| `foldout.md` | 76 | 0 | ❌ |
| `welcome-page.md` | 67 | 0 | ❌ |
| `calendar.md` | 65 | 0 | ❌ |
| `hero-search.md` | 60 | 0 | ❌ |
| `smart-search.md` | 57 | 0 | ❌ |
| `to-do-list.md` | 53 | 0 | ❌ |
| `data-management.md` | 48 | 0 | ❌ |
| `item-overview.md` | 47 | 0 | ❌ |
| `general-overview.md` | 38 | 0 | ❌ |
| `collection-detail.md` | 35 | 0 | ❌ |

**12 de 14 guías no tienen una sola tabla.** Son recorridos en prosa: enseñan a construir el caso
típico, no a saber qué se puede configurar. Consecuencias concretas:

- Un desarrollador que viene de Redwood **no puede mapear** lo que conoce (`displayOptions`,
  `promoteInfoSlot`, `spSkip`) a lo que Mateu ofrece.
- Un gap y una decisión de diseño **son indistinguibles**: que `heroTone` no exista se lee igual
  que si nunca hubiera existido en Redwood.
- Es el mismo patrón que la sección 3 del backlog general: **la superficie declarada es la API**, y
  aquí no está declarada.

---

## 4. Propuesta

En orden de coste creciente:

1. ~~**Referencia de parámetros y slots por template**~~ — ✅ **hecho el 2026-08-12**, las 14 guías.
2. ~~**Cerrar el #9**~~ — ✅ **hecho el 2026-08-12**. `@Overline` / `OverlineSupplier` y
   `@TitlePlaceholder` / `TitlePlaceholderSupplier` (supplier primero, anotación como fallback: la
   regla de autoría de la casa), viajando en `PageDto.overline` / `.titlePlaceholder` y pintados por
   `mateu-content-header`. El placeholder es **placeholder, no default**: el wire lo emite tal como
   se declara y es el renderer quien lo suprime en cuanto hay título, para que el wire siga siendo
   descriptivo. Paridad .NET/Python. Tests: `PageOverlineSyncTest` (6), `test_page_overline.py` (4),
   `PageOverlineTests.cs` (4, **sin verificar** — no hay SDK de .NET en esta máquina).
3. **Decidir el #1** *(la gramática `displayOptions`)*, que es la pieza de la que cuelgan varios de
   los demás y la que más se nota al venir de Redwood. Es una decisión de API antes que una
   implementación.
4. **El resto por demanda**, con el estado ya visible en la referencia del punto 1 — que es
   precisamente lo que permite priorizar por demanda en vez de por intuición.

**Relación con el backlog general** (`framework-design-backlog.md`): el punto 1 de aquí es una
instancia de la **idea B** (escribir la regla que solo está en la cabeza del mantenedor), y la
tabla de estado por template es una instancia de la **idea A** (que la ausencia sea visible y
revisada, no silenciosa).
