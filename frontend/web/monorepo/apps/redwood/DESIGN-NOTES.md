# Mateu-sobre-VB — Notas de diseño (handoff para retomar desde otro PC)

> Licencias y límites de redistribución de las piezas de Oracle: ver [NOTICE.md](NOTICE.md).

> Este doc es la **fuente de verdad para continuar** el proyecto. La memoria de sesión de Claude vive fuera
> del repo (local a un PC), así que todo lo necesario para retomar está aquí, en el repo.

## Dónde está cada cosa

- **Roadmap por fases (con puertas visuales) + entregable final**: `RENDERER-ROADMAP.md` (este directorio)
- **POC ejecutable** (valida la LÓGICA): `frontend/web/monorepo/apps/redwood/poc/` — `reduceContexts.mjs` + `fixtures/*.json` +
  `test.mjs`. Correr: `cd frontend/web/monorepo/apps/redwood/poc && node test.mjs` → 10 tests OK.
- **Diseño completo (PDF)**: `frontend/web/monorepo/apps/redwood-renderer-design.pdf`
- **Apps VB de referencia**: `.dev/vb/dashboard` (JET clásico), `.dev/vb/empty` (dynamic UI), `.dev/vb/frontoffice`
  (Redwood Starter con el pack `oj-sp`/Spectra — la BASE sobre la que construir).

## Qué es el proyecto (en una frase)

Convertir una **app VB real alojada en Oracle** en un renderer de Mateu, mediante un **kit JS portable** (bridge)
que consume el `UIIncrementDto` estándar y lo pinta con los componentes `oj-sp`/`oj-c`/`oj-dynamic` auténticos.
VB = "un renderer más"; el backend de Mateu **no se toca**. Decisión tomada: la traducción vive en un **bridge JS
dentro de la app VB** (no server-side, no hosting de Mateu en el runtime de chains de VB).

## Arquitectura (el núcleo, ya validado en el POC **contra wire real**)

- **Transporte (CONFIRMADO 2026-07-24 contra demo/demo-vb :9005)** — DOS endpoints:
  - **Bootstrap de la shell**: `POST /{base}/mateu/v3/components/_/action` con `{route:'', actionId:'__load__'}`
    → fragmento App (menú, variant, contextSelectors). Es el ÚNICO uso de ese endpoint; la ruta raíz NO
    resuelve por sync.
  - **Todo lo demás**: `POST /{base}/mateu/v3/sync/{route sin barra | _no_route}` con body
    `{serverSideType, appState, componentState, parameters, initiatorComponentId, consumedRoute, route, actionId}`
    (= `AxiosMateuApiClient.runAction`). Las CARGAS usan `actionId: ''` (¡`__load__` da
    "not supported" en orquestadores!).
- **Eco del initiator (la clave del ruteo)**: `targetComponentId` de cada fragment es el ECO del
  `initiatorComponentId` de la request (`''` → host), y el server DERIVA los ids internos del initiator
  (`crud1` → `crud1_app`, `crud1_list`): la unicidad de ids entre superficies es responsabilidad del
  CLIENTE — el bridge postea SIEMPRE con el contextId de la superficie como initiator.
- **Mediadores (crud, isla)**: la 1ª carga devuelve un ServerSide cuyo child0 es un App **chromeless**
  (variant MEDIATOR); el CONTENIDO llega con una 2ª request igual + `consumedRoute` = `rootRoute` del App
  interior + `serverSideType` = su `homeServerSideType` (sin ellos: el mediador otra vez o "No value
  present"). `mediatorOf(ctx)` en el reducer extrae esa info.
- **`reduceContexts(reg, increment)`** — reducer PURO (mismo código que serán métodos de `app-flow.js`):
  - Registro = `contexts` (mapa `targetComponentId → contexto`, host = `__root__`) + `stack` (drawers abiertos)
    + `shell` (cuando llega un `App`).
  - Un **contexto** guarda el `tree` (árbol de componentes, NO campos planos), `state`, `pageType`, `pageWidth`,
    `kind` (`host`/`drawer`/`island`), `dirty`, y presentación si es drawer.
  - Fragmentos enrutados por id: `Add` = overlay nuevo apilado; `Replace`/`ReplaceKeepData`/State = actualizan
    el contexto destino; un `App` configura la `shell` (menú→navigator, título, ancho, appContext, headerActions)
    y NO crea contexto de contenido.
  - Comandos → **efectos** (navigate/toast/download/runAction) o mutan el registro (`CloseModal` = cerrar por
    puro estado; `MarkAsClean/Dirty`).
- **`applyIncrement`** (action chain VB) = `reduce → asignar contexts/stack → pipeline de efectos` (ifActions).
- **Render** = dispatcher recursivo por `metadata.type` → fragment auto-referente `mateu-node` (análogo VB de
  `renderClientSideComponent`). Los formularios son la rama `FormLayout`; la mayoría de arquetipos (item-overview,
  overviews, welcome, collection-detail) son COMPOSICIÓN de un núcleo de ~20 tipos → salen "gratis". Solo unos
  pocos tienen tipo de wire dedicado (DashboardLayout, FoldoutLayout, HeroSection, EntityHeader, Scoreboard,
  MetricCard). `pageType`/`pageWidth` (ya en el wire) eligen plantilla exterior + ancho.
- **Saliente**: `onAction(actionId, contextId)` → `runActionChain` usa `contexts[contextId].route/state`
  (`state` es two-way → guardar = "manda el estado que ya tienes").

## State & aplicación de increments (decisión 2026-07-24)

**El wire separa los dos ejes**: `RunActionRqDto` lleva `componentState` **y** `appState` como mapas distintos
(+ `parameters`, `initiatorComponentId`, `consumedRoute`, `route`, `serverSideType`, `serverSideComponentRoute`).
El mapeo a VB respeta esa separación **por scope**:

- **`appState`** (appContext, se mergea en CADA request) → **`$application.variables.mateuAppState`** (object).
  El scope de aplicación sobrevive a la navegación → justo lo que necesita el appContext.
- **`componentState`** (por frontera de componente, efímero) → vive dentro del **registro**, que también va en
  **`$application`** (`$application.variables.mateuRegistry`) para **conservar islas al navegar** dentro de la
  misma shell sin recargar.
- **No "una variable por id"**: en VB las variables se declaran estáticamente y los ids son UUIDs de runtime.
  Es UNA variable `object` (`@dt: object`/libre) cuyas **claves** son los ids = el `contexts` del reducer.
  Marcadores internos (`_route`, `_embeddedMediator`, `_inline`, `_selectedId`…) viajan dentro del `state`, sin
  trato especial.
- **Two-way sin rutas dinámicas**: no se bindea `oj-c-*` contra `registry.contexts[<uuid>].state.<fieldId>`
  (frágil). Cada instancia de `mateu-node` recibe su contexto como **input parameter con writeback**, expone una
  var de fragmento `state`, y bindea local `value="{{ $variables.state.<fieldId> }}"`. El registro sigue siendo la
  única fuente de verdad para las acciones **salientes**; el writeback mantiene la entrada sincronizada.
- **Saliente**: `runActionChain(contextId)` arma `{ componentState: contexts[id].state, appState: mateuAppState,
  parameters, initiatorComponentId: id, route/serverSideType/consumedRoute/serverSideComponentRoute: del contexto }`.

**Aplicar un increment al target = operación de DATOS, no de DOM** (antídoto al fallo histórico: los renderers
Redwood buscaban el `mateu-ux` por id y lo remontaban imperativamente → rompían islas/mediador):

1. **Ruteo** — el reducer ya escribe cada fragment en `contexts[targetComponentId]` por clave (`Add`→overlay a
   `stack`; `Replace/ReplaceKeepData/State`→merge; `App`→`shell`). El id es solo una clave de mapa.
2. **Binding por id** — cada superficie lee su entrada: host (`contexts.__root__`); overlays (`oj-bind-for-each`
   sobre `stack`, cada id→`oj-sp-drawer`/`oj-dialog` con `contexts[id]`); islas embebidas (cuando el dispatcher
   ve una frontera `ServerSideComponent` con id propio, monta un `mateu-node` anidado a `contexts[thatId]`,
   kind=island — el análogo VB de `mateu-component`).
3. **Re-render quirúrgico** — el reducer es **inmutable con structural sharing**: solo las entradas tocadas
   reciben ref nueva. `applyIncrement` reasigna `mateuRegistry` de una vez; como cada superficie está **keyed by
   id** (`oj-bind-for-each key`, `oj-bind-if`), Knockout/JET solo repinta la superficie cuya ref cambió. Cero
   `getElementById`.

**Casos peliagudos (ya nos mordieron antes):**
- Fragment **State-only** (sin `component`) → MERGE, no replace (el reducer conserva `tree`, línea 100). Un push
  de estado del host no debe borrar el contenido enrutado de una isla.
- **`_route` flips** de mediador/isla viven en `state`; cambiar `state._route` cambia la ref de esa entrada →
  repinta solo la isla, sin remontar shell.
- **Target desconocido en `Replace`** hoy cae en `HOST_ID` (línea 95) — es justo donde el mediador se pisaba con
  el host. Fijarlo con captures reales (crear isla vs. pisar host).
- **SSE/LongTask**: postear con `initiatorComponentId = contextId`; el server hace eco de `targetComponentId` →
  aterriza por el mismo ruteo.

**A verificar en el Designer**: que la reasignación top-level de `mateuRegistry` propague el diff keyed en
`oj-bind-for-each` sin repintar todo (observabilidad Knockout/JET) — probar DENTRO de una app VB real antes de
dar por buena la Fase 9 (app anidada).

## Contrato de wire (CONFIRMADO con increments reales — fixtures/real/*.json)

- `UIIncrement { messages, commands, fragments, banners, appendBanners, appData, appState }`
- `UIFragment { targetComponentId, component, data, state, action: Add|Replace|ReplaceKeepData }` —
  **el estado del componente viaja en `fragment.state`** (p.ej. `{name:'Ada', age:36}` en la carga,
  y el save responde un fragment State-only con el estado nuevo + el toast en `messages`).
- **Raíz de fragmento**: `ServerSide { id, serverSideType, route, pageType, pageWidth, initialData,
  actions, triggers, children:[ClientSide{metadata:{type:Page|App,…}}] }` para contenido enrutado;
  `ClientSide` con `metadata.type:'App'` solo en el bootstrap (shell) — un App de MEDIADOR llega
  SIEMPRE envuelto en un ServerSide y es contenido, no shell.
- **Drawer (Add)**: raíz ClientSide `metadata.type:'Drawer'` con `headerTitle/position/width/size/…`
  y **`metadata.initialData`** = estado inicial del form del drawer; el contenido va en
  `metadata.content` (patrón Card), NO en `children`.
- **CloseModal lleva `data.eventName`** (p.ej. `mateu-crud:saved-in-drawer`): al cerrar hay que
  EMITIR ese evento por el bus @SubscribeTo — así refresca el listado del crud (los ServerSide
  llevan `triggers`). El reducer ya lo emite como efecto `events`.
- **Frontera de isla embebida**: nodo ServerSide INTERIOR del árbol del host, con id = nombre de
  campo (`_guestNote`), `route` con `?_embeddedMediator=1&_inline=1` y esos marcadores también en
  `initialData`. `collectIslands(tree)` las localiza para montar el `mateu-node` anidado.
- `UICommand { type, data, targetComponentId }` — tipos: `SetWindowTitle`, `SetFavicon`, `DispatchEvent`,
  `NavigateTo`, `PushStateToHistory`, `RunAction`, `MarkAsDirty`, `MarkAsClean`, `DownloadFile`, `CloseModal`,
  `AddContentToHead`, `AddContentToBody`.
- `FormField { fieldId, dataType, stereotype, label, required, readOnly, options, placeholder, min, max,
  multiline, … }`
- `ServerSideComponent.pageType` + `.pageWidth` van en el wire (valores pageType: landing/collection/detail/
  form/process/dashboard; pageWidth: fixed/fullWidth/edgeToEdge).
- Catálogo de tipos: `ComponentMetadataType` (~110; App, FormLayout, FormField, Card, TabLayout, FormSection,
  DashboardLayout, Scoreboard, MetricCard, DashboardPanel, FoldoutLayout, HeroSection, EntityHeader, TaskQueue,
  Crud/Table/Grid, + hojas).

## Builtins de action chain de VB

**Confirmados** (vistos en `.dev/vb/dashboard/**/*.json`):
- `vb/action/builtin/assignVariablesAction` — `{ "$scope.variables.x": { "source": "{{ … }}" } }`
- `vb/action/builtin/ifAction` — `{ condition }` + `outcomes.{true,false}`
- `vb/action/builtin/callModuleFunctionAction` — `{ module: "[[ $application.functions ]]", functionName, params }`;
  resultado en `$chain.results.<actionId>`
- `vb/action/builtin/navigateAction` — `{ "@dt": {targetType:"flow"}, parameters: { flow } }`
- `vb/action/builtin/fireDataProviderEventAction` — `{ target, add: { data } }` (útil para banners/ADP)

**A verificar en el Designer** (nombres/param keys según versión):
- `callChainAction` — clave del id de chain (`id` vs `chain`) + `params`
- `fireEventAction` — `{ name, payload }` (el shell del `frontoffice` ya escucha `spShowToast`)
- construcción exacta de `JsonMetadataProvider` (de `oj-dynamic`) si se usa `oj-dyn-form`
- paths reales del wire contra un increment CAPTURADO: `component.id`, `initialData`, metadata del `Drawer`

## Entregable final (NO negociable)

Un **kit JS portable** para VB hosteado en Oracle: (1) bridge como módulo **AMD** (`define([...], …)`) o métodos
de `app-flow.js`; (2) artefactos VB (chains JSON, fragment `mateu-node`, host-page, entradas de `app-flow.json`);
(3) `baseUrl`. Sin build que VB no reproduzca; el `.mjs` del POC es solo test Node → se envía el envoltorio
AMD/UMD del MISMO core. Autocontenido, agnóstico de la app, portátil. "Hecho" = app VB vacía en Oracle + importar
el kit + apuntar a un Mateu → pantalla con look Redwood nativo, cero código propio. Detalle en el roadmap.

## Estado del proyecto (2026-07-24, rama `redwood-fable`)

- **Hecho — paso previo del roadmap**: backend de soporte `demo/demo-vb` (Spring MVC, **puerto 9005**
  para no chocar con las otras instancias del proceso en otros clones; CORS abierto) con una pantalla por
  fase: `/hello` (F1), app raíz con menú (F2), `/person` (F3), `/products` crud editInDrawer (F4–5),
  `/island-host` + isla `GuestNoteView` (F9). `capture.mjs` captura los 13 flujos reales →
  `fixtures/real/*.json`, y `test.mjs` (11 tests) valida el reducer **contra ese wire real** (los
  fixtures sintéticos se borraron). Regenerar: arrancar demo-vb (`mvn spring-boot:run`) + `node capture.mjs`.
- Los renderers antiguos `apps/redwood` y `apps/redwood-spectra` (+ sus módulos `-lit`) fueron BORRADOS
  en esta rama; demo-admin-panel y explorer vuelven a vaadin-lit. Regla del proyecto: **cero HTML/CSS
  propio — siempre componentes VB/Redwood auténticos**.
- Resueltos del plan original: el "Replace con target desconocido cae en HOST_ID" ya no aplica (el ruteo
  es por eco del initiator + fallback por `tree.id`); `PushStateToHistory` y `DispatchEvent` ya están
  mapeados en el reducer (efectos `urlPush`/`events`).

## Fase 1 — HECHA (pendiente de verificación visual del usuario)

- **App VB de trabajo**: `frontend/web/monorepo/apps/redwood` (copia del Redwood Starter `frontoffice`). Local:
  `npm install` una vez; `npx grunt vb-build --no-optimize=true --force` (el --force salta el paso
  de deploy que pide --url; las dependencias de exchange se vaciaron — los `oj-sp` cargan del CDN por
  los paths de `app-flow.json`); `npx grunt vb-serve --port=9006` → http://localhost:9006 (con
  demo-vb corriendo en :9005). En `visual-application.json` se añadió `rootURL`.
- **Kit**: `resources/js/mateu-bridge.js` es GENERADO por `poc/make-amd.mjs` desde la fuente
  única (`reduceContexts.mjs` + `transport.mjs`) — regenerar tras tocar el core. La constante
  `mateuBaseUrl` vive en `app-flow.json`. Chain `loadMateuHello` (JS ActionChain con el bridge como
  dependencia AMD) en `vbEnter` de main-start-page → variables → `oj-bind-text` (markup del starter,
  bindings cambiados; CERO HTML/CSS propio).
- **Shell auténtica**: `shell-page.html` monta `oj-sp-simple-ui-shell` + `oj-sp-global-header`
  (slots declarados `globalHeader`/`stretchingContents`; imports añadidos en shell-page.json).
  La captura `poc/shots/fase1.png` muestra el global header Oracle + FAB Ask Oracle de la
  shell Spectra con el texto de Mateu en su sitio.
- ⚠ El proceso se PARA al final de cada fase para verificación visual del usuario.

## Fase 2 — HECHA (pendiente de verificación visual del usuario)

- **Menú → in-app navigation Redwood**: `loadMateuShell` (vbEnter de shell-page) hace el bootstrap,
  guarda el registro en `$application.variables.mateuRegistry`, proyecta `shell.menu` a
  `mateuNavItems` ({id: route, label: caption}) y navega a la primera opción. `oj-sp-in-app-navigation`
  (import + markup en shell-page) — OJO: el componente se ancla ABAJO por diseño
  (`oj-applayout-fixed-bottom` INCONDICIONAL en su template) — es el paradigma de navegación
  Redwood/FA 26 actual, no un bug. `selection` va con binding ONE-WAY (`[[ ]]`): con writeback
  el componente escribe la variable ANTES de emitir `spSelectionChanged` y la guarda anti-eco
  del chain no puede distinguir el eco de un clic real.
