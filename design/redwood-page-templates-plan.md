# Plan: modelo de Page Templates estilo Redwood en Mateu

> Documento de visión y hoja de ruta. Fuente de referencia: la documentación oficial del
> **Oracle Redwood Design System** (`redwood.oracle.com`), sección *Page Templates & Components*
> (capturas en `~/Descargas/redwood/`, 22 páginas). Estado a 2026-07-20.

---

## 1. Tesis

Mateu ya puede construir casi cualquier UI de negocio. Lo que le falta no es **más
componentes**, sino una **capa de autoría de nivel superior**: algo que guíe de forma clara y
opinada *cómo se elige y se compone* una pantalla completa.

Redwood es la mejor referencia pública que existe para esa capa. Su aportación valiosa **no son
los píxeles ni las ilustraciones de Oracle** — es el **modelo de decisión**:

```
objetivo de usuario ──▶ categoría ──▶ densidad de datos ──▶ plantilla ──▶ anatomía fija
```

La propuesta es adoptar ese modelo como **modelo de referencia de Mateu**: expresarlo una sola
vez, de forma agnóstica al design system, y dejar que cada renderer (Vaadin, SAP UI5, PatternFly,
Redwood, SLDS, React Native, IntelliJ) lo pinte con sus propios tokens.

Mateu ya empezó por aquí de forma deliberada — los enums `PageType` y `PageWidthStyle` citan
Redwood explícitamente en su Javadoc, y `doc/.../ux-patterns/page-templates.md` ya mapea
plantillas→arquetipos. Lo que ha faltado es hacer el modelo **explícito, completo y unificado** en
vez de ir arquetipo a arquetipo.

---

## 2. Principios (las líneas rojas)

1. **Taxonomía y anatomía, no marca.** Copiamos la estructura de decisión y la anatomía de cada
   plantilla (conocimiento de UX genérico). **No** clonamos el look de Oracle en los demás
   renderers: eso rompería la neutralidad multi-DS de Mateu y entraría en terreno de marca ajena.
   El renderer `redwood-oj` puede ir tan lejos como quiera con el skin RDS; el resto sólo heredan
   la *estructura*.

2. **Las plantillas guían, no encarcelan.** El alma de Mateu es "declaras datos, se infiere la UI"
   (`@AutoLayout`). La capa de plantillas va **por encima** de la inferencia, como raíles
   opcionales. Un desarrollador debe poder ignorarla por completo y seguir teniendo una UI válida.

3. **Todo se compone de piezas que ya existen.** Un arquetipo es composición de componentes wire
   ya soportados → renderiza en todos los renderers sin trabajo de front por cada uno. Ninguna
   plantilla nueva debería requerir un tipo wire nuevo salvo que sea inevitable (p. ej. un layout
   de drawer inferior).

4. **Paridad de puertos como ciudadano de primera.** Cada plantilla nueva se replica en los
   backends .NET y Python (misma forma wire) — es parte de "terminado", no un extra.

---

## 3. El modelo unificado: la gramática de anatomía

Todas las plantillas de Redwood se documentan con **las mismas dimensiones**. Formalizar esta
gramática como un contrato común es el corazón de "el modelo unificado". Cada plantilla de Mateu
debería declarar:

| Dimensión Redwood | Concepto en Mateu (actual o a crear) |
|---|---|
| **Category** (Overview / Detail / Transactional) | `PageType` (LANDING/COLLECTION/DETAIL/FORM/PROCESS/DASHBOARD) |
| **Page layout / data density** | `@PageWidth` / `PageWidthStyle` {FIXED, FULL_WIDTH, EDGE_TO_EDGE} ✅ |
| **Context** (standalone / drawer popup / drawer layout) | página ruteada vs `Drawer` overlay ✅ / *drawer layout* (a crear) |
| **Header (private)**: title, subtitle, avatar, badges, contextual info, next/prev, parent nav, timestamp | `@Title`/`EntityHeader`/`@BadgeInHeader`/`@Banner`/toolbar+buttons — **disperso; falta un "page header" canónico** |
| **Slots**: main / detail / overview / panels / footer | secciones, `@Zones`, tabs, `@Panel`, `Drawer` — **falta el concepto formal de "slot"** |
| **Required / Configurations / Locked** | hoy implícito en cada arquetipo — **debería declararse** |
| **Compatible drawers** (General / Create&Edit / Bottom) | `Drawer` + `editInDrawer` ✅ / General & Bottom **a crear** |

