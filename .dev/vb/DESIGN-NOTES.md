# Mateu-sobre-VB — Notas de diseño (handoff para retomar desde otro PC)

> Este doc es la **fuente de verdad para continuar** el proyecto. La memoria de sesión de Claude vive fuera
> del repo (local a un PC), así que todo lo necesario para retomar está aquí, en el repo.

## Dónde está cada cosa

- **Roadmap por fases (con puertas visuales) + entregable final**: `.dev/vb/RENDERER-ROADMAP.md`
- **POC ejecutable** (valida la LÓGICA): `.dev/vb/renderer-poc/` — `reduceContexts.mjs` + `fixtures/*.json` +
  `test.mjs`. Correr: `cd .dev/vb/renderer-poc && node test.mjs` → 10 tests OK.
- **Diseño completo (PDF)**: `.dev/vb/mateu-vb-renderer-design.pdf`
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

- **App VB de trabajo**: `.dev/vb/mateu-vb` (copia del Redwood Starter `frontoffice`). Local:
  `npm install` una vez; `npx grunt vb-build --no-optimize=true --force` (el --force salta el paso
  de deploy que pide --url; las dependencias de exchange se vaciaron — los `oj-sp` cargan del CDN por
  los paths de `app-flow.json`); `npx grunt vb-serve --port=9006` → http://localhost:9006 (con
  demo-vb corriendo en :9005). En `visual-application.json` se añadió `rootURL`.
- **Kit**: `resources/js/mateu-bridge.js` es GENERADO por `renderer-poc/make-amd.mjs` desde la fuente
  única (`reduceContexts.mjs` + `transport.mjs`) — regenerar tras tocar el core. La constante
  `mateuBaseUrl` vive en `app-flow.json`. Chain `loadMateuHello` (JS ActionChain con el bridge como
  dependencia AMD) en `vbEnter` de main-start-page → variables → `oj-bind-text` (markup del starter,
  bindings cambiados; CERO HTML/CSS propio).
- **Shell auténtica**: `shell-page.html` monta `oj-sp-simple-ui-shell` + `oj-sp-global-header`
  (slots declarados `globalHeader`/`stretchingContents`; imports añadidos en shell-page.json).
  La captura `renderer-poc/shots/fase1.png` muestra el global header Oracle + FAB Ask Oracle de la
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
`editable` → grid (37px, rejilla), Products sigue list (shots/stock-grid.png). La EDICIÓN de
celdas en sí sigue pendiente en este renderer (update-row + widgets de celda — ver "no
cableado aún"). OJO ~/.m2 COMPARTIDO entre clones (opus/k3): si demo-vb deja de compilar con
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

## Próximo paso al retomar
2. **Fases 1.x** (puertas de MECANISMO en runtime VB, antes de la Fase 2): 1.1 estado (variables +
   two-way round-trip), 1.2 aplicación de increments al target (re-render quirúrgico por id, islas), 1.3
   comandos UI → efectos, 1.4 resolución de ruta (4 campos de ruta salientes + composición), 1.5 sync con la
   URL (PushStateToHistory + deep-link + back/forward + dirtyGuard), y 1.6 (VISUAL) estilos alrededor del
   contenido = los tres modos de `pageWidth` (fixed/fullWidth/edgeToEdge) fieles a la medición RDS 24C.
3. Pendiente de capturar cuando toque: foldout/item-overview (F7+, añadir pantallas a demo-vb),
   un `PushStateToHistory` real (navegación de crud sin drawer) y el spike de SSE/LongTask en VB hosteado.