- **Navegación**: `onMateuNavigate` — detail del evento = `{currentId, previousId}` (NO value);
  guarda anti-eco contra `mateuSelectedRoute`; `bridge.loadRouteInto` (nuevo en transport.mjs,
  fuente única) sigue el mediador (2ª carga con consumedRoute+serverSideType) — verificado:
  /products hace exactamente 2 requests y /island-host 1. Título: Page.title, con fallback al
  caption del menú (la Page de un listado NO lleva título — viaja en la metadata del Crudl).
- **Gotcha de Mateu descubierto**: la ruta de una opción `@Menu` TIPADA se deriva del NOMBRE DEL
  CAMPO, no del `@UI` de la clase (campo `islandHost` → ruta `/islandHost` ≠ `/island-host` → "Not
  found."). Workaround en demo-vb: `RouteLink` explícito. Candidato a fix en el framework.
- Evidencia: `shots/fase2.png` (shell + menú + primera ruta) y `shots/fase2-person.png` (contenido
  cambiado SIN recargar la shell); `probe-fase2.mjs` automatiza la puerta.

## Fase 3 — HECHA (pendiente de verificación visual del usuario)

- **Form editable end-to-end**: /person pinta con `oj-form-layout` + widgets JET auténticos
  (`oj-input-text`/`oj-input-number`/`oj-switch`) vía el switch widgetFor — proyección
  `summarizeHost().fields` del bridge (isText/isNumber/isBoolean PRECOMPUTADOS). Two-way:
  `value-changed` por campo → chain `mateuFieldEdited` acumula `{fieldId: valor}` en la variable
  de PÁGINA `mateuDraft` (guarda `updatedFrom === 'internal'` para ignorar el eco del set inicial).
  Save → `runMateuAction` (bridge) con `{...host.state, ...draft}` → State-only merge + toast
  (patrón del starter: `oj-sp-messages-toast` local + `callComponentMethod open`) → NavigateTo →
  evento `application:mateuNavigate` → la shell navega. Evidencia: `shots/fase3.png` y
  `shots/fase3-saved.png` ("Saved Grace").
- **Gotchas del runtime VB local (JET 19 app + visualRuntime 2510 construido para JET 18 — el
  "version mismatch" de consola) que CONDICIONAN el diseño**:
  1. `oj-dynamic-form` (el tag real — NO `oj-dyn-form`) acepta metadata como objeto plano y
     REQUIERE `displayProperties`, pero **no absorbe ediciones**: su `transientValue` no se
     actualiza al teclear (y el writeback `{{ }}` no escribe ni en variables de aplicación ni de
     página). `ojRawValueUpdated` está deprecado/"not supported" en la variante cca. → switch
     widgetFor con widgets clásicos; REVISITAR oj-dynamic-form en VB Studio con runtime emparejado.
  2. Los VComponents `oj-c-*` no evalúan sus property bindings (label undefined) → `oj-button`
     clásico con `oj-bind-text` slotted (Redwood-themed en JET 19 igualmente).
  3. El evaluador CSP de VB rompe con ternarios/comparaciones en atributos → TODO precomputado
     en los datos del bridge (chroming, isText…); bindings solo con paths simples.
  4. `Actions.fireEvent` necesita el nombre CUALIFICADO (`application:mateuNavigate`); a pelo no
     llega al listener de la shell.
  5. Los parámetros de listener en el JSON de página SÍ evalúan `$current` (el patrón
     `{{ $current.data.actionId }}` es el mecanismo para saber qué botón/campo disparó).

## Fase 4 — HECHA (pendiente de verificación visual del usuario)

- **Listado end-to-end**: /products pinta con `oj-table` clásico (columnas de la metadata del
  componente **Crud** — GridColumns anidadas en `md.columns`) + `oj-input-search` (Enter →
  `ojValueAction`) + `oj-sp-empty-state` en el slot noData. Filas envueltas en un
  `vb/ArrayDataProvider2` de página cuyo `data` se BINDEA a la variable de aplicación
  `mateuListingRows` (keyAttributes `_rowNumber`, siempre presente). Verificado: 3 filas,
  búsqueda "lap" → solo Laptop (filtrado server-side), "zzz" → estado vacío.
- **Contrato del listing (wire real)**: el ServerSide del listing trae triggers
  `OnLoad → search` (así llegan las filas: el bridge los ejecuta tras cargar la ruta —
  `onLoadTriggers`) y `OnCustomEvent mateu-crud:saved-in-drawer → search` (el refresco del
  drawer, Fase 5). El search es actionId `search` con el texto en **componentState.searchText**
  (+ `page`/`size`/`sort` — así lo lee `SearchActionHandler`; NO va en parameters). La respuesta
  es un fragmento **DATA-ONLY**: `data.crud.page.{content,totalElements}` (clave literal `crud`).
- **Reducer: eje `data`)**: los contextos ganan `data` (datos calculados por el server, separados
  del `state`); un fragmento data-only MERGEA data conservando árbol y estado. `listingOf(ctx)`
  proyecta título/columnas/filas/toolbar/emptyStateMessage; test 14.
- **1.4 adelantado**: `loadRouteInto` estampa `ctx.outbound` (route/consumedRoute/serverSideType)
  y `runMateuAction` reconstruye los campos de ruta desde ahí — las acciones del listing (que es
  contenido de mediador) salen con el consumedRoute correcto sin que la superficie lo sepa.
- Gotcha de sondas: los módulos de oj-table/search estampan `oj-dialog`s ocultos con `h1` vacíos —
  las sondas deben buscar el h1 CON texto, no el primero.
- Evidencia: `shots/fase4.png`, `fase4-search.png`, `fase4-empty.png`.

## Fase 5 — HECHA (pendiente de verificación visual del usuario)

- **CRUD completo en drawer**: New (toolbar del wire) y clic-en-fila → drawer `oj-drawer-popup`
  (edge end, modal) con el form widgetFor del contenido del Drawer de Mateu; Save/`create` →
  `CloseModal(mateu-crud:saved-in-drawer)` → el chain dispara los triggers `OnCustomEvent`
  suscritos (search) → el listado refresca; toast del starter. Esc/✕ descarta por puro estado
  (`dismissOverlay`, sin evento — el camino "dismissed without saving"); Cancel va al server
  (`cancel-new`/`cancel-edit` → CloseModal). Verificado end-to-end: alta Monitor + edición
  Laptop 1200→999 persistidas y refrescadas.
- **Contrato fijado**: clic de fila = actionId `view` con la FILA como `parameters` (así lo
  dispatcha mateu-table-crud) → Add Drawer "Edit" con `initialData` = la fila; el drawer NO
  lleva ServerSide interior → sus acciones se postean contra el HOST (outbound del listing);
  drawer New→`cancel-new`/`create`, Edit→`cancel-edit`/`save`. Fixture nuevo
  `open-edit-drawer.json`; tests 15/15 (overlayOf/eventTriggersOf/dismissOverlay).
- VB: fila seleccionable (`selection-mode.row single` + `firstSelectedRowChanged` → view);
  gotcha: `oj-drawer-popup` con `opened` one-way cierra con Esc SOLO si el foco está dentro
  (comportamiento modal correcto); listener en `ojBeforeClose`. El AbortError "stale fetch"
  de oj-table en consola es una optimización propia del componente, benigno.
- **Fix post-verificación (el drawer se reabría tras guardar)**: dos causas. (a) usar la
  SELECCIÓN de fila para abrir el Edit — la tabla re-emite el evento de selección al refrescar
  tras guardar → `view` otra vez; cambiado a `ojRowAction` (el gesto correcto, sin estado).
  (b) una CARRERA del runtime VB: re-invoca el listener con el MISMO evento almacenado tras el
  refresco (~30ms después del save; a nivel DOM solo hubo UN ojRowAction — verificado con
  listener en captura a nivel documento) → guarda de DEDUPE por `timeStamp` del originalEvent
  en `mateuRowClicked`. Verificado 5/5 ciclos editar+guardar sin reapertura.
- Pendiente anotado: el botón Delete del toolbar renderiza pero la selección-para-borrar
  (`crud_selected_items`) no está cableada aún; formateo de columnas (money/boolean) también
  pendiente. Evidencia: `shots/fase5-list.png`, `fase5-new.png`, `fase5-created.png`,
  `fase5-edit.png`, `fase5-edited.png`.

## Fase 6 — HECHA (pendiente de verificación visual del usuario)

- **Menú profundo**: un grupo `@Menu` (clase con @Menus anidados) llega en el wire como opción con
  **`submenus`** (¡no `submenu`!) y rutas COMPUESTAS (`/gestion/person`) que **NO resuelven por
  sync** — el bridge navega por la ruta TERMINAL (recorta el prefijo del padre; `shellNavOf`).
  **La VARIANTE del wire manda** (afinado con DOS rondas de feedback del usuario) — TRES modos
  en `shellNavOf().mode`: `TABS` → in-app navigation inferior; **`HAMBURGUER_MENU`/`TILES` →
  navigator PERSISTENTE**: `oj-drawer-layout` (reflow, NO popup) DEBAJO del header con
  `oj-navigation-list` jerárquico en el slot start — **abierto de inicio**, **no se oculta al
  navegar** (marca el item activo vía `selection`); la hamburguesa solo lo pliega/despliega y
  el contenido se desplaza (3ª ronda de feedback del usuario — la 2ª versión usaba un popup
  modal que se cerraba al navegar). **¿Navigator empaquetado?** NO hay: `oj-sp-navigator` y
  `oj-sp-ask-oracle-navigation-list` requieren el entramado de módulos FA (probados en vivo:
  0×0, `oj-pending-subtree-hidden`; sus datos llevan module/focusViewId/productFamily) — las
  propias plantillas de VB (app "empty") montan la nav izquierda igual que nosotros:
  `oj-navigation-list` en un drawer. Ancho del panel: 280px en el contenedor del slot start
  (patrón cookbook JET/RDS; oj-drawer-layout dimensiona por contenido y no expone variable); **`MENU_ON_TOP` → opciones de PRIMER NIVEL VISIBLES en el header** (sin
  hamburguesa; hojas = `oj-button` borderless con la ruta en data-route, grupos =
  `oj-menu-button` + `oj-menu`). Gotcha: `oj-navigation-list` parsea su `<ul>` en el init y los
  `li` estampados por `oj-bind-for-each` llegan DESPUÉS → hay que llamar a `refresh()` al abrir
  el drawer o quedan como links crudos. El demo lleva `@App(HAMBURGUER_MENU)` explícito para
  exhibir el drawer (quitar la anotación → AUTO → MENU_ON_TOP → topbar); ambos modos
  verificados (`shots/fase6-navdrawer*.png`, `fase6-topbar.png`).
- **@AppContext**: `contextSelectors` del App → `oj-select-one` compacto (clases utilitarias
  `oj-form-control-max-width-sm` + `oj-sm-flex-wrap-nowrap`) en el slot `end` del global-header;
  el valor va a `$application.variables.mateuAppState` y viaja como **appState en CADA request**
  (enhebrado en loadRouteInto/runMateuAction/chains); al cambiar, se recarga la ruta actual
  (reactividad uniforme). Verificado: "Saved Ada @ Playa" (el server lo lee via
  `httpRequest.appContext`).
- **Header actions** (`AppActionsSupplier`): hoja → `oj-button` borderless; con hijos →
  `oj-menu-button` + `oj-menu`/`oj-option` (actionId en el `value`, `detail.selectedValue` en el
  listener). Despacho APP-LEVEL confirmado: `sync/_no_route` + serverSideType del App (guardado
  en el slice shell) + appState — "Synced @ Playa", "Exported as PDF" por el toast de la shell.
- Tests 16/16 (`shellNavOf`); fixtures regenerados (menú con grupo + selectores + acciones).
  Evidencia: `shots/fase6-submenu.png`, `fase6-context.png`, `fase6-header.png`.

## Fase 7 — HECHA (pendiente de verificación visual del usuario)

- **Foldout end-to-end**: demo-vb `/booking` (`BookingFoldout extends Foldout`: overview +
  3 `@Panel`) → wire `FoldoutLayout` (cabeceras en `metadata.panels` {title,subtitle,icon,open},
  contenido SLOTTED `overview`/`panel-N`, pageWidth edgeToEdge) → proyección `foldoutOf(ctx)`
  (+`collectTexts`) → **`oj-sp-foldout-layout` + `oj-sp-foldout-panel` auténticos** (prop
  `panelTitle`, contenido en el slot default). El chrome es el RDS real: barra de acento dorada
  bajo cada título, superficies, breadcrumb "Parent page" y page-dots del propio componente.
- **Interacción**: el clic va en el CONTENEDOR del panel (no en el título) — los paneles se
  reparten el espacio y al enfocar uno los demás se pliegan; los dots (`a.pagination-dot`)
  navegan. **Gotcha CRÍTICO de layout (post-verificación: "los dots no hacían nada")**: la
  lógica responsive del foldout solo se activa si su ancho está ACOTADO — el `oj-vb-content`
  del starter es un flex-item con `min-width:auto`, así que el contenido ancho DESBORDABA
  (scrollWidth === clientWidth → el componente creía que todo cabía). Fix estándar:
  `min-width:0` en el `oj-vb-content` de shell-page (aplica a CUALQUIER contenido ancho:
  foldouts, tablas, planning…) y sin wrappers flex alrededor del foldout en la página.
- Limitaciones anotadas: `open=false` (Notes plegado de inicio) NO tiene API en
  `oj-sp-foldout-panel` (todos arrancan visibles); `subtitle` no existe como prop (se pinta
  como primera línea del contenido); el contenido de los paneles se proyecta como TEXTOS
  (`collectTexts`) — el dispatcher recursivo general sigue pendiente (fases posteriores).
- Tests 17/17 (fixture `load-foldout.json`). Evidencia: `shots/fase7.png`, `fase7-folded.png`.

## Fase 8 — HECHA (pendiente de verificación visual del usuario)

- **Guided process end-to-end**: demo-vb `/checkout` (`CheckoutWizard extends Wizard`, 3 pasos +
  resultado, `@WizardProgress(STEPS)`) → wire: `ProgressSteps` con `steps [{id,title,status:
  current|upcoming|done}]` + Card del paso (form normal) + botones back/next (acciones normales)
  + `pageType process`; el estado cross-step viaja en el state (position + mapas por paso +
  campos aplanados). Proyección `wizardOf(ctx)` (steps con alias `title` — el rail del
  componente lee ese campo — + currentStep). Tests 18/18, fixture `load-wizard.json`.
- **`oj-sp-guided-process` auténtico** (afinado con feedback del usuario: overview + sin Next
  fantasma + rail marcando el paso): template completo — banda ilustrada, **OVERVIEW inicial**
  (columnas numeradas 01/02/03 + botón Start) que aparece cuando `current-step` es VACÍO y cuyo
  Start pasa a paso 1 por WRITEBACK INTERNO (sin evento — no interceptar); rail derecho `N|M`
  con lista de pasos. Integración: form del paso (widgetFor) en su slot; Continue →
  `spBeforeNext` → acción forward del wire; último paso → `primaryAction` {label del confirm,
  disabled} **SIN availableFromStep** (si lo pones, el botón aparece DESHABILITADO en todos los
  pasos — el "Next fantasma"); nunca null (lee .label incondicionalmente). RAIL: cada step
  necesita **`display:'on'`** o sale con oj-disabled (apagado, sin marca de selección); el
  status de Mateu NO se emite (el indicador espera otro enum). current-step efectivo en var
  aparte (`mateuWizardShownStep`: '' al entrar = overview; el paso real tras cada acción).
  El **h1 de página se SUPRIME en modo wizard** (el guided-process ya lleva el título en su
  overview y su cabecera; feedback del usuario) — cualquier acción extra de toolbar de un
  wizard iría al slot del paso, no a un header duplicado.
  **Atrás = clic en el RAIL** (feedback: un Back en el contenido contradice al Cancel del
  footer): `spBeforeStepNavigate` (detail {currentStep,nextStep,triggeredFrom:'continue'|'step'})
  con triggeredFrom 'step' ejecuta los 'back' necesarios contra Mateu (fromIdx−toIdx veces);
  hacia DELANTE por el rail no navega (se restaura el paso mostrado imperativamente — el evento
  es cancelable pero el chain corre async y preventDefault llega tarde). El slot no lleva
  botones (footer/rail del componente navegan). **Cancel** (`spCancel` — el componente lo
  despacha a pelo, sin diálogo en este camino): abandonar el proceso → navegar a la home
  (`mateuHomeRoute`, la primera hoja del menú, guardada en el bootstrap); al reentrar el wizard
  arranca de cero (instancia fresca por request). Verificado: overview→Start→1→2→3→Confirm→
  "Pedido confirmado…", rail marcando cada paso, rail-back conservando el estado, Cancel→home
  y reentrada al overview. Gotcha de sondas: el resultado va en un input readonly
  — `innerText` no ve valores de inputs.
- Evidencia: `shots/fase8.png`, `fase8-step3.png` (rail 3|3 + Confirm), `fase8-result.png`.

## Fase 9 — HECHA (pendiente de verificación visual del usuario)

- **Isla embebida end-to-end** (`/island-host`, en Gestion): el host es un form normal y la
  frontera (`collectIslands`: ServerSide interior, id `_guestNote`) se carga como SUPERFICIE
  PROPIA — `loadRouteInto(base, reg, frontera.route, frontera.id)` (initiator = id de frontera
  → mediador + contenido + outbound estampado, TODO genérico ya existente). Sus acciones
  (Edit/Save/Cancel) se postean contra su contexto y las respuestas vuelven dirigidas a él:
  **solo la isla se re-proyecta — el host NI SE TOCA** (verificado: una edición local sin
  guardar en el host, room=999, sobrevive a Edit y a Save de la isla).
- **Route-flip del mediador (la mecánica documentada, ahora implementada)**: `edit`/`save`
  responden un fragment STATE-ONLY con `state._route` nuevo (`/edit`→`/view`) = "recarga mi
  ruta interna": `composeInnerRoute(outbound.route, flip)` = base + flip + marcadores query
  (`/guest-note/edit?_embeddedMediator=1&_inline=1`) y reload con el outbound del contexto.
- **Helpers con FRONTERA**: `collectFields`/`collectActions` ya NO cruzan ServerSide interiores
  (los campos/acciones de la isla se colaban en el form del host — test 19).