**Entregable de esta capa:** un "page header" canónico reutilizable por todos los arquetipos
(title, subtitle, avatar, badges, contextual info 1–4, next/prev objeto, parent nav, timestamp,
acciones primary/secondary/save/cancel), y un vocabulario de *slots* uniforme. Hoy cada arquetipo
reinventa su cabecera; unificarla es lo que convierte "15 arquetipos sueltos" en "un sistema de
plantillas".

### 3.1 Boceto del page header canónico (decisión resuelta 2026-07-20)

**Decisión: convención sobre lo existente + añadidos puntuales. NO un componente wire nuevo.**

Verificado en código: `PageDto` (dtos) **ya** transporta casi toda la anatomía de cabecera de
Redwood, y `mateu-content-header.ts` ya la renderiza en todos los renderers:

| Elemento Redwood (header) | Campo `PageDto` | Estado |
|---|---|---|
| Title | `title` / `pageTitle` | ✅ |
| Subtitle | `subtitle` | ✅ |
| Avatar / icon | `avatar`, `icon` | ✅ |
| Badges | `badges` (`@BadgeInHeader`) | ✅ |
| Status | `status` | ✅ |
| Parent navigation | `breadcrumbs` (aproxima) | 🟡 |
| Primary / secondary / cancel actions | `actions`, `toolbar`, `buttons` | ✅ (sin rol semántico) |
| Banners | `banners` | ✅ |
| Header / footer slot arbitrario | `header`, `footer` | ✅ |
| FABs, TOC, pageWidth, pageType | `fabs`, `toc`, `pageWidth`, `pageType` | ✅ |

Lo que **falta** para completar la gramática de cabecera Redwood (los añadidos puntuales de la
Fase 0):

1. ~~**Contextual info (1–4 pares clave/valor "de un vistazo").**~~ **YA EXISTÍA (verificado
   2026-07-20)** — `@KPI` a nivel de CAMPO ya produce pares etiqueta/valor en la cabecera
   (`PageMetadataExtractor.getKpis`: label del campo = título, valor = texto; excluido del cuerpo
   por `FormFieldFilter`; render en `mateu-content-header`). Añadir un `@HeaderFact` sería un
   sinónimo redundante → **no se implementa**. Delta Redwood pendiente (menor): tope de 4 + revelado
   al hacerse *sticky* (concerns de frontend), no crítico.
2. ~~**Navegación next/prev objeto** (lateral entre pares).~~ **HECHO (2026-07-20)** — vertical
   piloto completo: `PeerNavigationSupplier.peers(rq)` → `PeerNav` (uidl) → `PageView.peerNav` →
   `PageDto.peerNav` (`PeerNavDto`) → flechas en `mateu-content-header` (hook `renderPeerNav` para
   DS propios). Paridad .NET (`IPeerNavigationSupplier`/`PeerNav`→`PageMetadataDto.PeerNav`) y
   Python (`PeerNavigationSupplier`/`PeerNav`→`PageMetadata.peer_nav`). Tests: `PeerNavigationSyncTest`
   (Java 3/3), `PeerNavTests` (.NET 4/4), `test_peer_nav.py` (Python 3/3). Demo: `/peer-nav-demo`
   (`EmployeeRecord1..3`). Lo consumirán General/Item Overview, General Drawer y Advanced Create&Edit.
3. ~~**Timestamp** (última actualización; requerido junto a Save en transaccionales).~~
   **HECHO (2026-07-20)** — `@Timestamp` en un campo (prefijo opcional) → `PageView.timestamp` →
   `PageDto.timestamp` → texto tenue en `mateu-content-header`; excluido del cuerpo por
   `FormFieldFilter`. Paridad .NET (`[Timestamp]`) y Python (`Timestamp()`). Tests:
   `PageHeaderExtrasSyncTest` (Java 4/4), `PeerNavTests` (.NET +2), `test_peer_nav.py` (Python +2).
4. **Roles semánticos de botón** (primary / save / cancel / secondary). **DIFERIDO (decisión
   2026-07-20).** El header YA coloca cancel/back a la izquierda y acciones a la derecha
   (`isNavButton(actionId)` en `mateu-content-header`) y enfatiza el primary vía `buttonStyle`. Un
   `role` explícito exigiría añadir un campo al record fluent `Button` (rompe 5 constructores de
   conveniencia + ~23 sitios `new Button(...)`) + todo el pipeline de botones + los 3 puertos, para
   un valor marginal. Se retoma solo si aparece una necesidad concreta (versión reducida posible:
   `role` solo en `ButtonDto` + anotaciones, sin tocar el record fluent).

**Estado de la Fase 0 (page header canónico): CERRADA.** contextual info (ya existía vía `@KPI`),
next/prev objeto y timestamp entregados con paridad tri-backend + tests; roles de botón diferidos.
La guía de decisión está escrita (`doc/.../ux-patterns/choosing-a-page-template.md`). Siguiente:
Fase 1 (drawers base — General Drawer + Bottom Drawer).

**Coste:** bajo. Sin tipo wire nuevo → sin trabajo por renderer salvo el render de next/prev y
timestamp en el `mateu-content-header` compartido. Paridad .NET/Python = añadir los mismos campos
a sus `PageDto`. Esto preserva la neutralidad multi-DS (todos ya renderizan la cabecera) y
mantiene el alma de Mateu (los arquetipos siguen siendo composición).

---

## 4. Estado actual (verificado en código)

Arquetipos presentes en `core/.../orchestrators/`: `calendar`, `collectiondetail`, `crud`,
`dashboard`, `editableview`, `foldout`, `generaloverview`, `herosearch`, `importwizard`,
`itemoverview`, `masterdetail`, `smartsearch`, `todolist`, `welcome`, `wizard`.

### Cobertura Redwood → Mateu

| Redwood (categoría) | Mateu | Estado |
|---|---|---|
| Dashboard Landing *(Overview)* | `Dashboard` + `Scoreboard`/`MetricCard` | ✅ |
| Welcome *(Overview)* | `Welcome` + `@WelcomeBanner` | ✅ |
| Foldout H/V *(Detail)* | `Foldout` | ✅ |
| General Overview *(Detail)* | `GeneralOverview<Row>` | ✅ |
| Item Overview *(Detail)* | `ItemOverview` | ✅ |
| General Drawer *(Detail)* | `Drawer` genérico | 🟡 falta arquetipo *detail drawer* |
| Bottom Drawer *(Detail)* | — | ❌ |
| Advanced Create & Edit *(Transactional)* | forms + `@Toc` + `@Zones`/tabs | 🟡 falta forma canónica (anchor nav + detail slot + header transaccional) |
| Data Management *(Transactional)* | `@InlineEditing`+`@Compact` (aproxima) | 🟡 falta grid denso + gantt conmutables |
| Gantt page *(Transactional)* | componente `Gantt` + `PlanningBoard` | 🟡 falta la *plantilla de página* (gantt + bottom drawer + side panel) |
| Guided Process *(Transactional)* | `Wizard` + `@WizardProgress(RAIL/STEPS)` | ✅ |
| Guided Process Drawer *(Transactional)* | `editInDrawer`+wizard (aproxima) | 🟡 falta wizard multipaso dentro de drawer |
| Collection Detail *(Transactional)* | `CollectionDetail<Row>` | ✅ |
| Create & Edit Drawer *(Transactional)* | Crud `editInDrawer()` + `Drawer` | ✅ |
| — layouts edge/full/fixed | `@PageWidth` | ✅ |

**Extras de Mateu sin equivalente 1:1 en Redwood** (mantener): `SmartSearchPage`, `TodoList`,
`CalendarPage`, `HeroSearch` — encajan en las categorías Redwood (COLLECTION/LANDING) y ya declaran
su `pageType`.

Resultado: **~70% cubierto**. Las brechas son 6, todas en Detail/Transactional, y todas
relacionadas con **drawers** y **canvases densos** — precisamente lo que Mateu aún no formaliza.

---

## 5. Las 6 brechas (anatomía Redwood → forma propuesta en Mateu)