- **GOTCHA VB CRÍTICO**: las variables VB van tras PROXIES — cada lectura puede devolver un
  wrapper distinto → NUNCA comparar por identidad (`after.tree === before.tree` falla aunque
  el reducer preserve refs). Detección del flip por criterio SEMÁNTICO (increment state-only).
  Esto también matiza el "structural sharing" del diseño: vale DENTRO de una pasada del
  reducer, no entre lecturas de la variable.
- Tests 20/20. Evidencia: `shots/fase9.png` (host+isla en vista), `fase9-edit.png` (isla en
  edición con el host intacto), `fase9-saved.png` (guardado, vista con la nota nueva).

## Puertas 1.x — CERRADAS (pendiente de verificación del usuario)

- **1.1 estado / 1.2 increments-al-target / 1.4 rutas**: cayeron de facto con las fases 3–9
  (registro en $application, repintado quirúrgico probado con la isla, outbound + composeInnerRoute).
- **1.3 comandos→efectos**: COMPLETADO con los banners — `@Banner` viaja en `Page.metadata.banners`
  ({theme,title,description}); `bannersOf(ctx)` los mapea al `oj-sp-messages-banner` del starter.
  GOTCHAs: el ADP se muta con `Actions.fireDataProviderEvent` (add/remove con tracking de keys —
  asignar `.data` NO refresca) y los `messageType` van con prefijo **`general-*`**
  (general-info/success/warning/error — el patrón del starter). PENDIENTE honesto: `RunAction` y
  `DownloadFile` mapeados en el reducer pero SIN ejecutar en VB (no hay fixture real de su data
  — capturar antes de implementar, regla del proyecto).
- **1.5 sync con URL**: rutas Mateu como HASH de la shell (#/ruta — deep-linkable sin soporte del
  server estático): deep-link en el bootstrap (el hash inicial manda sobre la primera hoja);
  navegación → pushState (sin recarga); back/forward → hashchange → onMateuNavigate(fromUrl) —
  el listener se registra en loadMateuShell REUTILIZANDO el context del chain (los scopes VB
  siguen vivos tras vbEnter). **dirtyGuard**: mateuDirty (app var, lo encienden los
  value-changed, lo apagan navegación/acciones) → confirm al salir; cancelar restaura la URL
  (replaceState — no dispara hashchange). `PushStateToHistory` del wire → efecto urlPush
  (mapeado; sin flujo demo que lo emita aún).
- **1.6 anatomía pageWidth (VISUAL)**: `pageStyleOf(ctx)` → bindings :style del contenedor:
  fixed = 1408px centrado + 24px (Person mide 1408px), fullWidth = fluido + 24px (sin página
  demo), edgeToEdge = 0 (Booking mide padding 0). Medición RDS 24C.
- Tests 21/21. Evidencia: `shots/gates-banner.png` (banner INFO Redwood en Hello).

## Regla de headers Redwood (feedback del usuario, 2026-07-25)

**Una página con header Redwood (wizard/general-overview/welcome) NO lleva h1 propio** — lo que
hubiera en el header de página se INTEGRA en el header Redwood (p.ej. el título de página va
como parent-page link del `oj-sp-header-general-overview`, vía `translations.goToParent`), y el
header va A SANGRE (sin padding arriba ni a los lados): las proyecciones fuerzan
`mateuPagePadding='0'` cuando hay header Redwood y el contenido inferior recupera los gutters
con clases utilitarias del sistema (`oj-sm-padding-4x-horizontal`). Cero CSS propio.

**Generalización (feedback, 2026-07-25): TODA página pinta su header con un header de vb** —
el h1 se ELIMINÓ del renderer. Reparto por tipo de página:

- **Listado (crud)** → `oj-sp-smart-filter-search`: pageTitle + `primaryAction` (primer botón
  de la toolbar del wire, p.ej. New) + `secondaryActions` (resto, p.ej. Delete); la tabla y la
  búsqueda van en su slot `main` (con `oj-sm-padding-4x-horizontal`). Eventos
  `spPrimaryAction`/`spSecondaryAction` → runMateuAction (el secondary llega con
  `detail.secondaryItem` = item/label → se resuelve contra la toolbar). `primaryAction` nunca
  null: `{label:'', display:'off'}` cuando no hay toolbar.
- **Página genérica (form / texto / foldout / item overview / isla)** →
  `oj-sp-header-general-overview` SIN switcher (todas sus props son opcionales): `page-title` +
  `display-options.go-to-parent="false"` (si no, pinta el link "Parent page" por defecto).
  Proyección `mateuPageHeader = {title}` en ambos chains; null cuando el template ya integra su
  header (wizard/overview/welcome/listado) — esos suprimen el genérico.
- Los botones de formulario/isla se quedan con su contenido (el wire de Mateu no distingue
  toolbar de página vs botones de form en `actionsOf`; los del crud sí viajan aparte).

**Gutters del contenido (2026-07-25)**: el sangrado interno del título de los headers oj-sp es
`--oj-core-spacing-12x` (3rem = 48px). El contenido bajo un header a sangre se alinea con la
clase utilitaria JET de la MISMA escala: `oj-sm-padding-12x-horizontal` (48px) +
`oj-sm-padding-6x-vertical` (24px, el gutter RDS) para la respiración bajo la franja
decorativa. `oj-sp-public-primary-content-container` NO trae padding propio (computa 0), y no
existe ninguna clase pública `oj-sp-*` de padding de contenido — las utility classes de
espaciado JET (escala 1x=4px, hasta 12x) son la vía oficial OJET. Medido empíricamente
(getComputedStyle sobre probes): el h1 del header queda a 48px del borde del contenedor; con
12x el form/tabla quedan alineados EXACTAMENTE con el título.

**GOTCHA (2026-07-25)**: la rama de TEXTO del content page estaba condicionada a
`!mateuFormMetadata` — en toda página sin formulario (welcome, listado, wizard, overview…)
pintaba un div VACÍO que, con el padding vertical de los gutters, era una banda blanca de 48px
ENCIMA del header. Condición correcta: `!!mateuHostText` (solo cuando hay texto de verdad).
En `/hello` lo que aparece sobre el header de página NO es un hueco: es el `@Banner` INFO del
wire (oj-sp-messages-banner del shell, bajo el header global — su animación de montaje tapa
el header global unos ms, transitorio).

**GOTCHA "Parent page" (2026-07-25)**: los componentes oj-sp con header estampan por defecto
el link goToParent ("Parent page"). Hay que apagarlo explícitamente en CADA uno:
`display-options.go-to-parent="false"` en el header genérico (`oj-sp-header-general-overview`)
Y TAMBIÉN en `oj-sp-foldout-layout`, que estampa internamente un `oj-sp-header-navigation`
cuya única banda visible era ese link (su API no está en el loader del CDN — se lee en runtime
via `customElements.get('oj-sp-foldout-layout').metadata.properties`). El foldout SÍ cuenta
como "template con header integrado" (rectificado 2026-07-25): su `oj-sp-header-navigation`
interno es un cascarón de 16px que NO se puede colapsar con ninguna opción (probado
goToParent/bidirectionalNavigation/inFlowBack off), así que apilar el header genérico encima
dejaba siempre una franja. Resolución RDS-fiel: el foldout va SIN header genérico, edge-to-edge
bajo el header global, con el título en el panel de overview (como el template Foldout de RDS);
su header interno lleva `display-options.go-to-parent="false"` +
`display-options.background="transparent"` (queda como respiración invisible de 16px).

Evidencia: `shots/fase4.png` (products), `hdr-person.png`, `hdr-island.png`, `hdr-hello.png`,
`hdr-booking.png`, `hdr-chair.png`, `gap-welcome.png`, `gap-hello.png`, `gap-checkout.png`.