### 5.1 General Drawer *(Detail — read-only)* — **EN CURSO (Fase 1, 2026-07-20)**
- **Redwood:** drawer lateral (start/end) para info read-only de un objeto **sin perder contexto
  de página**. Regiones: (1) header (title, subtitle, next/prev objeto, maximize, close) + (2)
  default slot (form/tabla/cards read-only). Tamaños XL(90%)/L(968)/M(648)/S(464); acción
  *Maximize* sube un tamaño. Drawer *popup* (overlay, z alto, modal opcional) o *layout* (empuja
  contenido, no modal). **No** para transacciones.
- **Decisión:** NO un arquetipo nuevo — se **enriquece el `Drawer` existente** (ya tiene
  posiciones/width/close/closeModal/modeless). Más simple y aditivo.
- **HECHO — COMPLETO en las 4 capas (2026-07-20):** `Drawer`/`DrawerDto` ganan `subtitle`, `size`
  (`DrawerSize {s,m,l,xl}` → 464/648/968/90vw, con `width` como override), `maximizable` y
  `peerNav` (reutiliza el `PeerNav` de la Fase 0). Frontend `mateu-drawer`: subtítulo bajo el
  título, width derivado del size, botón *Maximize* (estado local `maximizeSteps` — sube un peldaño
  sin round-trip, tope xl), flechas prev/next en la cabecera. Paridad .NET (`DrawerSize`,
  `Drawer { Subtitle, Size, Maximizable, PeerNav }`) y Python (`DrawerSize`, `Drawer(subtitle,
  size, maximizable, peer_nav)`). Tests: `DrawerSyncTest` (Java 6/6), `SyncHandlerTests` (.NET
  +1), `test_sync_handler.py` (Python +1). Demo: `/general-drawer-demo`. Doc: ux-patterns/drawer.md.
- **PENDIENTE (opcional):** variante *layout* que empuja el contenido en vez de solapar (no
  crítica para el uso read-only).

### 5.2 Bottom Drawer *(Detail)* — **HECHO (Fase 1, 2026-07-20)**
- **Redwood:** drawer anclado abajo, *closable* o *expand/collapse* fijo. Header (title o tabs) +
  main slot. Tamaños Default/Maximized; posición `bottom`; con tab bar y comportamiento
  expandir/colapsar.
- **HECHO — COMPLETO en las 4 capas:** nueva posición `DrawerPosition.bottom` (uidl/dtos/.NET/
  Python) + flag `collapsible`. Frontend `mateu-drawer`: la posición `bottom` ancla el panel abajo
  a ancho completo y desliza hacia arriba (altura 50vh por defecto, `--mateu-drawer-height`, tope
  90vh); `collapsible` añade un handle ▾/▴ en la cabecera que colapsa el drawer a su tira y lo
  re-expande — **estado local, sin round-trip** (como el maximize). Paridad .NET
  (`DrawerPosition.Bottom` + `Drawer.Collapsible`) y Python (`DrawerPosition.bottom` +
  `Drawer(collapsible=…)`). Tests: `DrawerSyncTest` (Java 7/7), `SyncHandlerTests` (.NET),
  `test_sync_handler.py` (Python). Demo: `/bottom-drawer-demo`. Doc: ux-patterns/drawer.md.
- **PENDIENTE (opcional):** variante *layout* que reflow/empuja el contenido; tab-bar en la
  cabecera del bottom drawer.

**Estado de la Fase 1: los dos drawers base ENTREGADOS.** Desbloquean la Fase 2 (Gantt page +
Data Management, que los usan como paneles inferior/lateral).

### 5.3 Guided Process Drawer *(Transactional)* — **EN CURSO (Fase 3, 2026-07-20)**
- **Redwood:** wizard **dentro de un drawer** para subflujos o *batch actions*; **máx 5 pasos**
  (si más → Guided Process página). Regiones: (1) header con título de proceso + paginación
  "2 | 4" (clic abre menú de pasos), (2) footer con primary sólo en el último paso / Continue
  antes, (3) default slot con validación secuencial.
- **HECHO (mecanismo Java + test + demo + doc):** nuevo componente **`EmbeddedView(view)`** (uidl.data)
  que embebe una vista ruteada (un `Wizard`) como **`ServerSideComponent` INDEPENDIENTE** — enruta
  sus propias acciones (navegación de pasos) a sí mismo en vez de burbujear al host (a diferencia de
  `ModelViewComponent`, que la renderiza inline). Rama nueva en `ComponentToFragmentDtoMapper`
  (aditiva, no toca `ModelViewComponent` → v4/cardex intactos): envuelve la página del view en un
  `ServerSideComponentDto` con su `serverSideType` + acciones. Guided Process Drawer =
  `Drawer.content(new EmbeddedView(wizard))`. El wizard avanza paso a paso dentro del drawer (test
  `GuidedProcessDrawerSyncTest`: embebido como ServerSideComponent + "next" avanza). Demo
  `/guided-process-drawer-demo`; doc ux-patterns/drawer.md.
- **HECHO — paridad .NET/Python de `EmbeddedView` (2026-07-31):** .NET `EmbeddedView(object View)`
  (Mateu.Uidl) + `ReflectionMapper.MapEmbeddedView` (Wizard → `MapWizard(...,1)`, otra vista →
  `MapView`) enganchado en `ComponentMapper.MapContent` (compartido por Drawer Y Dialog); Python
  `fluent.EmbeddedView(view)` + `mapper.map_embedded_view` (rama en `map_component`). Ambos producen
  el mismo `ServerSideComponent` independiente con el serverSideType de la vista + sus acciones (wire
  idéntico a Java). Tests espejo de `GuidedProcessDrawerSyncTest`: .NET `GuidedProcessDrawerTests`
  (suite 227), Python `test_guided_process_drawer.py` (suite 226). Sin tipo wire nuevo en ningún puerto.
- **HECHO — pulido del Guided Process Drawer (2026-07-31):**
  (a) **Pager "2|3" en la cabecera del drawer** — `mateu-progress-steps` emite un evento burbujeante
  `mateu-guided-progress {current,total}` en cada render; `mateu-drawer` lo escucha y pinta
  `current | total` en el header (vivo, porque el wizard embebido re-renderiza independiente del
  drawer). Sin wire nuevo; aparece cuando el wizard usa `@WizardProgress(STEPS|RAIL)`.
  (b) **Guía de ≤5 pasos** — la rama `EmbeddedView` del `ComponentToFragmentDtoMapper` hace `log.warn`
  una vez por clase de wizard con >5 pasos no-resultado (no falla; sugiere el Guided Process de
  página).
  (c) **Patrón batch (N ítems → un paso por ítem)** — demo `/batch-approval-demo` +
  `BatchApprovalWizard` (una clase `ReviewStep` reutilizada en varios campos = un paso por ítem) +
  doc ux-patterns/drawer.md. Limitación documentada: el nº de pasos es de autoría (los pasos son
  campos), no dinámico.
- **PENDIENTE:** paginación "2|4" clicable que abra un menú de pasos (hoy solo muestra el contador);
  límite de 5 pasos como validación dura (hoy es un warn); batch de tamaño dinámico (runtime);
  **validación visual** (puerta de Miguel — el renderer vaadin ya está reconstruido con el pager).

### 5.4 Advanced Create & Edit *(Transactional)* — **HECHA (composición, Capa 4, 2026-07-26)**
- **Redwood:** transaccional de página única para objetos complejos. 4 regiones: page header
  (title, cancel, primary, save, timestamp, contextual info 1–4, next objeto), main slot,
  **vertical anchor navigator** (índice lateral ligado a los títulos de sección), **detail slot**
  contextual. Regla clave: anchor navigator y detail slot son **mutuamente excluyentes**.
- **HECHO — pura composición, todas las piezas ya existen tras Capas 0–2:** anchor navigator = `@Toc`;
  main = `@Section`/`@Zones`/tabs; **detail slot = `@Aside`** (→ `ContentLayout` aside, Capa 2); header
  transaccional = `@Timestamp` (last updated) + `@KPI` (contextual info) + `PeerNavigationSupplier`
  (next objeto) + cancel/save (el header ya coloca cancel a la izquierda y acciones a la derecha);
  save/validación/optimistic-lock del crud o anotaciones de bean-validation + `@Version`. La regla
  "anchor nav XOR detail slot" = elegir `@Toc` **o** `@Aside`. Formalizada en doc
  `ux-patterns/advanced-create-and-edit.md` (variante A `@Toc`, variante B `@Aside`). No hizo falta
  un `PageType.FORM "advanced"` nuevo (el `pageType=form` ya lo cubre).