**Anatomía de color RDS (2026-07-25)**: header de página BLANCO ≠ contenido, y lienzo con
texturas alrededor (referencia: el renderer redwood-oj en :8000 y el pantallazo RDS del
usuario). Cómo: (1) los headers llevan la clase utilitaria JET `oj-bg-neutral-0` (blanco) —
en el elemento host, que la CONSERVA junto a `oj-complete` (los VComponents no la machacan);
la zona de resultados del listado recupera su color con `oj-bg-body` en el slot main.
(2) El lienzo alrededor = `resources/css/app.css` (ÚNICO css de app del proyecto, punto de
personalización estándar de VB): body a `--oj-core-neutral-30` (#F1EFED) + `body::after`
fixed con las texturas OFICIALES del gallery del CDN de Oracle
(`static.oracle.com/cdn/fnd/gallery/2604.0.2/images/background-shell-generic-start/end.png`,
la MISMA receta que pinta FA: inset 270px 0 0 0, ancladas abajo izda/dcha, z-index -1).
(3) El icono Home que estampa `oj-sp-global-header` (sin API de posición) pasa a la derecha
del todo con `order: 99` (comparte contenedor flex con el slot end). Colores medidos de las
utility classes: oj-bg-neutral-0 #FFF · oj-bg-body/neutral-10 #FBF9F8 · neutral-20 #F5F4F2 ·
neutral-30 #F1EFED. **Navigator a toda altura**: `oj-drawer-layout` no crece solo
(flex 0 1 auto → alto del contenido, el menú se cortaba en páginas cortas) — `style="flex: 1
1 auto"` en el elemento (pageContent/oj-web-applayout-page ya es flex column de 100%), mismo
mecanismo inline que el `min-width:0` de oj-vb-content. **pageLayout del shell**: `oj-sp-simple-ui-shell`
adapta su chrome (tamaño del chat FAB, etc.) a `page-layout` (fixedWidth/fullWidth/edgeToEdge)
— se alimenta del `pageWidth` del wire por página (`mateuShellPageLayout`, fixed→fixedWidth)
en ambos chains; no constriñe el contenido (nuestro container sigue mandando en el ancho). **Alineación del chrome flotante (chat FAB)**: el shell posiciona su FAB
con `right = max(24px, (100vw − 1536px)/2)` sobre el viewport COMPLETO (ignora el navigator
drawer), así que centrar el contenido fixed en el área restante lo desalineaba en viewports
anchos. Arreglo doble: (1) `pageStyleOf` ancla el borde DERECHO del contenido fixed a la misma
fórmula (`margin: 0 max(24px, calc((100vw - 1536px)/2 + 64px)) 0 auto`, tope 1408 — el FAB
nace exactamente donde acaba el contenido, como en FA); (2) fuera la clase
`oj-web-applayout-max-width` del wrapper del starter — capaba el área a 1440 y rompía
cualquier fórmula viewport-relativa. Verificado a 1440/1920/2400; en edgeToEdge el FAB queda
en el borde derecho de la página. **Regla drawer ⇒ edge-to-edge (2026-07-25)**: con navigator
persistente a la izquierda (HAMBURGUER_MENU) el formato pasa a edge-to-edge AUTOMÁTICAMENTE
(ambos chains ignoran el pageWidth del wire y fuerzan edgeToEdge en pageStyle y en el
page-layout del shell): centrar un fixed en el área restante quedaba raro — el drawer ya
consume el lateral. Los gutters del contenido los siguen poniendo las ramas (12x/6x). El
anclaje del borde derecho a la caja del shell (párrafo anterior) queda para las variantes
SIN drawer (tabs/topbar).

**Densidad de tabla (2026-07-25, regla RECTIFICADA por el usuario)**: `oj-table` trae los
dos formatos Redwood — `display="list"` (aireado) y `display="grid"` (compacto, con rejilla).
Primera regla (por nº de columnas, ≥6→grid) DESCARTADA: el grid compacto es para tablas de
TRABAJO, no de consulta — `listingOf` precomputa `display` = grid solo cuando alguna columna
del wire es `editable` (@InlineEditing), si no list. Products (8 columnas, no editable) →
list. Verificado con `StockCrud` (@InlineEditing, /stock) en demo-vb: sus columnas viajan
`editable` → grid (37px, rejilla), Products sigue list (shots/stock-grid.png).

**Edición de celdas CABLEADA (2026-07-25, /stock)**: contrato CAPTURADO (fixtures/real/
update-row.json + load-stock.json, test 23): las columnas del wire llevan `editable` +
`editorType` (text/integer/number/boolean; @ReadOnly → editable:false), el commit es la
acción `update-row` con `parameters._editedRow` = LA FILA ENTERA editada (los extras tipo
_rowNumber no molestan), y la respuesta es SOLO un toast success — sin fragments (el valor
ya está en el cliente). Implementación VB: `listingOf` proyecta `template` por columna
(cellEditText/Number/Boolean — editorType integer y number comparten oj-input-number) +
`editable` a nivel de listing; oj-table estampa 3 `<template slot>` compartidos con editores
SIEMPRE visibles (sin edit-mode rowEdit: el commit de Mateu es POR CELDA, no por fila);
el listener pasa el CONTEXTO del template ($current.row/item/columnIndex — row.data o
item.data según versión) al chain `mateuCellEdited`, que guarda: updatedFrom !== 'internal'
(re-stamp) y valor sin cambio (no-op) → runMateuAction('update-row'). El clic de fila NO
navega en tablas de trabajo (guard en mateuRowClicked por listing.editable). El toast pasó
a ser ÚNICO a nivel de página (#mateuToast fuera de las ramas — antes vivía en la rama del
form y las páginas de listado no lo mostraban). Verificado e2e: texto/número/boolean
persisten tras recarga dura (el switch se acciona en su thumb). OJO ~/.m2 COMPARTIDO entre clones (opus/k3): si demo-vb deja de compilar con
"cannot access io.mateu.uidl..." es que otro clon pisó los jars 0.0.1-MATEU — reinstalar
backend desde este clon (cd backend && mvn clean install -DskipTests).

## Arquetipos Welcome / General Overview / Item Overview — HECHOS (pendiente de verificación)

- Confirmada la tesis del diseño: los tres son COMPOSICIÓN del núcleo — welcome = HeroSection +
  Buttons + DashboardLayout/DashboardPanel; general overview = FormField switcher (options) +
  EntityHeader {title,subtitle,badges,facts,metric} + Cards; item overview = Card (key info) +
  TabLayout/Tab. Proyecciones `welcomeOf`/`generalOverviewOf`/`itemOverviewOf` (+ `cardOf`,
  `findAllByType`); cuando hay arquetipo, el form genérico se suprime. Tests 22/22; fixtures
  load-welcome/requisitions/chair.
- **Welcome** → `oj-sp-header-welcome-banner` (pageTitle/descriptionText + primaryAction/
  secondaryAction integrados → spPrimary/SecondaryAction → acciones del wire; CTA navega);
  tiles como `div.oj-panel` (clase de sistema JET) + tipografías.
- **General Overview** → `oj-sp-header-general-overview`: contextualInfo = facts [{label,value}]
  (+ métrica como fact); **el switcher de registro ES el TÍTULO** (`oj-sp-data-switcher` con
  caret — aparece cuando `selectObject.data` es un DataProvider NO vacío; el objeto se compone
  en una variable con referencia a otra variable — `{"data": "{{ $page.variables.overviewADP }}"}`
  SÍ resuelve); on-select-object-value-changed → acción `switchRecord` del arquetipo (empírico:
  también vale recargar con el state). GOTCHA de sondas: los facts van en un conveyor-belt y
  `innerText` no los reporta (usar textContent).
- **Item Overview** → panel `oj-panel` con los datos clave + `oj-tab-bar` clásico (ul/li +
  refresh() tras el stamping, mismo gotcha que navigation-list); selección de tab client-side
  (los tabs viajan enteros en el árbol).
- Evidencia: `shots/arch-welcome.png`, `arch-overview.png`, `arch-overview-switched.png`,
  `arch-item.png`.

## TaskQueue — los listados del front-office (2026-07-25)

Los "listados" de check-in/check-out/en-casa SON `TaskQueue`: datos INLINE en la metadata
(`groups[].label` + `items[]{id,title,caption,badges[{label,color}],selected}`), sin eje data
ni triggers. Contrato del clic (= mateu-task-queue.ts del renderer web): `metadata.actionId`
(openGuest) con `parameters._item` = id del item; el server RE-RENDERIZA el host (Replace al
uuid del ServerSide) con la card `selected` y el placeholder EmptyState sustituido por el
DETALLE. Proyecciones `taskQueueOf` (badges → clases badge de JET oj-badge-*-subtle, cardClass
selected → oj-bg-neutral-20, TODO precomputado por el CSP) y `emptyStateOf` (placeholder /
página de bienvenida). VB: cards `oj-action-card` (JET core, ojs/ojactioncard — dispara
ojAction al clic) agrupadas bajo `oj-typography-subheading-xs`, panel derecho
`oj-sp-empty-state`. GOTCHA REINCIDENTE: make-amd.mjs lleva LISTA EXPLÍCITA de exports — toda
proyección nueva hay que añadirla ahí o el bridge AMD no la expone ("is not a function").
Fixtures fo-load-checkin + fo-open-guest; test 24. Shots fo-checkin/checkout/encasa(+sel).

**SIGUIENTE (detectado, sin hacer)**: el detalle tras openGuest es una ISLA-MEDIADOR de
sabor App — un nodo ClientSide `App` variant=MEDIATOR con id estable (`island_checkin_st_maria`)
y homeRoute (`/checkin/st-maria?_embeddedMediator=1`) + homeConsumedRoute + homeServerSideType
en su PROPIA metadata (collectIslands NO lo detecta: busca fronteras ServerSide). Su contenido
es el CheckInWizard embebido (wizardOf ya lo proyecta: Identidad/Habitación/Extras/Confirmar,
acciones selectPax/back/next) con tipos display aún sin rama: EntityHeader, Notice,
BulletedList, Card, Separator, ProgressSteps, Div.

## Detalle del TaskQueue — la isla-wizard embebida PINTA (2026-07-25)

`collectIslands` detecta ahora TAMBIÉN el sabor App-mediador (nodo ClientSide `App`
variant=MEDIATOR con id estable; route/consumedRoute/serverSideType salen de su PROPIA
metadata home*) y ambos chains cargan la isla al aparecer (runMateuAction la carga si su
contexto no existe aún — antes solo onMateuNavigate cargaba islas). El contenido se proyecta
con `islandContentOf(ctx)` — proyección display GENÉRICA: BLOQUES (plain|card→oj-panel) de
átomos precomputados para el CSP (flags is*): Text (tamaños→oj-typography-*, con
`interpolate()` de ${state.x} contra el state de la isla), ProgressSteps→oj-train (JET core),
EntityHeader (título+badges+subtitle+facts), Notice (oj-panel + oj-bg-{success|warning|
danger|info}-30, con sus Buttons anidados p.ej. selectPax con parameters), BulletedList,
Separator (hueco), Buttons (Back/Next → runMateuIslandAction, que ahora acepta parameters).
GOTCHA del árbol: los hijos viajan en `children` Y/O en `metadata.content` (CustomField,
Notice, Card) — el walker desciende ambos. La rama antigua de isla-formulario queda para
islas SIN contenido display (GuestNote). GOTCHA oj-sp-in-app-navigation: el componente
estampa su barra REAL como overlay fijo abajo, pero su elemento HOST reserva 64px en flujo
allí donde esté — debe ir al FINAL del pageContent (si va arriba deja una banda vacía bajo
el header Y el fondo del contenido queda tapado por la barra sin poder clicarse).
Verificado e2e contra :8594: clic huésped → detalle (EntityHeader+Notice pax+Preferencias),
selectPax re-renderiza, Next avanza al paso Habitación. PENDIENTE señalizado: átomos
ResourceGrid/AddOnPicker/Ledger/PaymentPicker/StatusList/Meter/TaskProgress (pasos 2-4 y
check-out) e islas ANIDADAS (App dentro de la isla, p.ej. el documento — el walker las
salta). Fixture fo-island-wizard, test 25. Shots fo-checkin-sel/fo-checkin-step2.

## Átomos de negocio del front-office — COMPLETOS (2026-07-25)

`islandContentOf` proyecta ya los 9 tipos display restantes (formas capturadas del wire
real; contratos de despacho = los del renderer web compartido): **Badge** (chips →
oj-badge), **ResourceGrid** (grid de habitaciones → tiles oj-action-card en oj-flex,
columns→oj-sm-N, disabled→oj-panel con oj-text-color-disabled, selected→oj-bg-neutral-20;
clic → actionId + {_item}), **OfferCard** (oj-panel con tag/título/features·unidas/
currentLabel/priceLabel + CTA), **AddOnPicker** (filas con oj-switch; el chain
`addonToggled` calcula el TOTAL cliente tras el toggle y despacha actionId +
{_item,_added,_total}), **StatusList** (filas con oj-avatar initials + estado coloreado
oj-text-color-*), **Ledger** (filas concepto/importe, included→includedLabel, negativos→
verde, total en subheading; moneda formateada de-DE como el renderer web), **PaymentPicker**
(métodos → botones, seleccionado callToAction, clic → methodActionId + {_method}; Confirmar
→ actionId + {_method: selected}), **Meter** (oj-progress-bar de JET core ojs/ojprogress +
label/valores/caption), **Stat** (label + valor en heading). Fixtures fo-island-step-last /
fo-island-checkout / fo-island-encasa; test 26 (26/26). Verificado e2e: wizard completo
(habitación con grid+upgrade, extras con switches), folio del check-out con total y métodos
de pago, balance/estancias de en-casa. Shots fo-checkin-step2/step3, fo-checkout-sel,
fo-encasa-sel.

## Isla ANIDADA + SSE — el documento del check-in FUNCIONA (2026-07-25)

El App-mediador DENTRO de la isla (DocumentoView, 3 estados) pinta y opera. Piezas y
gotchas (todas mordidas hoy):

- **Seed**: el nodo App anidado lleva `initialData` ({stayId, paxIndex, _embeddedMediator,
  _inline…}) — debe viajar como `componentState` en la CARGA y en CADA ACCIÓN (el server
  NO lo eca en sus respuestas; sin él las acciones responden la vista vacía en bucle).
  `collectIslands` lo captura; `runMateuNestedAction` lo fusiona (seed + state) siempre.
- **Flag sse**: las ACTIONS del componente (con `sse:true` — escanear) viajan SOLO en el
  WRAPPER del mediador (1ª request del baile de 2 pasos); el atajo consumedRoute+
  serverSideType se las salta → la anidada se carga SIN atajo y `loadRouteInto` estampa
  `sseActionIds` en el contexto.
- **Transporte SSE** (`runMateuActionSse`): POST `{base}/mateu/v3/sse/{route}` con Accept
  text/event-stream, MISMO body; respuesta = stream `data:<UIIncrement>\n\n` (= SSEService
  del renderer web). MVP: se lee entero y se reducen los increments en orden (sin diálogo
  de progreso en vivo). El LongTask del escaneo (~2s de Flux) llega así; el último
  increment trae el `dispatchEvent(documento-escaneado)`.
- **Eventos**: el chain acumula los events de TODAS las reducciones y dispara los triggers
  OnCustomEvent suscritos en anidada→isla→host (reloadDocumento responde un route-flip →
  `maybeFlip` recarga la ruta interna; la banda del wizard pasa a "documentación completa").
- **GOTCHA CSP definitivo (2 intentos fallidos)**: leer `$application.variables.X` como
  data de un oj-bind-for-each DENTRO de templates anidados NO re-liga los contextos
  internos ($current apunta al scope exterior; alias `as=` tampoco) — los datos deben
  fluir por `$current`: `mergeNestedContent` FUSIONA los átomos de la anidada dentro del
  bloque isNestedBlock de la isla madre, marcados `fromNested` (botones incluidos), y
  `dispatchIslandAction` enruta por ese flag a runMateuIslandAction/runMateuNestedAction.
- Los estados 2/3 del documento son `@Section(propertyList)` → átomo `isPropertyRow`
  (FormField con propertyRow=true, valor del state interpolado).
- OJO estado de la DEMO: el documento de María quedó escaneado por las sondas (in-memory);
  James/Klaus empiezan vírgenes tras reiniciar :8594.

Fixtures fo-nested-doc (sembrada) + test 27 (27/27). Shots fo-nested-doc*.png.

## Banda RDS del header (feedback 2026-07-26)

En fixed/fullWidth, Redwood pinta el header sobre una BANDA a sangre (blanca en claro,
negra en invertido) que además ASOMA por detrás del arranque del contenido — el header no
queda "encajonado" como la tarjeta. VB/oj-sp NO lo proporciona bajo este runtime (probado:
con el contenedor sin tope, el header ocupa todo el ancho pero su título queda a 48px — no
consume el pageLayout del shell para capar su interior). Composición propia con clases de
sistema: banda = div `oj-bg-neutral-30` + `oj-sm-padding-10x-bottom` (40px) a sangre — el
MISMO color que pinta el interior del header (`oj-sp-header-general-overview-bg-light` =
#F1EFED, rectificado 2026-07-26: con blanco quedaba una caja gris dentro de banda blanca), que
CONTIENE el header (título + franja) capado a la caja del contenido (mateuBandBoxMargin =
la fórmula horizontal del pageStyle); la tarjeta solapa la banda con margen top -40px
(inyectado en mateuPageMargin cuando showBand = pageHeader && pw !== edgeToEdge). La franja
queda al ancho de la TARJETA (está dentro del header capado) y la banda blanca asoma 40px
por los lados bajo ella = la anatomía de los pantallazos RDS del usuario. En edge-to-edge
(drawer nav) no hay banda: el header genérico se pinta inline como antes
(mateuPageHeaderInline). Shots rv-banda.png.

Sobre "consumir el pageLayout del shell" en vez de la fórmula propia: ya somos la MISMA
fuente — el shell recibe su page-layout de nuestra variable (mateuShellPageLayout, derivada
de pw), y banda/caja derivan del mismo pw. El consumo "de verdad" no es posible desde
markup plano de VB: los oj-sp lo consumen por el provide/inject de VComponents
(__oj_provided_contexts), interno a su árbol — y además está comprobado que bajo este
runtime ni siquiera lo usan para capar su interior. Una única fuente de verdad (pw en el
chain) + la fórmula RDS es el equivalente práctico.

## Reserva 360 — flujo de usuario replanteado (2026-07-26)

El detalle de una reserva es UNA pantalla (`/reserva/:id`, ReservaOverview) para los tres
estados, y las tareas se lanzan desde su toolbar (el patrón FA: overview del registro +
guided process como tarea):

- Contenido común: header del huésped (GuestHeaders por estado), Resumen (property list con
  el estado "Llega/Sale/Salió…"), huéspedes con su estado documental (StatusList).
- Por estado: llegada → avisos de qué falta (documentación / habitación) + toolbar
  "Iniciar check-in"; in house → Meter de balance + incidencias abiertas + toolbar
  Check-out/cargo/mensaje; salida → Notice "folio cerrado" + Ledger + "Ver folio".
- ToolbarSupplier (los @Toolbar estáticos no pueden variar por estado) + ActionHandler
  devolviendo URI (navegaciones) o Message.
- El listado navega SIEMPRE a /reserva/:id (fuera el enrutado por estado).
- **Wizard "solo lo que falta"**: CheckInWizard.stepApplies — identidad solo si
  paxPendientes>0; habitación solo si la asignada no está INSPECTED. María (todo listo) →
  wizard de 2 pasos (Extras→Confirmar); James (sin doc) → Identidad→Extras→Confirmar.
- hostContentOf filtra ahora el título de Page SIEMPRE (la banda del header ya lo pinta;
  antes solo en modo wizard).

Verificado e2e por estado + shots ro-*.png.

**Cerrado (mismo día)**: (1) el wizard VUELVE a la 360 al completar — el dispatcher de
@WizardCompletionAction devuelve el result del método si no es null, así que
confirmarCheckin retorna URI /reserva/:id (y la 360 ya muestra in house); (2) FIX DE CORE:
Wizard.component() avanza position al PRIMER paso aplicable (arrancaba siempre en 0 y
enseñaba el contenido de identidad aunque el rail dijera Extras→Confirmar; la navegación ya
saltaba, la posición inicial no) — 32 tests Wizard* del core en verde. PENDIENTE: plegar
/encasa y /checkout dentro de la 360 si se quiere.

## El header de pantalla ES el de la reserva (2026-07-26)

En la 360, el header genérico de banda ya no dice "Reserva": `entityHeaderOf(host)`
proyecta el EntityHeader del contenido al header de pantalla — pageTitle = el huésped,
pageSubtitle = subtitle + badges concatenados, facts (+métrica) → contextualInfo (con
`display-options.contextual-info-label=true`, que por defecto oculta las etiquetas) — y
hostContentOf lo filtra del contenido (dropEntityHeader; el del wizard/islas se conserva).
El header queda con la gramática completa del object header RDS: huésped + subtítulo +
BALANCE/PREAUTORIZADO/FIDELIDAD + acciones a la derecha.

## Acciones del toolbar en el HEADER de banda (2026-07-26)

El toolbar de la Page (ToolbarSupplier/@Toolbar) ya NO se pinta en el contenido: se
proyecta a las acciones del header genérico de banda — `pageToolbarOf(ctx)` lee
Page.metadata.toolbar; el botón buttonStyle=primary va a `primaryAction` y el resto a
`secondaryActions` del oj-sp-header-general-overview (mismo patrón que el header de
colección; spSecondaryAction resuelve por label vía headerSecondaryAction). El átomo del
toolbar en islandContentOf va marcado `fromPageToolbar` y hostContentOf lo filtra (las
ISLAS lo conservan: no tienen header). La 360 muestra así "Iniciar check-in" /
"Check-out"+"Mensaje huésped" / "Volver a la reserva" arriba a la derecha, como la
gramática RDS de los pantallazos.

## Banda también para el header de colección (smart search, 2026-07-26)

El listado no tenía la banda tras el header (el oj-sp-smart-filter-search ENTERO vivía
dentro de la caja capada). Misma anatomía que el header genérico: el componente se parte —
el header (título+búsqueda+acciones+franja) va en la BANDA a sangre capado a la caja
(flag mateuPageHeader.showListBand, pw != edgeToEdge; inline en edge) y la TABLA vive en la
tarjeta del contenedor (que solapa -40px). GOTCHA: el componente reserva su región de
contenido a ALTO DE VIEWPORT aunque el slot main esté vacío (min-height interno en cadena)
— app.css oculta su `.oj-sp-public-primary-content-container` interno en las copias
solo-header (#mateuListHeader/#mateuListHeaderInline). Solape 40, franja al ancho de caja,
9 filas visibles, búsqueda y clic de fila intactos.

## /encasa y /checkout PLEGADAS en la Reserva 360 (2026-07-26)

Las páginas EnCasaDetail/CheckOutDetail (y las tres queues muertas) se ELIMINAN: la 360 es
la única pantalla de reserva. El check-out es un MODO de la 360 (`modoCheckout`, @Hidden):
el toolbar Check-out lo activa (re-render en el sitio, sin navegación) y aparecen Desglose
folio (Ledger), Postear cargo (FormField fluido cargoBusqueda + @AutoSave buscarCargos +
resultados como StatusList con rowActionId seleccionarCargo) y Cobro (PaymentPicker →
confirmPayment cierra la estancia → DEPARTED + banner). "Volver a la reserva" desactiva el
modo. Los @Section del modo son frameless con value en blanco DISTINTO ("  ", "   "…) y sus
Callables devuelven VerticalLayout vacío fuera del modo (una sección titulada pintaría la
card vacía siempre). Renderer: átomo `isInput` (FormField fluido string/integer editable →
oj-input-text ligado por fieldId; hostInputChanged → draft + runMateuAction(buscarCargos),
el value-changed en blur/Enter hace de debounce) y filas de StatusList con `rowClickable`
(rowActionId sin actionLabel = la fila entera es una oj-action-card que despacha {_item} —
contrato del renderer web). El markup de StatusList se REGENERÓ por regex en las 6 copias
(el troceado incremental se volvió frágil — TODO: generar las plantillas de átomos desde
una fuente única).

## Wizard standalone: pie sticky vs barra de tabs + forward real (2026-07-26)

- El pie del guided process (Continue/Back) es `position: sticky; bottom: 0` — con la barra
  de tabs inferior (fija, 64px) quedaba TAPADO e inalcanzable. Regla auto-condicionada en
  app.css: `body:has(.oj-applayout-fixed-bottom) .oj-sp-guided-process-step-details-footer
  { bottom: 64px }` — solo actúa cuando la barra existe (los shells con drawer no se ven
  afectados).
- La acción FORWARD del wizard se elegía como "primera acción no-back" — en wizards ricos
  (check-in) la primera es selectPax y el Continue disparaba eso. Nueva proyección
  `wizardForwardOf(ctx)`: deriva el forward del PIE REAL del árbol (el bloque de botones
  que acompaña a 'back'), con fallback al criterio antiguo.
- Los pasos con bloques RICOS suprimen además el form genérico del paso
  (mateuFormFieldsList = []) — en Confirmar los campos huésped/habitación/estancia/régimen
  se colaban como inputs tras el botón, duplicando el header y el Resumen (property rows).

## GOTCHA VB: variables de proyección — ni null ni cambio de forma (2026-07-26)

Dos crashes silenciosos con el mismo patrón (rompían onMateuNavigate A MITAD: la URL no se
actualizaba al navegar por tabs y el clic de fila "no hacía nada" al volver al listado):

1. **"Cannot assign non-array to an array property"** — una variable `any` a la que una vez
   se asigna un ARRAY queda tipada como array por VB: asignarle null después REVIENTA la
   asignación (y el chain entero). Toda proyección de lista (mateuHostContent,
   mateuWizardContent) se declara `any[]` con default `[]` y NUNCA se asigna null (`|| []`);
   los bind-if condicionan por `.length` (CSP-safe: 0 es falsy).
2. **"Cannot read properties of null (reading 'title')"** — asignar null a una variable
   cuyo binding INTERIOR (`mateuPageHeader.title`) se reevalúa ANTES de que el bind-if
   exterior colapse. Las proyecciones de objeto se asignan SIEMPRE como objeto con flags
   precomputados (`mateuPageHeader = {title, showBand, showInline}`) y los bind-if leen los
   flags. (Ojo TDZ: los const de un chain se leen en orden — pwAfter se movió arriba.)

## Reservas v2: listado crud + páginas de detalle standalone (2026-07-26)

Replanteamiento del usuario: /reservas pasa de master-detail a un LISTADO simple (un crud)
que abre cada reserva como PÁGINA aparte según su estado. Piezas:

- **Backend**: `ReservasListing extends Listing<Filtros,Reserva>` — columnas
  id/huésped/habitación/noches/estado/tier; `handleAction("view")` (el clic de fila del
  renderer VB postea view con la fila como parameters) devuelve URI según estado →
  /checkin/:id | /encasa/:id | /checkout/:id. El Check-out del toolbar del 360 NAVEGA
  (URI) — fuera el bus. ReservasQueue eliminada.
- **Smart Search de vb (feedback)**: la búsqueda vive EN LA CABECERA — la propiedad
  `smartFilters` del oj-sp-smart-filter-search (NO tiene slot search: solo main/dashboard;
  el slot quedaba en oj-subtree-hidden). Contrato capturado en vivo: config
  {askHint, value:[]}; Enter añade {filter:'keyword', label, value} a value y dispara
  smartFiltersChanged (quitar el chip lo elimina) → chain concatena keywords → search.
- **Páginas de detalle standalone**: proyección `hostContentOf(host, islandRawBlocks,
  {forWizard})` — los bloques de islandContentOf al nivel de HOST, con la PRIMERA isla del
  host (documento) fusionada fromNested (despacha a runMateuIslandAction vía
  dispatchHostBlockAction; el resto contra el host). REGLA: los bloques MANDAN cuando son
  RICOS (EntityHeader/Meter/Ledger/StatusList/…) — el form genérico y el texto se suprimen
  (el 360 tiene también FormFields y pintaba campos crudos). En modo wizard los bloques van
  DENTRO del panel del guided process, filtrando título/ProgressSteps/back-next (los aporta
  el propio guided process). Listeners de host: hostBlockAction / hostPaymentConfirm /
  hostAddonToggled.
- **GOTCHA arquetipo**: `generalOverviewOf` casaba con CUALQUIER página con EntityHeader
  (el 360 se pintaba como overview con switcher) — ahora REQUIERE el switcher de registro.
- **SSE en islas**: runMateuIslandAction enruta por sseActionIds (el documento escanea
  también standalone); las cargas de isla del host van SIN atajo (baile de 2 pasos) para
  capturar el flag sse del wrapper.

Verificado e2e: listado → clic Carlos → /encasa/st-carlos (toolbar completo, Meter,
StatusList) → toolbar Check-out → /checkout/st-carlos (folio + métodos); clic María →
/checkin/st-maria (guided process standalone); búsqueda "sale hoy" → chip + 2 filas.
Shots rv-*.png.

## Reservas unificadas (evolution, 2026-07-26)

Los menús Check-In/Check-Out/En Casa se UNIFICAN en `/reservas` (ReservasQueue, evolution):
un buscador + un TaskQueue con TODAS las estancias y el ESTADO por línea — "Llega
hoy/mañana/<fecha>" (ARRIVING, ámbar si hoy), "Sale hoy/mañana/<fecha>" (IN_HOUSE, ámbar si
hoy / verde si no), "Salió <fecha>" (DEPARTED, neutro). El clic abre la isla según estado
(wizard de check-in / 360 de en casa / folio de check-out); `forzarCheckout` (opción de
línea o evento del toolbar) fuerza el folio para las in house. Piezas nuevas:

- **Framework**: `QueueItem` + `actionLabel`/`actionId` (opción de LÍNEA de la card; botón
  que despacha su actionId con {_item} — QueueItemDto + TaskQueueMapper + mateu-task-queue.ts
  con stopPropagation; los ports .NET/Python NO tocados aún). El renderer VB lo proyecta
  (hasAction/parameters) y pinta oj-button dentro de la oj-action-card — el clic del botón
  TAMBIÉN dispara el ojAction de la card: guarda temporal window.__mateuQueueRowActionAt
  (<800ms → eco, queueItemClicked lo ignora).
- **Toolbar de isla**: islandContentOf proyecta el Page de la isla (título +
  metadata.toolbar → átomo isButtons); el "Check-out" del 360 emite
  `UICommand.dispatchEvent("checkout-solicitado", {_item})` y el HOST (ReservasQueue
  @SubscribeTo) lo recibe: runMateuIslandAction procesa ahora los EVENTOS de bus →
  triggers del host → re-proyección completa con posible SUSTITUCIÓN de la isla (en casa →
  folio).
- Seeder: klaus llega mañana; nuevos noah (llega +3) y oliver (DEPARTED ayer, con folio).

Verificado e2e (5 flujos): llega→wizard, sale→360 (toolbar Check-out visible),
toolbar→folio, línea→folio, salió→folio. Shots rv-*.png.

## Backend conmutado a demo-front-office (2026-07-25)

**Variante de navegación (regla del proyecto, rectificada por el usuario)**: el renderer
OBEDECE la variante del wire — nada de overrides cliente. Para el patrón in-app navigation
(la barra de tabs ABAJO, oj-sp-in-app-navigation — omnipresente en apps Oracle) el APP debe
emitir TABS: en demo-front-office bastó QUITAR el `value = MENU_ON_TOP` explícito de `@App`
(quedó `@App(themeToggle = true)`) — la heurística AUTO da TABS porque su menú son
RouteLinks planos (`hasMenuItems` solo cuenta grupos `Menu`). Evidencia: shots/fo-tabs.png.


`constants.mateuBaseUrl` → `http://localhost:8595` = **demo-front-office-evolution**, la
COPIA de trabajo creada 2026-07-26 (decisión del usuario: el demo-front-office original
:8594 queda como instancia compartida intocable; la evolución del front-office se hace en
demo/demo-front-office-evolution, registrada en el agregador demo/pom.xml). Punto ÚNICO de
cambio en app-flow.json; demo-vb sigue en :9005 para volver. Primer contacto: la shell ARRANCA entera (menú MENU_ON_TOP con
Check-In/Check-Out/En Casa/Automatizaciones, selectores @AppContext Modo+Hotel, header de
página con franja, campo de búsqueda del check-in). GAP identificado en /checkin (tipos del
wire): TaskQueue (la cola de llegadas — el componente central del front-office) y EmptyState
no tienen proyección/rama aún; CustomField envuelve islas. Siguiente trabajo obvio:
proyección + rama TaskQueue (cards agrupadas con contadores, clic → acción con _item).

## Próximo paso al retomar
2. **Fases 1.x** (puertas de MECANISMO en runtime VB, antes de la Fase 2): 1.1 estado (variables +
   two-way round-trip), 1.2 aplicación de increments al target (re-render quirúrgico por id, islas), 1.3
   comandos UI → efectos, 1.4 resolución de ruta (4 campos de ruta salientes + composición), 1.5 sync con la
   URL (PushStateToHistory + deep-link + back/forward + dirtyGuard), y 1.6 (VISUAL) estilos alrededor del
   contenido = los tres modos de `pageWidth` (fixed/fullWidth/edgeToEdge) fieles a la medición RDS 24C.
3. Pendiente de capturar cuando toque: foldout/item-overview (F7+, añadir pantallas a demo-vb),
   un `PushStateToHistory` real (navegación de crud sin drawer) y el spike de SSE/LongTask en VB hosteado.

## Checklist de operaciones de check-in — fase 1 (2026-07-26)

La Reserva 360 en estado por-llegar muestra las OPERACIONES del check-in (documentos,
habitación, wifi, llave, firma, cobro, ancillaries) como checklist ejecutable, y el wizard
pide SOLO las pendientes.

- **Dominio (evolution)**: `CheckInOps` (flags wifi/llave/firma/cobro/extras, withers) +
  `CheckInOpsRepository` in-memory por stayId (accesor `FrontOffice.checkInOps()`).
  Documentos y habitación se DERIVAN (paxPendientes / housekeeping INSPECTED), no se
  almacenan. Escriben ambas pantallas: la 360 (acciones rápidas `opWifi`/`opLlave`) y el
  wizard (llaveGrabada/firmaCapturada/preautorizado persisten su flag; confirmarCheckin
  cierra `extras`) — así checklist y branching siempre coinciden.
- **360** (`ReservaOverview.paraLlegada`): banner `TaskProgress` ("Operaciones de check-in
  · N de 7", sin CTA — el header ya lleva "Confirmar check-in", renombrado desde "Iniciar")
  + `StatusList` con avatar-emoji por operación, descripción pendiente/hecha, chip
  Pendiente/✓ Hecha y botón de acción rápida solo en las pendientes que se resuelven in
  situ (wifi "Crear", llave "Grabar"); "Completar" en documentos abre el wizard. El wizard
  siembra el paso Confirmar desde las ops (llave→grabada, firma→firmada, cobro→
  preautorizado) y `stepApplies("extras")` mira `ops.extras()`.
- **Bridge**: átomo `isTaskProgress` en `islandContentOf` (todo precomputado: valueText
  "N de M", panelClass neutral→success al completar, botón oculto si completo — contrato
  del componente TaskProgress); añadido a la regla de bloques RICOS en los DOS chains
  (shell onMateuNavigate + runMateuAction). Markup: bloque nuevo en las 6 copias de átomos
  (insertado por script antes de cada `isMeter`, listener resuelto por copia: 4×
  hostBlockAction, 2× islandBlockAction) — oj-panel + oj-progress-bar, solo utilidades JET.
  Fixture real `fo-reserva-arriving.json` (capturado con transport.loadRouteInto contra
  :8595) + test 28. 28/28.
- **GOTCHA de serving**: `grunt vb-serve` sirve desde `build/optimized` (rutas versionadas
  `version_<ts>/...`) — los cambios de markup/bridge NO llegan hasta `npx grunt vb-build` +
  reinicio del serve. El síntoma es sutil: los átomos nuevos no pintan pero el resto
  funciona (los templates viejos siguen sirviendo). Verificar con
  `curl :9006/version_*/flows/main/pages/main-start-page.html | grep <átomo nuevo>`.
- Verificado en vivo (st-klaus, 4 pax): banner 1→2→3 de 7 con las acciones rápidas (toast
  wifi con credenciales, llave grabada), y "Confirmar check-in" abre el wizard con pasos
  Identidad/Extras/Confirmar — Habitación OMITIDA (ya inspeccionada). Shots:
  ops-checklist.png, ops-checklist-llave.png, ops-wizard.png.
- **Checklist a 3 columnas (2026-07-26, feedback del usuario)**: `StatusList` ganó
  `columns` (uidl record + StatusListDto + StatusListMapper + web mateu-status-list con
  grid auto-fit; 0 = lista clásica). En el bridge, `columns>1` proyecta `wrapClass:
  'oj-flex'` en el átomo y cada ítem como CELDA (`gridCell` + `cellClass: oj-flex-item
  oj-sm-12 oj-md-(12/N)`) con rama propia en el markup (título+chip / descripción / botón
  en vertical — una FILA estrechada a un tercio parte su contenido donde pilla y queda
  desaliñada); las 6 copias llevan la rama celda antes de la rama fila (guard
  `!gridCell`). La 360 usa `.columns(3)` → las 7 operaciones caben sin scroll. OJO orden
  de build de los shared: instalar via reactor (`mvn -pl shared/dtos,shared/uidl,
  shared/core` desde backend/) — uidl suelto contra un dtos rancio de ~/.m2 rompe
  enforcer/convergence.
- **Zonas en el contenido del host (2026-07-26, idea del usuario: "huéspedes a la
  izquierda, tarjetas a la derecha")**: la 360 usa `@Zones` (huespedes 36% / operativa
  64%; el header sin zona queda como banda superior). Proyección: `islandContentOf`
  detecta la FILA ZONADA (HorizontalLayout de columnas `flex: 1 1 calc(NN%…)`, solo a
  nivel raíz) y convierte cada zona en bloque-columna con `colClass` en doceavos
  (36→oj-md-4, 64→oj-md-8, oj-sm-12 en small); si una zona genera VARIOS bloques se
  fusionan en uno (un oj-flex no apila dos items en la misma celda — pasa en modo
  checkout: folio+cargos+cobro, todos frameless). `hostContentOf` estampa `blockClass`
  en todos (no zonados → oj-sm-12) y el loop de mateuHostContent envuelve los bloques en
  un `oj-flex` con un div por bloque ligado a blockClass (solo el loop del HOST — wizard
  e isla sin cambios). La checklist de operaciones pasa a `.columns(2)` (carril del 64%)
  y los huéspedes vuelven a lista de 1 columna en su card. Resultado: TODO visible sin
  scroll en llegada, in-house y checkout. Tests 28 (md-6) y 29 (zonas md-4/md-8). 29/29.
- **Fase 2 — modo habitación (2026-07-26)**: la tarjeta Habitación lleva "Cambiar"
  SIEMPRE (aun hecha — upgrades) → `modoHabitacion` pinta en el carril operativo el
  ResourceGrid de la planta 12 (helpers de HabitacionStep hechos public y reutilizados) +
  las OfferCard actual/upgrade; `elegirHabitacion`/{_item} asigna la habitación REAL
  (stay.assignRoom + tipo del inventario) y `upgrade360` asigna la suite 1401 (sembrada
  como habitación asignable); ambas vuelven a la checklist con toast, y el estado de la
  operación se re-deriva del housekeeping de la nueva habitación (cambiar a una sin
  inspeccionar la devuelve a Pendiente). Toolbar del modo: "Volver a la reserva". Sin
  cambios de renderer (ResourceGrid/OfferCard ya proyectaban en host).
- **Iconos de menú (2026-07-26)**: `Actionable.icon()` (default null) + campo `icon` en
  `RouteLink` (uidl) → `AppMenuDtoBuilder.icon(option.icon())` → `MenuOptionDto.icon` (ya
  existía en el wire). Convención: nombres NEUTRALES del set Vaadin ("vaadin:calendar-user");
  cada renderer traduce al suyo — el bridge con `ojIconOf` (diccionario OJ_ICONS →
  oj-ux-ico-* del gallery bundle del CDN, ~3.400 clases; pasa tal cual lo que ya venga como
  oj-ux-*, sin traducción → sin icono). `oj-sp-in-app-navigation` acepta `icon` por item y
  lo pinta. Demo: Reservas → calendar-contact, Automatizaciones → task.
- **Registro por pax en la 360 (2026-07-26, petición del usuario)**: cada huésped puede
  iniciar el ESCANEO del documento o el RELLENADO MANUAL desde la propia 360. La isla
  `DocumentoView` del wizard se embebe también en la 360 (banda bajo las dos zonas,
  sección "\u2007" frameless + @Inline; onHydrated la siembra con stayId+paxSeleccionado);
  las filas de huéspedes llevan ids numéricos de pax, fila clicable + botón "Registrar"
  (pendientes) → `seleccionarPax` re-siembra la isla, y el host se refresca con el evento
  `documento-escaneado` (@SubscribeTo → refrescarReserva), que ahora emite TAMBIÉN el save
  manual (override del case "save" en DocumentoView añadiendo el dispatchEvent al resultado
  del super). El estado vacío ofrece "Rellenar a mano" (Button → el "edit" estándar del
  EditableView); el editor pasa a documento/nombre EDITABLES y `save()` registra al pax
  completo (`Pax.register` + `Companion.rename`) o actualiza contacto si ya estaba.
  **Fixes de runtime VB que lo hicieron funcionar**: (1) recarga de la isla de nivel 1
  cuando su SEED cambia (mateuIslandSeed en app-flow + compare en runMateuAction /
  onMateuNavigate / runMateuIslandAction — el mecanismo que ya tenía la anidada);
  (2) el seed viaja en CADA acción de la isla y en el reload del route-flip (los null del
  estado no pisan el seed) — sin esto `edit`/`save` llegaban con stayId null y el save era
  un no-op silencioso; (3) los inputs fromNested van al draft de la ISLA y no relanzan el
  auto-save del host (hostInputChanged + listener con fromNested); (4) el toolbar de Page
  de la isla fusionada (Cancel/Save del editor) NO se filtra como toolbar del host
  (fromPageToolbar && !fromNested); (5) la re-proyección del host tras acciones de isla
  pasa las MISMAS opts que runMateuAction (title + dropEntityHeader) — sin ellas el título
  y el EntityHeader reaparecían duplicados en el contenido; (6) hoisting/merge de bloques
  preservan las props del bloque (colClass/blockClass sobreviven a la fusión).
- **Fase 3 — cobro, ancillaries y firma (2026-07-26)**: tres tarjetas más son ejecutables.
  "Cobrar" → modo cobro (PaymentPicker tarjeta/efectivo/Puntos-del-tier con TOTAL RESERVA;
  confirmar marca `ops.cobro` con toast por método). "Elegir" (ancillaries) → modo extras
  (AddOnPicker del catálogo con added desde stay.addOns; cada toggle persiste
  addAddOn/removeAddOn; "Cerrar selección" marca `ops.extras`). "Enviar a tablet" (firma) →
  PRIMERA ACCIÓN SSE DEL HOST: `ActionSupplier.actions()` en la 360 declara opFirma
  sse(true) (manteniendo el comodín "*"), el flux emite "enviado a tablet" y a los 5 s
  dispatchEvent(firma-capturada-360) → @SubscribeTo → opFirmaDone marca `ops.firma`.
  **Runtime VB**: `runMateuAction` ahora consulta `host.sseActionIds` (loadRouteInto ya los
  estampaba también en el host: el árbol raíz lleva las actions con su flag sse) y va por
  runMateuActionSse aplicando TODOS los increments con eventos/toasts ACUMULADOS (cada
  reduce reemplaza effects); los triggers de host reciben el detail del evento como
  parameters. GOTCHA cazado: `[] || x` — mateuWizardContent VACÍO es truthy y
  hostAddonToggled buscaba el picker en él (los toggles de la 360 no despachaban); elegir
  por longitud.
- **Acciones POR PAX en las filas de huéspedes (2026-07-26, feedback del usuario: "son
  acciones sobre cada pax… salen descolocados")**: `StatusItem` ganó una SEGUNDA acción
  (actionLabel2/actionId2, uidl+dto+mapper+web con dos botones). Cada pax pendiente lleva
  "Escanear" (→ `escanearPax`, SSE del host: toast "Escaneando…", 2 s, `Paxes.scan` y
  evento documento-escaneado → refresco) y "A mano" (→ modo pax en el carril operativo:
  formulario documento/nombre/email/teléfono ligado al draft del host + "Guardar cardex" →
  `Paxes.register`). La lógica por-pax vive en `ui/common/Paxes` (compartida conceptual
  con la isla del wizard, que QUEDA en el wizard — la 360 ya no embebe DocumentoView).
  **Bridge**: los ítems de StatusList proyectan `actions[]` (+hasActions) y una fila CON
  acciones se pinta APILADA (título+badge / descripción / botones) — la fila en línea se
  descolocaba en el carril del 36%; las tarjetas de grid iteran `actions` (permite dos
  botones por operación). Templates: rama apilada ×6 + for-each de acciones ×6.
- **Diálogo de progreso de LongTask + drawer con bloques display (2026-07-27)**: (1) el
  drawer de habitación recupera las CARDS (ResourceGrid + OfferCards): `overlayOf` proyecta
  `content` (islandContentOf sobre el árbol del Drawer) y el panel del drawer pinta los
  bloques con una copia del template de átomos (listener hostBlockAction — las acciones del
  drawer postean contra el host con el estado del overlay). (2) `escanearPax` y `opFirma`
  vuelven a `LongTask` (barra de progreso real) y el renderer VB al fin pinta el DIÁLOGO:
  `runMateuActionSse` STREAMEA (reader incremental + `extra.onIncrement` async; true =
  increment consumido, excluido del retorno), `longTaskWatcher()` (bridge) consume el Add
  del Dialog-con-ProgressBar y los state-only a su id devolviendo {open|progress, title,
  text, value, rest} — `rest` lleva los commands/messages del último increment (el
  dispatchEvent del refresco) SIN el fragment del diálogo; ambos chains SSE
  (runMateuAction + runMateuIslandAction) abren/actualizan/cierran `#mateuProgressDialog`
  (oj-dialog + oj-c-progress-bar) y reducen solo los rest → al cerrar, el evento refresca
  el foldout en sitio. Fixture `fo-sse-scan-stream.json` + test 30. 30/30.
- **GOTCHA JET**: `oj-progress-bar` (legado, import ojs/ojprogress del page json) NO se
  registra en runtime (mismatch de versión JET del CDN) — las barras de los Meter llevaban
  siempre invisibles; TODAS las barras migradas a `oj-c-progress-bar` (core pack, ya
  cargado). (2º gotcha del merge: `foldoutOf` perdió la proyección de `panel.width` al
  fusionar — los paneles del foldout se repartían a su aire y las tarjetas del cockpit se
  solapaban; restaurado width + headerTitle en la proyección.)
- **Acciones de huésped como ICONOS + reparto de anchos (2026-07-27, feedback del
  usuario)**: `StatusItem` gana `actionIcon/actionIcon2/actionIcon3` (uidl+dto+mapper+TS;
  nombres NEUTRALES del set Vaadin — la demo usa vaadin:barcode/pencil/ban/rotate-left);
  el bridge los traduce con `ojIconOf` (OJ_ICONS += scan-barcode/edit/do-not-enter/undo) y
  las acciones de fila con `iconClass` se pintan como `oj-button display="icons"
  chroming="borderless"` con el label como tooltip/aria (rama icono + rama texto en los 18
  sitios de botones de acciones). GOTCHA de merge nº3 cazado: el bridge había PERDIDO la
  tercera acción de fila (actionLabel3 — el "No show" llevaba desaparecido desde el merge);
  restaurada con los iconos. Anchos del foldout: Operaciones 46→50rem (celdas del cockpit
  20→22rem en app.css) y Perfil 17→14rem.
- **Fichas de huésped: h3 sin avatar + más aire (2026-07-27, feedback del usuario)**: la
  regla `asCards` del bridge (cualquier lista con acciones → tarjetas) PISABA la rama
  apilada del markup que ya pintaba el diseño pedido — nombre como h3 (nivel siguiente al
  h2 de la sección del foldout), sin avatar, ritmo .mateu-list-item. Ahora SOLO columns>1
  fuerza tarjetas; una lista de una columna con acciones va por la rama apilada.
  `.mateu-list-item` sube de 28 a 40px de separación entre pasajeros.
- **Operaciones como fichas h3 + contador en el título del panel (2026-07-27)**: las
  celdas del cockpit pierden el tile-avatar y el título pasa a h3 (misma ficha que los
  huéspedes); el "N de 7" deja el cuerpo y se COMPONE en el título del panel
  (`headerLabel` en foldoutOf = título · subtítulo, ligado en panel-title al CONTENIDO
  vivo indexado — refresca sin re-stampar; el bloque del subtítulo del cuerpo se elimina).
  GOTCHA de merge nº4: las clases de la rejilla fija (.mateu-grid/.mateu-grid-cell, celdas
  22rem con gap propio) tampoco las estampaba ya el bridge — restauradas en
  wrapClass/cellClass para columns>1.
- **Iconos en operaciones + headings de contenido (2026-07-27)**: las 6 operaciones llevan
  icono con tooltip (Op.actionIcon → StatusItem.actionIcon; vaadin:exchange/wifi/key/pen/
  credit-card/gift → OJ_ICONS exchange-h/connection/key/signature/bank-card/gift). Átomo
  HEADING nuevo: un Text con container h1..h6 se proyecta isHeading y se pinta como
  <h3 class="mateu-atom-heading oj-typography-subheading-xs"> (el escalón siguiente al h2
  de sección; app.css lo deja sin margen propio) con ritmo de grupo `oj-sm-margin-10x-top`
  cuando NO abre el bloque — Perfil pasa a h3 (Preferencias / Última estancia) con 40px
  entre grupos, y de regalo los títulos del modo checkout (Desglose folio, Postear cargo,
  Cobro) se vuelven headings de verdad.
- **Holgura anti-scrollbar + bullets a una línea (2026-07-27)**: el cockpit tenía 8px de
  holgura (2×22rem+40 = 744 sobre 752) — la scrollbar clásica de Windows/monitor externo
  (15px) hacía SALTAR la segunda columna al repintar (el "descoloque" al crear la wifi;
  invisible en headless/Mac con overlay scrollbars). Panel de operaciones 50→51rem = 24px
  de holgura. Y el tema Redwood pone `padding-right: 40px` a los `ul` (además del inline-
  start del navegador) — un cuarto del carril de Perfil; `.mateu-atom-bullets` lo anula y
  "Connecting rooms" vuelve a una línea (li 118→158px).
- **Habitación con número + confirmar GATED (2026-07-27)**: la tarjeta de la operación
  titula "Habitación 612" (el número importa; la descripción pasa a tipo + estado de
  inspección) y "Confirmar check-in" solo se habilita con TODO hecho (los 7 ops — cardex
  de todos los pax con no-shows aparte + operaciones): `toolbar()` calcula
  `operaciones(stay).allMatch(done)` → `Button.disabled` → `pageToolbarOf` lo proyecta y
  los chains lo traducen a la API del oj-sp-header: el primaryAction se deshabilita con
  `display: 'disabled'` (NO con un boolean `disabled` — ese se ignora). Verificado en
  ambos sentidos (foto limpia → disabled; 7 de 7 por wire → enabled).
- **Modal post-check-in de grupo (2026-07-27)**: al confirmar el check-in de una reserva
  DE GRUPO (simulación: grupo = primera palabra de la agencia — "TUI Deutschland" y "TUI
  Group · …" comparten grupo TUI), la acción devuelve un `Dialog` (uidl) proponiendo
  seguir con la siguiente llegada pendiente del grupo o volver al listado; sin grupo o sin
  más llegadas → `UICommand.navigateTo("/reservas")` directo (OJO: una `URI` DENTRO de una
  List NO se mapea — solo a pelo; en colecciones usar el UICommand). **Renderer**: un
  overlay `Dialog` se pinta como MODAL (`#mateuModal`, oj-dialog estándar: título + líneas
  de texto + las acciones del Dialog en el footer) y no como drawer — `overlayOf` gana
  `isDialog` + `texts` (collectTexts) y `actionsOf` propaga `parameters` (el botón
  "Check-in de X" viaja con `_item`); runMateuAction enruta overlays isDialog al modal
  (open/close por método, cierre también al navegar) y `mateuModalDismissed` descarta el
  overlay solo si el TOP sigue siendo Dialog. GOTCHA VB: un `oj-bind-for-each` sobre una
  propiedad AUSENTE del default ROMPE la página entera ("Unable to process binding") —
  `texts: []` añadido a TODOS los defaults de mateuDrawer. GOTCHA build: `grunt vb-build`
  ahora ABORTA al final en una subtarea de red (--url) — el build/optimized queda BIEN
  generado; no fiarse del exit code, verificar el artefacto.
- **Pantalla in-house (2026-07-27)**: el foldout se extiende a IN_HOUSE (fuera del modo
  checkout, que conserva las dos columnas planas): Huéspedes | **Estancia** | Perfil. El
  panel Estancia titula con el balance VIVO ("Estancia · € 1.710,50 · 95% preaut.",
  balanceResumen → subtitle → headerLabel) y compone el Meter del balance + el cockpit de
  fichas: **Folio** (badge OK/Vigilar/Al límite según % de preauth; "Postear cargo" abre
  el drawer del catálogo — filas clicables → `postearCargo` postea y CIERRA con
  `UICommand.closeModal()`), **una ficha por incidencia** abierta ("Resolver" →
  `stay.resolveIncident`; sin abiertas → ficha "✓ OK") y **Salida** ("Late check-out"
  +€50 al folio — el propio cargo hace de flag; contratado → badge 15:00). Iconos
  cart/check/clock añadidos a OJ_ICONS. Todo verificado en vivo con Carlos: postear desde
  el drawer (1.710,50 → 1.735,50), resolver la incidencia de TV, late check-out
  (→ 1.785,50 · 99% y "Al límite"), con el header del panel y los facts refrescando.
- **In-house v2: General Overview (2026-07-27, diseño del usuario)**: fuera el foldout en
  casa — anatomía RDS de overview: contenido principal (KPI del balance tal cual +
  incidencias como CARDS a todo el ancho: Notice danger/warning con el botón Resolver
  DENTRO — parameters en los Buttons del content del Notice) e info secundaria al lado
  (huéspedes SOLO datos, sin badges/acciones, y la salida: fecha · 12:00/15:00 · noches ·
  régimen). Las CINCO acciones van al toolbar del header (Añadir cargo / Cambiar
  habitación / Gestionar folio / Mensaje huésped / Registrar petición) + Check-out
  primary — el Spectra header colapsa las secundarias en el menú "…". Drawers nuevos:
  Gestionar folio (Ledger) y Registrar petición (peticiones clicables; late-checkout
  postea +€50 y cierra con closeModal; el resto toast). GOTCHA Spectra: el evento
  spSecondaryAction identifica el item por su id/value — sin id llegaba
  secondaryItem="undefined"; las secundarias llevan id=value=actionId y
  headerSecondaryAction resuelve por actionId O label.
- **Pulido del overview in-house (2026-07-27)**: heading h3 "Incidencias" (su margen de
  grupo pone los 40px entre el KPI y la lista); se listan TODAS las incidencias — abiertas
  primero (cards danger/warning con Resolver), y las RESUELTAS al final como avisos verdes
  slim "✓ Resuelta · <título>"; sin abiertas → "Sin incidencias abiertas — N resueltas".
  La info secundaria va sobre BANDA NEUTRA (VerticalLayout de zona con
  cssClasses("oj-panel oj-bg-neutral-20") + align-self flex-start): la proyección de zonas
  del bridge arrastra las cssClasses del wire de la columna al bloque.
- **Incidencias con cronología (2026-07-27, diseño del usuario)**: TODAS con la misma
  ficha (título + badge Abierta/En curso/✓ Resuelta a la derecha; resueltas al FINAL) y
  debajo su cronología "d MMM · HH:mm — comentario" abriendo con la descripción de
  apertura. Dominio: `Incident` gana `openedAt/resolvedAt` (schema stay_incident +
  seeder con fechas; `resolve()` estampa la resolución); la línea "en curso" se deriva.
  Framework: `StatusItem.lines` (uidl+dto+mapper+TS) — la rama APILADA del renderer
  acepta también filas SIN acciones cuando llevan lines (guards hasActions||hasLines) y
  pinta la cronología entre descripción y botones. Resolver como icono ✓ solo en
  abiertas.
- **In-house v3: foldout de 2 folds + tipos de incidencia + alta (2026-07-27, insight del
  usuario: "el general overview ES un folded layout de solo 2 folds")**: la in-house
  vuelve al FoldoutLayout — overview "Información" (huéspedes + salida) y panel
  "Estancia · balance" (KPI + incidencias) — con títulos subrayados y colores del propio
  foldout, y consistente con la pantalla de llegada. "Incidencias (N)" con contador;
  títulos de incidencia como h4 (nuevo `StatusList.itemHeadingLevel` uidl→dto→wire; el
  bridge marca isH4 y el template pinta h3|h4 — cascada h2 panel → h3 grupo → h4 ítem);
  el TIPO bajo el título (nuevo `IncidentType` TV/Climatización/Servicio/Restaurante/
  Limpieza/General con icono, columna en schema + seeder). Alta: acción "Nueva
  incidencia" en el header → drawer con Título/Comentario (campos del drawer) + el tipo
  como filas clicables → `crearIncidencia` lee el estado del drawer y reportIncident.
  GOTCHA drawer: los FormFields del contenido salían DUPLICADOS (gramática de campos +
  átomos isInput de los bloques) y el usuario escribía en el par muerto — overlayOf
  filtra los isInput de los bloques.
- **In-house v4: el template NATIVO oj-sp-general-overview-page (2026-07-27, aportado por
  el usuario desde un scaffold de VB Studio)**: Spectra SÍ trae el template completo —
  `oj-sp/general-overview-page/loader` (no aparece en los bundles: su component.json y su
  view van INLINE en el loader; el nombre correcto lleva el sufijo -page). API: props del
  header (pageTitle/pageSubtitle/contextualInfo/primaryAction/secondaryActions/badge/
  timestamp/selectContext...), slots `main` + `info` (+search/announcement) — el main con
  fondo neutral-10 y el info como complementario neutral-20 a toda altura (los "colores
  como el foldout" que señaló el usuario) — y los MISMOS eventos sp* que el header suelto.
  **Regla del renderer**: página de entidad (hostEntity) cuyo cuerpo son EXACTAMENTE dos
  bloques-columna → `mateuGop {on, main, info}` y se monta el template (header integrado;
  la banda genérica y el loop de host se suprimen); los bloques van a ancho completo
  dentro de su slot (el ancho del info lo pone el template). El backend in-house volvió a
  dos zonas con el MAIN primero (KPI + incidencias) e info después (huéspedes + salida) —
  el orden de folds que corregía el usuario.
- **Títulos de fold en el general overview (2026-07-27)**: cada slot del
  oj-sp-general-overview-page titula con el estilo del foldout — el backend abre cada
  zona con un Text container=h2 ("Estancia · balance" / "Información"), el bridge lo
  marca `isH2` y el gop lo ASCIENDE a título de slot (gopFold: title + items sin el
  heading), pintado como h2 heading-sm + subrayado. El subrayado original
  (.oj-sp-foldout-panel-title-underline, 36×4 con --oj-sp-theme-accent) está SCOPED a
  oj-sp-foldout-panel — `.mateu-fold-title-underline` en app.css replica el trazo con el
  MISMO token del tema.
- **Ancho por estado en la 360 (2026-07-27)**: fuera el @PageWidth(EDGE_TO_EDGE) estático
  — `PageWidthSupplier.pageWidth()` decide por estado: la LLEGADA (foldout) sigue a
  sangre y la estancia/salida van en FIXED (caja de 1408px con la fórmula RDS y el lienzo
  alrededor). El wrapper de contenido del shell ya aplicaba maxWidth/margin/padding del
  pageStyleOf, así que bastó el supplier del backend.
- **Mensaje al huésped en drawer + textarea (2026-07-27)**: "Mensaje huésped" abre un
  drawer ("Mensaje a <nombre>") con TEXTO LIBRE y Enviar → toast con el mensaje +
  closeModal. La gramática de campos del drawer aprendió `textarea`:
  dynFormMetadataOf/fieldListOf llevan el stereotype y el panel pinta `oj-text-area`
  (rows 4) para FormFields con FieldStereotype.textarea.
- **Dedup de botones en drawers (2026-07-27)**: los Buttons del CONTENIDO de un drawer
  salían dos veces — como átomo isButtons en su sitio (con sus parameters) Y en la fila de
  acciones del pie (actionsOf recoge todos los Buttons del árbol). `overlayOf` filtra del
  pie los actionIds que ya se pintan en los bloques del contenido (mismo patrón que el
  filtro de isInput duplicados).
- **Barra de acciones del drawer anclada abajo (2026-07-27)**: pauta Redwood — las
  acciones del drawer van en una barra al PIE con divisor. Un Button del contenido SIN
  parameters se mueve al pie (Enviar); los que llevan parameters (listas de opciones) se
  quedan en su sitio y no se duplican. El wrapper del drawer pasa a flex column
  min-height:100vh y la barra usa margin-top:auto + oj-divider-top — OJO: las utilidades
  de espaciado JET llevan !important (oj-sm-margin-6x-top pisaba el margin-top:auto;
  padding-top inline en su lugar). La barra solo se pinta si hay acciones (bind-if).
- **Check-out y salida sobre el template General Overview (2026-07-27)**: la rama plana
  de `cuerpo` en ReservaOverview (modo check-out y DEPARTED) pasa a la MISMA anatomía
  gop que la estancia en casa — zona ANCHA primero con su Text h2 de fold ("Check-out ·
  balance" / "Estancia · salió el X") + folio/cargos/cobro, y la info clave ("Información":
  `claveCheckout` = salida + huéspedes en check-out, huespedesRail en DEPARTED) como zona
  estrecha complementaria. "Volver a la reserva" viaja como secondary del header gop.
  **Intento item-overview REVERTIDO el mismo día**: se llegó a montar
  `oj-sp-item-overview-page` + `oj-sp-item-overview` (detección por anatomía: zona
  estrecha primero → iop, ancha primero → gop; EntityHeader → panel con badge/facts;
  "Volver…" → flecha goToParent; formato edge-to-edge porque el template pone sus
  fondos) — funcionaba a nivel de DOM pero el pintado no convencía (la columna del panel
  no pinta fondo propio en displayMode 'light': el blanco es solo la tarjeta del
  componente, y el conjunto quedaba descolgado sobre el lienzo), así que volvimos al gop
  que ya domina el renderer. QUEDA en el bridge `itemOverviewPageOf` (+ badges/
  subtitlePlain en entityHeaderOf) con su test de contrato (#31) por si se reintenta;
  los loaders de item-overview siguen listados en el bundle del app-flow (inertes).
  Hallazgos para el reintento: component.json del iop-page va inline en su loader; el
  del oj-sp-item-overview va como `_metadata` del VComponent (props itemTitle/
  itemSubtitle/badge/secondaryActions, slots body/footer); translations.go-to-parent
  pone el label de la flecha; getInitialMode → displayMode 'light' con tema Redwood.
  **Fix que SOBREVIVE al revert**: runMateuAction NO recalculaba mateuPageMargin/
  Padding/MaxWidth tras una acción — el -40px de solape de banda del estado anterior se
  arrastraba a la pantalla siguiente (lo delataron los sticky internos del iop); la
  cadena de acción ahora recalcula márgenes con la misma lógica que onMateuNavigate.
- **Salida (DEPARTED): info simple + incidencias (2026-07-28)**: en la zona Información
  del gop, `infoSalida(stay)` sustituye al rail de check-in — lista SIMPLE de huéspedes
  (nombre + doc, sin acciones ni badges de cardex) y "Incidencias (N)" con StatusList de
  badges (✓ Resuelta / Sin resolver) o Notice success si no hubo. Seeder: st-oliver lleva
  una incidencia RESOLVED para la demo.
- **Buscar-al-teclear (@AutoSave) en el posteo de cargos (2026-07-28)**: el renderer VB
  honra el trigger AutoSave del host — `autoSaveOf(ctx)` (bridge) + `on-raw-value-changed`
  en los inputs del host (15 copias) → cadena `hostInputTyped` (borrador + debounce por
  token a nivel de módulo + `Actions.callChain(runMateuAction)` + FOCO restaurado al
  input recreado con el cursor al final, tick 250ms). BUG DE FRAMEWORK arreglado en
  `TriggerMapper.createTriggers`: implementar TriggersSupplier hacía return temprano
  SUPRIMIENDO los @Trigger/@SubscribeTo/@AutoSave de la clase, y un AutoSaveTrigger del
  supplier caía al `default` del switch convirtiéndose en un OnLoad vacío — ahora los
  triggers del supplier se SUMAN a los de las anotaciones y el case AutoSaveTrigger
  existe. (El @AutoSave de clase ya viajaba bien por el camino de anotaciones.)
- **Selector rápido del listado por ENUM (2026-07-28)**: un filtro enum en Filters
  (ReservasListing.Vista: Llegadas hoy / Salidas hoy / In house, labels vía @Label) viaja
  como FormField select con options en la metadata (a veces del MEDIATOR, no del nodo
  Crud — quickFiltersOf busca en todo el árbol) → `listingOf.quickFilters` → chips
  `oj-sp-filter-chip` bajo el smart search (applied/nonApplied como DOS oj-bind-if — sin
  ternarios CSP); cadena `listingQuickFilter` togglea `mateuQuickFilter` {fieldId,value}
  y re-busca con `mateuLastSearchText`; `runMateuSearch` mergea el filtro activo en el
  componentState; reset al navegar. OJO: los params del listener via CONTEXTO de binding
  (`$current.data.value`) — `$event.target.dataset` apunta al hijo interno del chip.
- **Seed de reservas demo (2026-07-28)**: framework — PageListingBuilder emite botones de
  toolbar por los métodos `@ListToolbarButton` de un Listing declarativo (label de
  @Label); en VB el primero es la primaryAction del smart search. `seedDemo` crea 10
  reservas (4 llegadas hoy, 1 mañana, 3 en casa, 2 salidas; ids demo-<stamp>-i) y
  responde Message + dispatchEvent("reservas-seeded") → el listado se refresca por su
  @Trigger(OnCustomEvent) (bus estándar). La DB es in-memory: un restart re-seedea.
- **Banda blanca sobre el foldout (2026-07-28, fix del usuario)**: el foldout-layout
  monta un oj-sp-header-navigation PROPIO vacío (16px, bg-neutral-0) →
  `.oj-sp-foldout-layout-header-horizontal { display: none }` en app.css.
- **Welcome page como HOME (2026-07-28)**: `Bienvenida extends Welcome` en /bienvenida +
  `@HomeRoute("/bienvenida")` en el app → AppDto.homeRoute → `shellNavOf.homeRoute` → el
  boot de la shell la PREFIERE sobre la primera opción del menú (deep-link sigue mandando).
  Tiles = 3 `MetricCard` @Panel(title="") con contadores VIVOS (instancia por request) →
  `welcomeOf` extrae el MetricCard del panel (isKpi/kpiTitle/kpiValue/kpiCaption) y el
  tile pinta el KPI (valor heading-lg + caption). El menú TABS se OCULTA en la home
  (bind-if selectedRoute !== homeRoute) y el icono casa del oj-sp-global-header navega a
  la home (evento ojSpHomeClick → onMateuNavigate).
- **@AppContext en drawer lateral (2026-07-28)**: los oj-select-one directos no casaban
  con el header oscuro → un icono (oj-ux-ico-settings, borderless) abre un
  oj-drawer-popup edge=end ("Contexto de trabajo") con los selectores en estilo estándar
  (mismo listener contextChanged); toggleMateuContextDrawer flip de página. El botón del
  icono lleva `oj-color-invert` (utilidad JET) para la iconografía CLARA sobre el header
  oscuro — mismo blanco que el icono home del propio global-header. El intento
  CSS previo (variables --oj-text-field-* del tema) queda documentado: funcionaba para
  bg/placeholder pero el usuario prefirió el drawer.
- **Modal de decisión: botones con parameters al pie (2026-07-28)**: el modal del
  check-in de GRUPO solo ofrecía "Volver al listado" — "Check-in de <nombre>" lleva
  parameters (_item) y la regla del pie de los drawers (los botones con parameters se
  quedan en el contenido: listas de opciones) lo dejaba en un contenido que el modal no
  pinta. En `overlayOf`, si el overlay es un DIALOG todos los botones pasan al pie CON
  sus parameters (el listener mateuActionClicked ya los despacha). Test #32.
- **Ask Oracle en el FAB del shell (2026-07-28)**: el FAB rojo es el CHAT del propio
  oj-sp-simple-ui-shell (prop `chat`, evento `ojSpChatAction`) → abre la paleta
  #mateuAskOracle (oj-dialog: oj-input-search con foco + filas oj-action-card con
  icono/kind). Destinos: Inicio + navegación del app (mateuNavItems, con sus iconos) +
  las VISTAS RÁPIDAS del listado (Llegadas hoy / Salidas hoy / In house). El tecleo
  re-filtra en vivo (askOracleTyped reutiliza buildResults expuesto como estático de
  askOracleOpen — los chains AMD pueden requerirse entre sí con './'). Una vista rápida
  deja `mateuQuickFilter` + `mateuQuickFilterPending`: onMateuNavigate lo APLICA en la
  búsqueda OnLoad (aterriza filtrado y con el chip aplicado) en vez de resetearlo, y
  consume el flag. Verificado: FAB → paleta → "lleg" → 1 fila → clic → listado solo
  "Llega hoy".
- **Chips del selector rápido: actionable + spLabelAction (2026-07-28)**: los chips NO
  activaban la vista — `oj-sp-filter-chip` no es clicable sin `actionable="true"`, y el
  clic sobre la ETIQUETA emite `spLabelAction` (no `spAction`) → ambos eventos van al
  mismo listener. OJO verificación: tras un seed, la página 0 ordenada (ARRIVING primero)
  puede ser TODO llegadas — un "filtro funciona" con Llegadas hoy era falso positivo;
  probar con "Salidas hoy" (mezcla estados sí o sí).
- **Hero de la welcome: pares color+ilustración del spec RDS, rotando (2026-07-28)**:
  el Figma "Welcome Banner - Illustration" define 8 PARES color↔ilustración (Purple
  #856B94→Journey FINAL_7, Orange #AA643A→8 y 1, Lilac #6C7495→4, Teal #517F7E→5,
  Blue #427E96→6, Green #4D835C→2, Pink #A46573→3). En oj-sp-header-welcome-banner:
  `background-color` (enum dark-*) + `illustration-foreground` (URL) + themed-image
  "none" — OJO: con themed-image="pebbles" el componente IGNORA backgroundColor (fondo
  emparejado fijo), y las props solo aplican AL MONTAR (bindings, no post-mount). Las
  cadenas rotan el par en cada visita a la welcome (Math.random en chain JS, permitido);
  los KPI de la home navegan con `?vista=` (ver abajo). PENDIENTE DE ASSETS: exportar
  del Figma los 8 "Journey Headers Abstract FINAL_N" (PNG transparente) a
  webApps/vbredwoodapp/resources/images/journey-N.png — hasta entonces el hero pinta el
  color sin ilustración (el 404 del background-image es silencioso). RESUELTO con los
  assets OFICIALES que aportó el usuario: la galería fnd
  (https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/) trae 5 parejas
  illust-welcome-banner-bg/fg-01..05.png (capa fondo + capa figura, transparentes) —
  las cadenas rotan [tono, pareja]: dark-ocean+01, dark-pine+02, dark-plum+03,
  dark-sienna+04, dark-teal+05 (illustration-background + illustration-foreground +
  background-color). Verificado: pine+grúa, sienna+figuras. Los "Journey Headers" del
  Figma quedan como alternativa si algún día se exportan.
- **KPIs de la home navegan con la vista aplicada + deep-link filtrado (2026-07-28)**:
  cada MetricCard lleva actionId (verLlegadasHoy/verEnCasa/verSalidasHoy) y su @Action
  devuelve URI "/reservas?vista=X" — el tile KPI es un oj-action-card (welcomeKpiClicked
  → runMateuAction). GENÉRICO en onMateuNavigate: una ruta con `?campo=valor` se
  consume como filtro rápido PENDIENTE (misma mecánica que el Ask Oracle) y fuerza la
  recarga aunque la ruta no cambie — cualquier NavigateTo/URI del server puede aterrizar
  un listado ya filtrado. welcomeOf lleva kpiActionId; chips con aire (margin-6x-bottom
  hacia la tabla).
- **Automatizaciones como listado con acciones de FILA (2026-07-28)**: el board no
  renderizaba en VB → `AutomatizacionesListing` en /automatizaciones (el board queda en
  /automatizaciones-board): smart search + chips por el enum Estado (el selector rápido
  YA es genérico) + una fila por proceso; la acción "Solucionar" viaja como campo de
  fila `ColumnActionGroup` (mecanismo Mateu: columna dataType=actionGroup en el wire,
  cada fila lleva acciones.actions[{methodNameInCrud,label}]) — solo en filas con
  warnings/errores. Renderer: listingOf marca la columna actionGroup → template
  `cellRowActions` del oj-table (data-oj-as="cell" para conservar el contexto de FILA
  dentro del for-each de acciones); cadena listingRowAction → runMateuAction
  `action-on-row-<método>` con parameters {id} → Listing.handleActionOnRow invoca el
  método; el refresco llega por el bus (dispatchEvent "automatizacion-arreglada" +
  @Trigger OnCustomEvent → search). Verificado: 6 Solucionar → clic → toast + 5.
- **Renderer VAADIN contra el front-office (2026-07-28)**: tres fixes al probar :5174.
  (1) `lit-vaadin-helpers@0.3.1` (dependencia MUERTA de libs/mateu, sin un solo import)
  anclaba lit 2.8 → su `@lit/reactive-element@1.6.3` quedaba IZADO a la raíz del
  monorepo y el `dedupe` de vite se lo servía a todo el árbol mezclado con lit 3.3.3 —
  síntomas: recursión infinita `__isItemSelectable` en vaadin-grid (el accessor de Lit
  guarda en `__<nombre>` y cae al método privado del mixin), "component loaded twice",
  y el tab del menú sin marcar. Eliminada la dependencia → árbol convergido en lit 3 +
  RE 2.1.2 y los tres síntomas fuera. (2) FRAMEWORK: un Listing declarativo que
  soporta la acción "view" es NAVEGABLE — PageListingBuilder marca la primera columna
  con actionId="view" (la misma señal que ListRouteResolver.withViewOnFirstColumn en el
  camino AutoCrud; Selectors excluidos) → la celda-id se pinta como enlace en el
  renderer compartido. (3) FRAMEWORK: ListingBackend.actions() ANUNCIA "view" cuando
  supportsAction("view") — sin anunciarla, mateu-component descarta el action-requested
  del clic (regla conocida del renderer compartido) y el enlace no hacía nada.
  Verificado: /reservas en :5174 pinta filas + chips + seed, el clic en el id navega a
  /reserva/st-sophie y el 360 completo rinde en Vaadin; el VB no se resiente.
- **Automatizaciones en el renderer VAADIN (2026-07-28)**: el listado rinde de serie —
  badges de @Status y menú "···" por fila (renderMenuCell del actionGroup; las filas sin
  acciones no lo muestran). DOS matices: (1) el renderer compartido envía la fila como
  `parameters._clickedRow` (contrato canónico) mientras el VB envía `{id}` — la acción
  de fila del demo acepta AMBOS (helper rowId); verificado: Solucionar → credit pasa a
  Ok y el listado refresca por el bus. (2) El "tab desaparecido" de Automatizaciones NO
  es un bug: la opción lleva @Audience("Staff") — con el contexto Modo=Cliente (que
  persiste en localStorage `mateu-app-context`) se oculta por diseño; con Modo sin fijar
  o Staff, aparece. A 1500px el listado cae a modo cards, donde estado y acciones no se
  proyectan (limitación conocida del modo cards del renderer compartido).
- **SSE + cards en el renderer compartido (2026-07-28)**: dos fixes en libs/mateu.
  (1) El escaneo (LongTask SSE) abría el modal pero ni progresaba ni cerraba: en
  mateu-component el lookup de la acción usaba `find(exacta || comodín)` y el comodín
  `'*'` (sse:false) va ANTES que `escanearPax(sse:true)` en la lista → la acción salía
  por el sync normal y solo llegaba el primer increment. El match EXACTO ahora gana al
  comodín (un flag sse/background/confirmation declarado no puede quedar tapado por un
  catch-all). Verificado: /sse en red, progreso, cierre y rail refrescado a Cardex OK.
  (2) El modo CARDS recortaba las columnas a las 6 primeras y estado (@Status, 7ª) y
  acciones (ColumnActionGroup, 8ª) desaparecían — los badges de estado y las acciones
  de fila SIEMPRE entran en la card (formatListValue y renderCardActionButtons ya
  sabían pintarlos). Verificado en /automatizaciones a 1400px: badge + Solucionar
  operativos desde la card. NOTA: la primera columna de Automatizaciones ya NO sale
  como link — el gate supportsAction("view") lo dejó correcto tras el último restart.
- Pendiente: "Total extras" del AddOnPicker no se ve en las copias del host (cosmético). Fase 3: cobro (PaymentPicker), ancillaries (AddOnPicker) y firma vía SSE desde la
  360 (el SSE de host en los chains solo existe para islas — hoy esas ops se hacen en el
  wizard).

## Batch final del renderer Vaadin (2026-07-28)

- **Toolbar de listados al header de PÁGINA**: el usuario pidió título + toolbar en la
  MISMA línea sin meter el título en el crud (feedback explícito; el intento inverso se
  revirtió). `PageListingBuilder.getToolbarButtons(instance)` extraído público
  (@ListToolbarButton + Import/History/Export) y `ReflectionPageMapper` lo concatena al
  Page toolbar para ListingBackend/ReactiveListingBackend (cast a
  `io.mateu.uidl.fluent.UserTrigger` — ¡UserTrigger vive en uidl.fluent, no en
  .interfaces!). El crud SUPRIME su copia cuando un ancestro MATEU-PAGE lleva toolbar
  (`pageShowsToolbar` en mateu-table-crud cruza shadow roots hacia arriba). VB no se
  resiente: sigue leyendo listing.toolbar del crud metadata.
- **Los @ListToolbarButton se ANUNCIAN en `ListingBackend.actions()`** (uidl): el botón
  del Page header despacha el nombre del método a pelo y mateu-component descarta
  acciones no anunciadas — el seed "+ 10 reservas demo" no hacía nada en Vaadin (en VB
  funcionaba porque su renderer no consulta la lista). Ahora actions() recorre
  getClass().getMethods() y añade cada método anotado (con sus flags confirmation/
  rowsSelected). Verificado: 19 → 29 items y re-búsqueda vía el trigger
  "reservas-seeded". OJO: getAnnotation directo — anotaciones compuestas (semantic) no
  se resuelven aquí (uidl no ve MetaAnnotations de core).
- **goHome por URL**: el homeRoute del wire es RELATIVO a la petición (iba a /reservas)
  → `pushState('/') + PopStateEvent` en mateu-app.
- **Pestañas del menú vivas**: `isActiveOption(option)` con selectedRoute (el flag
  `selected` del wire es del momento de construcción).
- **Cards apiladas (mateu-status-list modo stacked)**: título+chip en una línea (chip a
  la derecha con margin-left:auto), descripción debajo, acciones como icon-buttons
  (title=label); grid de operaciones con column-gap 2.5rem/row-gap 1rem; huéspedes
  (stack 1-col) capadas a `max-width: 22rem` = mismo ancho de card que las celdas del
  grid de operaciones (pedían igualarse). itemHeadingLevel 3/4 (Perfil → h4 en
  Preferencias/Última estancia).
- **Foldout Vaadin al 100%** con reparto proporcional: `flex: <peso> 1 <width>` por
  sección (peso = parseFloat del width declarado); el contenedor necesitaba
  `expand-fields` en vaadin-form-layout — con `??` no funcionaba porque expandFields
  llega `false` primitivo → `||`.
- **Drawers persistentes**: Add con id de overlay existente refresca in situ;
  Replace in-place por serverSideType preserva overlays (los ids son uuids frescos por
  render). Ancillaries/cambio de método de pago ya no cierran el drawer.
- **Alias de iconos Vaadin** (renderIcon): wifi→connect, pen→pencil, automation→cogs.
- **KPIs sin doble marco** (dashboardRenderer: panel con único MetricCard → el metric
  solo) y "N de 7" unido al título de sección (mateu-vaadin-foldout: `· subtitle` en el
  h3).

## Sesión 2026-07-28 (dogfooding front-office-evolution, VB + Vaadin)

- **Drawer VB honra `Drawer.width` del wire**: `oj-drawer-popup` se encogía a contenido; el div
  interior ahora bindea `:style.width` a `mateuDrawer.width` (overlayOf ya lo traía) con fallback
  26rem y `max-width: 90vw`. Cargos 26→30rem, folio 30→34rem (backend).
- **Tarjetas de fila clicable a fila completa**: los `oj-action-card` de `rowActionId` sin botón
  (catálogo de cargos) eran inline y se encogían — clase `mateu-row-card` en los 15 stamps +
  `display:block; width:100%` en app.css, y `:first-of-type { margin-top: .75rem }` para el aire
  tras el input de búsqueda del check-out.
- **Panel Huéspedes del foldout a 25rem** (contenido útil 22rem = una `.mateu-grid-cell`).
- **Marca**: `shell.logo` en la proyección del bridge (fuente única + regen), variable
  `mateuShellLogo` (mateuBaseUrl + AppDto.logo) pintada en el slot start del global header; el
  logo Oracle integrado se oculta (`.oj-sp-logo-global-header-logo-container { display:none }`).
  Backend: `@Logo("/images/riu.svg")` en los FrontOfficeSuite de ambos front-office.
- **Welcome trend chart**: un `TrendChart` o `Chart` (chartData.labels + datasets[0]) en un tile
  del Welcome se proyecta como `welcome.trend` (items precomputados id/value/group/series), tile
  excluido de los KPIs; markup con `oj-chart` type=bar (import `ojs/ojchart`) sobre el ADP
  `welcomeTrendADP` ← `mateuWelcomeTrendItems` (app-flow). La Bienvenida emite ahora `Chart` de
  BARRAS (maintainAspectRatio=false, 200px) — el renderer web lo pinta con chart.js.
- **Ruta anidada** `/reservas/:id` (antes `/reserva/:id`) — la pestaña Reservas queda marcada en
  los shells con menú; `idFromRoute(mount="reservas")`. Al completar check-in → navigateTo
  `/reservas?vista=LLEGADAS_HOY` (mecanismo quick-filter ya soportado por onMateuNavigate).
- **Drawer de habitación cierra también in-house** (`elegirHabitacion`/`upgrade360`: closeModal
  siempre que la selección viene del drawer, sin condicionar a ARRIVING).
- **Vaadin (shared)**: hoist del EntityHeader inicial al header canónico de mateu-page
  (pageRenderer marca `__hoistedToPageHeader`, entityHeaderRenderer lo salta; kpisBelow = pares
  etiqueta+valor bajo el título, badges junto al título) — el VB no se ve afectado (no usa
  mateu-page). pageWidth edgeToEdge en Vaadin vía el hook no-padding (compact-changed) + gutter
  propio del header (`:host([data-edge])`); vars `--mateu-shell-gutter(-top)` declaradas por el
  shell vaadin. Foldout: FABs solo con overflow real (>32px + ResizeObserver) y el último fold
  nunca más estrecho que el overview. StatusList grid row-gap 2rem (vars overridables).

## URL por path en el jar de renderer (2026-07-30)

- **Doble modo de URL** (fijado en el bootstrap de `loadMateuShell`): **PATH** (`/products`, sin
  `#`) cuando la app la sirve el backend Mateu — la señal es el `<mateu-ui>` oculto que inyecta
  el controller generado (marcadores AQUIUI/HASTAAQUIUI del `_index.html` del jar) —, **HASH**
  (`#/ruta`) en serving estático (`vb-serve` local, VB hosteado en Oracle), donde el server no
  puede reescribir paths arbitrarios al index. `window.__mateuUrlPathMode` publica el modo;
  back/forward = `popstate` en path, `hashchange` en hash; en path la home (incluido el sentinel
  `_no_home_route` del server) se refleja como `/`, nunca como path.
- **GOTCHA visual-runtime**: la base de MÓDULOS (requirejs) se deriva de `location.pathname`
  (fallback que ignora `<base href>`), así que servida en `/products` pedía
  `/products/version_<ts>/bundles/...` → 404 y la shell no arrancaba. La salida:
  `vbInitConfig.BASE_URL` GANA sobre ese fallback (visto en el fuente del runtime: `BASE_URL ||
  (pageDir + BASE_URL_TOKEN)`, y con token que empieza por `/` usaría origin+token) —
  `scripts/copy.mjs` inyecta `BASE_URL: '/version_<ts>/'` derivado del propio token, además del
  `<base href="/">` para el resto de recursos relativos (css). El deep-link multi-segmento queda
  cubierto por el SpaRedirectFilter (forward al index) + base absoluta.
- Verificado con Playwright contra demo-vb :9005 servido por el jar: deep-link `/products`
  (filas del crud), clic de menú → `/stock` sin hash, back → `/products` re-renderizado, raíz
  estable en `/`.

## Menús federados: la navegación tenía que volver al pod (2026-09-03)

Fallo observado en `rw.ec1.mateu.io` (`ec-demo1/shell-redwood`, la MISMA shell que la Vaadin de
`ec1.mateu.io` con `io.mateu:redwood` en lugar de `vaadin-lit`): **el menú se pintaba entero y
ningún crud abría**. `Booking → Bookings` contestaba un `Text` rojo "Not found.".

Tres cosas rotas, en cadena. Las tres son de NAVEGACIÓN, no de expansión del menú: pedir su menú
a cada pod ya se hacía (`expandRemoteMenus`), y eso era justamente lo que dejaba a la vista
entradas que al pulsarlas no llevaban a ninguna parte.

1. **La ruta se recortaba**. `shellNavOf` navega una hoja de grupo por su ruta TERMINAL, porque
   la compuesta de un menú LOCAL (`/gestion/person`) es un camino de menú y no una ruta que el
   backend resuelva. Aplicado a una hoja de otro pod es al revés: `/booking/bookings` es
   exactamente lo que ese pod sirve, y recortarla a `/bookings` la deja sin dueño — ni casa con
   el registro `remoteRoutes` (así que la petición sale al base de la shell) ni existe allí. La
   marca para distinguirlas ya estaba: `expandRemoteMenus` deja su `baseUrl` en la hoja adoptada.
2. **El contexto no recordaba de qué backend venía**. Con la ruta ya bien resuelta, el crud
   pintaba toolbar y columnas pero SIN filas: el trigger `search` que el listado pide al cargar
   salía otra vez al base de la shell, que contesta 200 con cero fragments — un listado vacío y
   ni un error a la vista. Ahora `loadRouteInto` estampa `outbound.baseUrl` (junto a los 4 campos
   de ruta que ya guardaba, por la misma razón) y `runMateuAction`/`runMateuActionSse` lo
   prefieren; las cadenas leen `bridge.baseOf(reg)` en vez de la constante de la shell. Quien
   dispara una acción sabe de qué CONTEXTO sale, nunca de qué backend vino.
3. **El tercer nivel se perdía**. Una shell federada trae tres niveles sin pedir permiso: grupo
   de la shell (`Admin`) → grupo del pod (`Workflow`) → sus pantallas (`Processes`, `Steps`). El
   proyector modelaba dos, así que el grupo del pod quedaba como si fuese pantalla —clic → ruta
   de grupo → contenido vacío— y sus pantallas no aparecían en ninguna parte: `Processes`,
   `Steps` y todo `Forms`/`Worker` eran INALCANZABLES. `navNodeOf` es ahora recursivo y los dos
   markups de navegación (submenú `oj-menu` anidado en la barra, tercer `<ul>` en el navigator)
   pintan el nivel de abajo; el grupo a cualquier profundidad solo expande.

Tests: 4 nuevos en `poc/test.mjs` (75). El caso del pod que contesta con un GRUPO es el que no
estaba cubierto — el fixture antiguo hacía que el pod contestara una hoja suelta, forma que
ningún pod real tiene, y por eso el test pasaba con la navegación rota.

**Verificado contra el cluster SIN desplegar**, sirviendo el bundle recién construido a la app
desplegada (`e2e/vb-live-dev.mjs`, ver README): `Booking → Bookings`, `Content → Labels`,
`Content → Content types`, `Admin → Workflow → Processes` y `→ Steps` cargan con filas reales, y
las tres peticiones de cada una (mediador, contenido y `search`) salen al `/_pod` que toca.

**Pendiente anotado**: el título de la página del host se queda en `...` (el `SetWindowTitle`
llega en el increment del contenido y no alimenta `mateuHostTitle`) — se ve en cualquier crud
federado, y es independiente de la federación.

## Pulido tras el primer uso real de la consola federada (2026-09-03)

Tres cosas que se vieron al usar `rw.ec1.mateu.io` con los cruds ya cargando.

**1. Del listado no se llegaba al detalle.** Un crud de PÁGINA no contesta el detalle: contesta
un fragmento SOLO-ESTADO cuyo `_route` apunta a él (clic de fila → `/2CSXZN`, New → `/new`,
volver → `/list`). La cadena de la ISLA seguía ese flip desde la Fase 9; la del HOST no, así que
la petición salía, el servidor contestaba 200 y no pasaba nada — el fallo más difícil de ver de
todos, porque no hay error en ninguna parte. `routeFlipOf` (transport) extrae el criterio y
`runMateuAction` lo sigue.

Dos detalles que costaron una vuelta cada uno:

- **`_route` y `PushStateToHistory` NO son lo mismo**, aunque se parezcan. El primero es la ruta
  INTERNA que hay que recargar (`/list`); el segundo es la URL, relativa al mediador (`''` para
  el listado). Usar el primero como URL deja direcciones que no existen —
  `/booking/bookings/list` en vez de `/booking/bookings`— y el botón atrás aterriza en blanco.
- **Tras el flip hay que disparar los triggers OnLoad** del contenido nuevo: sin eso se vuelve
  del detalle a una tabla con sus columnas y sin una sola fila.

Verificado el ciclo entero contra el cluster: fila → detalle → Edit → Cancel → Back to list →
New → atrás del navegador, con las URLs iguales a las de la shell Vaadin de la misma app.

**2. El Ask Oracle solo ofrecía el primer nivel del menú.** Recorría `mateuNavItems`, así que
listaba GRUPOS (que no son destino: pulsarlos no lleva a ninguna parte) y no las pantallas —
que en una shell federada son casi todas. Ahora recorre el árbol entero y ofrece solo las hojas,
con el rastro del grupo a la derecha de la fila (`Processes · Admin › Workflow`): dos pods pueden
tener una pantalla que se llame igual. De paso, las "vistas rápidas" salen ahora de los
quickFilters del listado que se esté viendo, en vez de tres rutas del front-office escritas a
mano que en cualquier otra app son tres destinos muertos.

**3. El título de página salía vacío (`...`) en todo crud federado.** `summarizeHost` buscaba el
rótulo en el PRIMER nivel del menú, y la pantalla cuelga del grupo del pod, dos por debajo. Ahora
busca a cualquier profundidad y, antes que eso, usa el título que declara el propio Crud.

**4. Espacio en blanco abajo: media victoria.** `oj-web-applayout-page` fija `min-height:100vh`,
pero el slot `stretchingContents` del shell ya empieza BAJO la cabecera de 50px: la página medía
50px más que la ventana y salía una barra de scroll que no llevaba a ninguna parte. Arreglado
haciendo que el shell reparta su alto (flex column + `min-height:100vh` en su raíz).

Lo que NO se hizo, y por qué: estirar la TARJETA del listado hasta abajo (como hace la shell
Vaadin). Entre el contenedor de contenido y la tabla hay envoltorios que ponen el runtime de VB
(`oj-vb-content`/`oj-module`) y el `oj-drawer-layout` de JET; se intentó dos veces —con un
comodín `*:has(#mateuTable)` y nombrando la cadena una a una— y las dos descolocaron la tarjeta
(los `oj-flex` de FILA no se pueden volver columna). El hueco que queda es lienzo, no un corte,
así que se deja anotado en vez de forzarlo a ciegas. Lo mismo con el ancho: los márgenes
laterales en pantallas anchas son el modo `fixed` de RDS (tope 1408px centrado) y la shell
Vaadin de la misma app hace exactamente lo mismo — cambiarlo sería una DECISIÓN de producto, no
un arreglo.

### El toolbar de la Page se pintaba dos veces (2026-09-03)

Al entrar en una reserva salían `Back to list` / `Add another` / `Edit` en la cabecera Y otra vez
en una fila bajo el formulario. Las dos proyecciones salen del MISMO `Page.metadata.toolbar`:
`pageToolbarOf` lo lleva a la cabecera y `actionsOf` (que recorre el árbol buscando nodos con
`actionId` + `label`) lo recoge también para `mateuFormActions`. Manda la cabecera cuando se
pinta; sin cabecera, la fila de abajo es la única y se queda entera. Aplicado en las dos chains
(navegación y acción), porque las dos rehacen las proyecciones.

Con eso, el detalle queda como manda el componente de Oracle: la acción principal visible y el
resto en el desbordamiento `···` (`oj-sp-header-general-overview` decide el reparto, no
nosotros). Verificado que `Edit` desde el `···` sigue llevando a `/booking/bookings/<id>/edit`.

Es el mismo fallo que ya se había visto en el renderer redwood-oj retirado, donde `renderFilterBar`
pintaba `metadata.toolbar` además del encabezado del crud: **cuando dos proyecciones distintas
leen el mismo trozo del wire, una de las dos tiene que callarse explícitamente.**

### Los puntos suspensivos salían demasiado pronto (2026-09-03)

`oj-sp-header-general-overview` da UN hueco de acción primaria y pinta **la primera secundaria**
como botón; todo lo demás va al desbordamiento `···`. No hay `displayOptions` ni umbral que
tocar: con 3 acciones y ninguna marcada primary, salían dos escondidas. Es comportamiento de
Spectra, no nuestro — lo nuestro es CÓMO repartimos las acciones entre sus huecos, y lo estábamos
haciendo mal por partida doble:

- **`primaryToolbarButton`**: manda `buttonStyle: primary` del wire; si el wire calla, se toma la
  ÚLTIMA que no sea de vuelta. En los toolbars de Mateu el orden es "salir, …, avanzar"
  (Cancel→Save, Back to list→Add another→Edit), así que la última no-vuelta es la que uno vino a
  hacer. Heurística explícita, a sustituir el día que el wire traiga el rol del botón (el `role`
  que se difirió en la Fase 0).
- **`backToolbarButton` → `displayOptions.goToParent`**: volver no es una acción más. RDS tiene su
  propia afordancia (enlace sobre el título + evento `spGoToParent`) y meterla entre las
  secundarias la escondía justo cuando es lo que más se pulsa. Su rótulo sale del botón del wire
  vía `translations.goToParent` (sin eso pone "Parent page").

Con las dos, el detalle de un crud pasa de "un botón y dos escondidas" a **Back to list** (enlace)
+ **Add another** + **Edit**, y el `···` ya no aparece: hacen falta 4 botones (vuelta + primaria +
dos secundarias) para que vuelva a hacer falta. El editor queda Cancel + Save.

## Formulario con pestañas, tablas embebidas y componentes web (2026-09-03)

El detalle de un proceso (`/workflow/processes/{id}`) enseñaba los rótulos de las pestañas y nada
más: ni los campos de fuera, ni las tablas de dentro, ni el grafo. Cinco cosas, todas distintas.

**1. La página la reclamaba el arquetipo equivocado.** `itemOverviewOf` se activaba con CUALQUIER
`TabLayout` en el árbol y proyecta "panel de datos clave + pestañas", sacando de cada pestaña solo
textos sueltos. Esta página no es un item overview: es un FORMULARIO que lleva pestañas dentro.
Ahora el arquetipo exige su panel (una `Card` fuera del `TabLayout`); sin él, se cae al contenido
genérico.

**2. Las pestañas se APLANAN.** El átomo `isTabs` es solo la barra; el contenido de la pestaña
activa va detrás, como átomos normales del mismo contenedor. Anidar átomos dentro de átomos
obligaría a duplicar la plantilla entera dentro de la pestaña y a pelearse con el `$current`
anidado de VB. La pestaña activa es estado de CLIENTE (`mateuActiveTab`): cambiarla reproyecta el
mismo contexto sin preguntar nada al servidor, y una navegación la resetea. Limitación consciente:
un id fijo (`#mateuContentTabs`), o sea UNA barra de pestañas por pantalla.

**3. Tabla embebida (`isGrid`).** Una lista con columnas dentro de un formulario no es el listado
de un crud (ése tiene su cabecera de búsqueda y su ruta). Su data provider **viaja en el átomo**:
son varias por página y una variable por tabla no se puede declarar de antemano, así que el core
recibe la fábrica de la app (`setDataProviderFactory`, `ojs/ojarraydataprovider`) y en Node se
queda sin ella — el átomo lleva las filas igual y los tests las comprueban.

**4. Componente web de terceros (`isElement`).** El wire trae etiqueta, atributos y la URL del
módulo. La plantilla solo pone el hueco (`.mateu-element`) porque VB no sabe escribir
`<{name}>`; el bridge crea el elemento **una vez por hueco** y en los renders siguientes solo le
reescribe los atributos: un componente web guarda estado que el servidor no conoce (el zoom y la
selección de un grafo), y recrearlo lo tira. Los atributos son `${state.x}` y se reinterpolan en
cada render — es su único canal de datos y la metadata no se reenvía con un State.

> **GOTCHA que costó la primera vuelta**: `import(url)` NO vale. El transpilador del build de VB
> lo convierte en un `require()` de AMD y requirejs se pone a resolver la URL como un id de módulo
> suyo: la petición no llega a salir, el hueco se queda vacío y no hay ni un error. Se inyecta un
> `<script type="module">`, que no lo puede reescribir nadie.

> **Y el segundo**: el `oj-tab-bar` sale VERTICAL por defecto (como el navigator) — hay que poner
> `edge="top"` — y parsea su `<ul>` al inicializarse, así que los `<li>` que estampa un for-each
> llegan tarde y hay que llamarle `refresh()`. La misma trampa que el `oj-navigation-list` de la
> shell, dos veces.

**5. El deep-link caía en el listado.** Dos fallos encadenados: `remoteRouteOf` solo casaba
rutas EXACTAS y al registro solo llegan las del menú (`/workflow/processes`), así que el detalle
salía al backend de la shell → "Not found."; ahora casa por prefijo con el registro más largo que
encaje. Y una vez en el pod correcto, el mediador contesta `rootRoute` = la ruta ENTERA que se
pidió y `homeConsumedRoute` = la suya (`/workflow/processes`): mandando la entera como
consumedRoute el servidor sirve la vista por defecto del crud, y por eso al entrar por el enlace
de un proceso aparecía el listado.

Fixture de wire real `wf-process.json` + test 79 (campos de fuera, las 6 pestañas, el grid de
Steps con sus badges y el grafo con los atributos ya interpolados) y test 80 (el deep-link).

### Una caja dentro de otra (2026-09-03)

Cualquier pantalla con pestañas o con una tabla dentro pintaba sus campos en un `oj-panel`
metido en el contenedor de contenido — caja dentro de caja—, mientras que una ficha normal (que
va por la rama de formulario) no lo tiene. El panel salía del `Card` del wire, que en estas
páginas no es una tarjeta: **es el marco de la página**, y ése lo pinta el contenedor.

Regla: un ÚNICO card SIN TÍTULO que envuelve todo el contenido se aplana. Con título es una
tarjeta de verdad y se respeta, igual que cuando hay varias (la 360 y sus zonas siguen con sus
paneles). El título de una tarjeta es reconocible porque `visit()` lo mete como primer átomo de
texto con la clase del subencabezado.