### 5.5 Data Management *(Transactional)* — **HECHO (Fase 2, 2026-07-20)**
- **Redwood:** grid de datos denso + Gantt integrados y **conmutables** en la misma página, con
  drawers para detalle. Edge-to-edge o full-width. Toolbar + search + tabs.
- **HECHO — arquetipo `DataManagement` en las 3 backends:** `ComponentTreeSupplier` +
  `PageWidthSupplier` (FULL_WIDTH); el desarrollador aporta `gridView(rq)`/`ganttView(rq)`; un
  switcher en toolbar (dos botones) alterna la vista activa (`_view`, re-render en sitio); heading
  del `@Title`. Java `orchestrators/datamanagement/` + `PageTypeResolver`→COLLECTION; paridad .NET
  (`DataManagement`/`IDataManagement`, rama SyncHandler switchToGrid/switchToGantt) y Python
  (`DataManagement`, atributo `view` sin underscore para que persista en estado). Tests:
  `DataManagementSyncTest` (Java 2/2), `ArchetypeTests` (.NET), `test_data_management.py` (Python).
  Demo `/data-management-demo`; doc ux-patterns/data-management.md.
- **PENDIENTE (opcional):** grid denso "real" (Grid fluent con columnas) en el demo, y drawer de
  detalle en la vista grid (la vista gantt ya abre el drawer de tarea vía `GanttPage`).

### 5.6 Gantt page *(Transactional)* — **HECHO (Fase 2, 2026-07-20)**
- **Redwood:** canvas Gantt + **bottom drawer** (tablas) + **side panel** (detalle) usados
  simultáneamente. Sólo edge-to-edge. Header create&edit o general-overview.
- **HECHO — arquetipo `GanttPage` en las 3 backends + interacción + heading:** `ComponentTreeSupplier`
  + `PageWidthSupplier` (EDGE_TO_EDGE) que compone el canvas `Gantt` (de `tasks(rq)`) + panel de
  detalle opcional acoplado debajo (`detail(rq)`) + encabezado del `@Title`. **Interacción**: clic
  en una barra → `Gantt.onTaskSelectionActionId` despacha `selectGanttTask` con `_clickedTaskId` →
  el arquetipo abre la tarea en un side `Drawer` (`taskDrawer`/`taskDetail` overridables). Paridad
  .NET (`GanttPage`/`IGanttPage`) y Python (`GanttPage`). `PageTypeResolver`→DETAIL. Tests:
  `GanttPageSyncTest` (Java 5/5), `ArchetypeTests` (.NET), `test_gantt_page.py` (Python). Demo
  `/gantt-page-demo` (verificado visualmente); doc ux-patterns/gantt.md.
- **PENDIENTE (opcional):** bottom drawer de tablas simultáneo al side drawer (Redwood los usa a la
  vez); actualmente la interacción abre un único side drawer por tarea.

**Estado de la Fase 2: Gantt page + Data Management ENTREGADOS en las 3 backends.**

**Orden de dependencias:** `General Drawer (5.1)` y `Bottom Drawer (5.2)` son la base →
desbloquean `Gantt page (5.6)` y `Data Management (5.5)`. `Guided Process Drawer (5.3)` y
`Advanced Create&Edit (5.4)` son independientes.

---

## 6. La guía de decisión (el "Choosing the right…")

Además del código, el modelo unificado necesita su **guía de decisión** — el equivalente al
`GUIDEG10` de Redwood, en la doc de Mateu:

1. **Página de decisión** en `doc/.../ux-patterns/`: objetivo de usuario → categoría → densidad →
   plantilla, con la tabla de "¿leo o edito?" y "¿una entidad o varias?". Reaprovecha y amplía
   `page-templates.md`.
2. **Ampliar el catálogo** (`page-templates.md`) con las 6 nuevas cuando existan, y con la
   *gramática de anatomía* (header/slots/drawers) por plantilla.
3. **(Opcional) scaffold guiado**: un asistente (`/mateu-scaffold` o similar) que pregunte
   categoría + densidad y genere el esqueleto del arquetipo correcto.
4. **Cerrar el círculo con Figma**: el `contract.json` ya modela page templates (`Mateu/Page
   Templates/*`); sincronizar los nuevos kinds cuando se añadan las plantillas.

---

## 7. Hoja de ruta por fases

Cada fase = uno o varios releases `v3.0-alpha.N`, con demo + SyncTest + doc + paridad .NET/Python
(el patrón de "una release por patrón" que ya sigue el repo).

- **Fase 0 — Fundamentos (modelo unificado).** Page header canónico + vocabulario de slots +
  formalizar la gramática de anatomía. Escribir la **guía de decisión**. Sin plantillas nuevas
  todavía. *Consolida lo existente bajo la taxonomía.*
- **Fase 1 — Drawers base.** `General Drawer` (5.1) + `Bottom Drawer` (5.2). Desbloquean el resto.
- **Fase 2 — Canvases densos.** `Gantt page` (5.6) + `Data Management` (5.5).
- **Fase 3 — Transaccionales avanzados.** `Advanced Create&Edit` canónico (5.4) + `Guided Process
  Drawer` (5.3).
- **Fase 4 — Cierre.** Catálogo completo en doc + Figma sincronizado + scaffold guiado.

---

## 8. Decisiones abiertas

- ~~¿Page header canónico como componente wire nuevo, o como convención sobre los existentes?~~
  **RESUELTO (2026-07-20):** convención sobre `PageDto`/`mateu-content-header` + 4 añadidos
  puntuales (contextual info, next/prev objeto, timestamp, roles semánticos de botón). Ver §3.1.
- **Bottom Drawer**: ¿posición `bottom` sobre el `Drawer` actual, o layout nuevo? Es la única
  brecha que casi seguro toca wire/front, no sólo backend.
- **Data Management "grid ⇄ gantt"**: ¿arquetipo dedicado o composición documentada?
- **Nomenclatura**: ¿mantenemos los nombres Redwood (Advanced Create & Edit, General Drawer) o los
  traducimos al vocabulario Mateu? Recomendación: nombre Redwood en la doc/guía (reconocible),
  nombre Mateu-idiomático en la API.

---

## 9. Elevar el peso de las plantillas — dirección estratégica (decisión 2026-07-26)

**Contexto.** El dueño del producto está cada vez más convencido de que la definición de UI a
**alto nivel vía page templates** debe tener MÁS peso, copiando el approach de Redwood
(referencia: `redwood.oracle.com` GUIDEG10 *content page* — *Shell → Content Page = Page Header +
Content Sections*). Endosó las **cuatro** palancas a la vez (son capas, no exclusivas). Se secuencian
por dependencia:

### Orden de trabajo (cada fase = release + demo + SyncTest + doc + paridad .NET/Python)

1. **Gramática content-page (slots)** — *la base estructural.* Hoy `PageDto` ya tiene una cabecera
   canónica (Fase 0), pero el CONTENIDO es "una lista de componentes" que cada arquetipo compone a
   mano. Falta el concepto formal de **slot** (§3). Redwood define el content-page como *header +
   content sections con rol*. Entregable: un vocabulario CERRADO de slots — `MAIN`, `ASIDE`
   (detail/overview contextual), `PANELS` (foldout/tabs), `FOOTER` (header y toolbar ya existen) —
   y un componente ligero **`ContentLayout(main, aside, footer, panels)`** (uidl.data, hermano de
   `DashboardLayout`/`FoldoutLayout`) que los renderers pintan con UNA gramática responsive
   uniforme (main+aside 64/36, aside sticky, footer full-width). Cada arquetipo pasa a **rellenar
   slots** en vez de componer layouts bespoke.
   - *Nota sobre el principio #3 (nada de wire nuevo salvo inevitable):* aquí UN tipo wire nuevo
     SUSTITUYE N composiciones ad-hoc → reduce superficie, no la aumenta. Alternativa cero-wire
     considerada (convención `@Slot(name)` sobre `@Zones`): más pobre para arquetipos
     programáticos. **Recomendación: `ContentLayout`.** (queda como decisión abierta a confirmar).
   - *Roll-out sin big-bang:* pilotar en UN arquetipo con forma main+aside clara (General/Item
     Overview) antes de migrar los ~15. Los arquetipos no migrados siguen funcionando (aditivo).

2. **Inferencia por defecto** — *el "más peso" que respeta el alma de Mateu.* Extender `@AutoPage`
   para que MÁS formas se auto-compongan en la plantilla + content-page correcta POR DEFECTO (hoy
   sólo Dashboard/Welcome, y opt-in). El dev sigue declarando datos; la plantilla es el output por
   defecto y overridable. Reconciliación de la tensión con el principio #2: la plantilla no se
   impone declarándola a mano, se **infiere**. Depende de (1) para tener a dónde componer.

3. **Template-first + scaffold** — *la capa de DX.* Asistente `/mateu-scaffold` (categoría +
   densidad → esqueleto del arquetipo correcto rellenando slots) + docs que empujan "elige plantilla
   → rellena slots". Cierra el círculo con el `contract.json` de Figma (`Mateu/Page Templates/*`).

4. **Cerrar catálogo (Fase 3/4)** — Advanced Create&Edit canónico (5.4, ahora encaja natural como
   `ContentLayout` main+aside con anchor-nav = `@Toc`), Guided Process Drawer pulido (5.3), catálogo
   doc completo + Figma sincronizado.

### Estado (2026-07-26)
- **Capa 1 (gramática content-page) — HECHA.** Tipo wire `ContentLayout` (main/aside/footer con
  slots) en los 3 backends + renderer compartido DS-neutral + case redwood-oj; arquetipos con forma
  main+aside migrados (`ItemOverview`, `CollectionDetail`), `GeneralOverview` excluido a propósito.
  Validada en Vaadin. (rama feature/content-layout.)
- **Capa 2 (inferencia por defecto) — HECHA.** (a) `@Aside` (`[Aside]`/`Aside()`): un campo
  componente marcado `@Aside` en un formulario plano se saca del cuerpo y compone un `ContentLayout`
  (form=main, campo=aside) — la vía mínima a la content-page sin componer nada, en los 3 backends.
  (b) La inferencia de página (`@AutoPage`) pasa a **ON por defecto** (el template es el output por
  defecto; opt-out con `@AutoPage(false)` o la propiedad/switch global de desactivación) en los 3
  backends. Suites verdes: core 744, .NET 215, Python 212.
- **Capa 3 (template-first + scaffold) — HECHA.** El scaffold conversacional ya existía
  (`.claude/skills/mateu-screen`: 3 preguntas de negocio → familia → arquetipo → genera la clase);
  actualizado con lo de capas 1–2 — `@Aside` (form con panel lateral → content-page) como refinement
  + seed, y la nota "inferencia por defecto: a veces no eliges arquetipo, declaras datos y compone
  solo". Guía de decisión (`choosing-a-page-template.md`) ampliada con la sección "Often you don't
  pick at all" (default-on + `@Aside`). PENDIENTE menor: sincronizar el `contract.json` de Figma con
  los kinds nuevos (nice-to-have, "cierra el círculo").
- **Capa 4 (cierre de catálogo) — HECHA (documental).** **Advanced Create & Edit** formalizada como
  composición de piezas que ya existen — header canónico (`@Timestamp`/`@KPI`/peer-nav + save/cancel)
  + main seccionado + `@Toc` (anchor nav) *o* `@Aside` (detail slot), mutuamente excluyentes; doc
  nueva `ux-patterns/advanced-create-and-edit.md` (2 variantes). Catálogo saneado: la guía de
  decisión (`choosing-a-page-template.md`) ya no marca "planned" lo que estaba hecho (General/Bottom
  Drawer, Data Management, Gantt page) y el Roadmap se reescribe como "Status" (catálogo cubierto;
  queda pulido, no cobertura). PENDIENTE (pulido, no cobertura): variantes profundas (bottom+side
  drawer simultáneos en Gantt page; batch en Guided Process Drawer) + sync Figma de los kinds nuevos.

### Línea roja que se mantiene
El alma de Mateu (*declaras datos → se infiere la UI*) NO se rompe: las plantillas ganan peso siendo
el **output por defecto de la inferencia** y el vocabulario común de composición, no una jaula
declarativa obligatoria. Todo arquetipo sigue siendo composición de piezas wire → renderiza en todos
los renderers. Paridad .NET/Python en cada fase.

### Decisión abierta crítica (bloquea la Fase 1 de esta sección)
`ContentLayout` como tipo wire nuevo **vs.** convención `@Slot` sobre `@Zones`. Recomendación:
`ContentLayout`. Pendiente de confirmar antes de tocar código (blast radius = ~15 arquetipos).
