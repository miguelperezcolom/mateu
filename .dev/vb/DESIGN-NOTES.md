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

## Arquitectura (el núcleo, ya validado en el POC)

- **Transporte**: `callMateu(baseUrl, route, actionId, state)` → `POST /{base}/mateu/v3/components/_/action` →
  `UIIncrementDto`. (Service Connection en prod; `fetch` para el bootstrap.)
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

## Contrato de wire (confirmado en libs/mateu/.../dtos)

- `UIIncrement { messages, commands, fragments, banners, componentState }`
- `UIFragment { targetComponentId, component, data, state, action: Add|Replace|ReplaceKeepData }`
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

### Fase 0 — hallazgos con captura REAL (2026-07-24, explorer en :8595)

Capturado con `apps/redwood-vb/tools/capture.mjs` → `apps/redwood-vb/fixtures/real/*.json`; 15 tests de
contrato en `apps/redwood-vb/test/contract.test.mjs` (verdes). **Corrección importante del contrato**: el
`component` de un fragment tiene DOS formas y se leen distinto:
- **ServerSide** (el mediador de una vista enrutada): `{ type:"ServerSide", id, serverSideType, route, children,
  initialData, pageType, pageWidth, actions, triggers, rules, … }` — campos al **NIVEL SUPERIOR**, SIN
  `.metadata`. El contenido va en `children` (ClientSide). El `state` del contexto se siembra de `initialData`.
- **ClientSide** (App shell + hojas UI): `{ type:"ClientSide", metadata:{…DTO tipado…}, id, children, slot, … }`
  — el tipo real y los datos están en `component.metadata` (p.ej. `metadata.type:"App"` con `menu`, `variant`,
  `homeRoute`, `sseUrl`, `contextSelectors`, `contextActions`, `themeToggle`, …).
- Por eso `metaOf = fr.component?.metadata || fr.component` es correcto (ClientSide→metadata; ServerSide→él mismo).
- `pageType` real por superficie (confirmado): landing/dashboard/detail/form/process. `pageWidth` puede venir
  `null` (el renderer lo infiere) — la puerta 1.6 valida los tres modos igualmente.
- **Known gap**: `/products` (AutoCrud) devuelve increment VACÍO en el explorer (regresión backend
  FilteredAutoCrud, ver memoria `feedback_redwood_oj_harness`) — recapturar cuando el backend lo sirva.
- Las capturas de 2 pasos (abrir Drawer=`Add`, `State` push, save) faltan: se añaden al llegar a 1.2/Fase 5.

### El renderer se construye DENTRO de frontoffice + SE EJECUTA EN LOCAL (validado 2026-07-24)

Dirección confirmada: **el renderer NO es un kit aparte que se importa — se construye DENTRO de la app VB de
ejemplo `frontoffice`** (`.dev/vb/frontoffice/frontoffice-1.0`), que ya trae el shell Spectra real. Y — hallazgo
clave — **esa app VB se puede EJECUTAR EN LOCAL** (sin VB Studio), así que hay bucle de prueba visual local:

```bash
cd .dev/vb/frontoffice/frontoffice-1.0
npm install                                                  # toolchain VB desde el CDN de Oracle (~845 pkgs)
npx grunt vb-build --url:ce=https://static.oracle.com/cdn/spectra-ui   # construye a build/processed/
#   (falla al final en el paso 'dependencyResolver' 501 —es optimización, NO bloquea: index.html + app-flow
#    ya se escribieron; el output es servible. 'vb-process-local' con la misma --url:ce completa limpio.)
cd build/processed && python3 -m http.server 9003 --bind 127.0.0.1
# → http://127.0.0.1:9003/webApps/vbredwoodapp/index.html  arranca el SPA VB standalone:
#   require.js + visual-runtime + jet + oj-sp cargan del CDN público; pinta con tema/fuente Redwood reales.
```
Validado: el frontoffice pinta su contenido ("Welcome to your First Redwood App!!!") con tipografía Redwood.
Warnings tolerables: JET version mismatch (runtime vs jet del CDN) y 404 de catálogos de servicio (service
connections sin configurar — se resuelven al cablear la conexión a Mateu). Los `%{env.vbServer.url}%` del
index quedan sin sustituir en standalone pero el runtime arranca igual. node_modules/ y build/ van gitignored.

**Plan de integración**: añadir el bridge a `webApps/vbredwoodapp/app-flow.js`, el fragmento `mateu-node`, las
variables `mateuRegistry`/`mateuAppState`, la chain `applyIncrement`, y que el host page pinte el contexto
`__root__` desde la API de Mateu (`demo-redwood-vb` en :9001, CORS abierto). Probar con el flujo de arriba.

### Fases 1–2 cableadas en frontoffice-renderer (2026-07-24) — gotchas

Fase 1 (Text) y Fase 2 (navigator desde el menú) funcionan en local. Todo en la página de contenido
`webApps/vbredwoodapp/flows/main/pages/main-start-page.*` (bridge en el `.js`; chains en `main-start-page-chains/`).
Gotchas descubiertos (valen para todas las fases):
- **eventListeners de página referencian chains por `"chainId"`**, no `"chain"` (esto último hace que VB intente
  cargar la chain como script → "Script error").
- **Contrato mediador**: cargar una ruta de MENÚ (`/home`) devuelve la App otra vez, NO el contenido. Para el
  contenido hay que enviar en el body el `serverSideType` + `consumedRoute` del item de menú (`RunActionRqDto`).
  Las rutas STANDALONE (fuera del menú) sí devuelven contenido directo. La app NO puede estar en `""` si sus
  pantallas de contenido comparten ruta con el menú (colisión) — pero moverla de `""` cambia el baseUrl del
  endpoint (`/mateu/v3/...` → 404); solución: app en `""` + cargar contenido por el contrato mediador.
- **Componentes oj no auto-incluidos**: el paso `dependencyResolver` del build falla (501) en standalone, así que
  un `oj-navigation-list` (u otro componente no declarado) NO se registra salvo que se **`require()` en el módulo
  de página** (`define(['ojs/ojnavigationlist', …])`). Sin eso, el elemento queda sin upgradear (bindings en crudo).
- **Etiqueta de menú** = nombre de clase/campo (`Home`/`Reports`/`Settings`), no el `@Title`. El item lleva
  `label`, `route`, `serverSideType`, `consumedRoute`, `path`.
- **Navigator** = `oj-navigation-list` con `data="[[ $functions.getNavData() ]]"` (un DataProvider sobre un
  `ko.observableArray` que loadApp rellena) + `on-selection-changed="[[ $listeners.navSelect ]]"` → chain que
  recarga solo el contenido (`selection` = `{{ $event.detail.value }}` = la ruta). Evidencia: `frontoffice-renderer/
  shots/fase2-navigation.png` (estado activo Redwood en el item seleccionado).

### Fase 3 — formulario editable (2026-07-24) — gotchas

Navegar a una ruta-formulario pinta los `FormField` como inputs `oj-c-*` auténticos y Guardar reenvía el
estado editado. Gotchas:
- **`oj-c-*` hay que `require()`irlos** en el módulo de página (`define(['oj-c/input-text','oj-c/input-number',
  'oj-c/button', …])`), igual que `oj-navigation-list` — el build standalone no los incluye.
- **FormFields duplicados**: el árbol referencia los nodos en `children` Y en `metadata`, así que un walk
  ingenuo los cuenta 2 veces → **deduplicar por `fieldId`**.
- **Two-way NO fiable en `oj-bind-for-each`**: bindear `value="{{ field.data.value }}"` (o `on-value-changed`)
  a un observable/handler ANIDADO por item NO escribe de vuelta (el for-each clona el item). El `.value` del
  componente `oj-c` en el DOM SÍ es correcto → al guardar, **leer los valores del DOM** (`[data-field]`).
- **Las ACCIONES van al COMPONENTE de contenido, no al app**: la CARGA de una ruta de menú usa el contexto del
  item (sst=app) para resolver el mediador, pero `save` (y cualquier acción) debe enviar el `serverSideType` +
  `route` + `consumedRoute` del CONTENIDO cargado (p.ej. `Profile`) — capturarlos del host context tras reducir.
  Si se envía con el sst del app, el servidor no aplica el `componentState` y responde con los valores default.
- Los campos: `FormField` con `fieldId`, `dataType` (string/integer/…), `stereotype`, `label`; los VALORES en
  `component.initialData`. Evidencia: `frontoffice-renderer/shots/fase3-form-save.png`.

### Fase 4 — listado (2026-07-24) — gotchas

Navegar a una ruta-listado pinta una `oj-table` Redwood alimentada por las filas de Mateu. Gotchas:
- **AutoCrud NO carga por `__load__`**: responde `UnsupportedOperationException: __load__ not supported`
  (su flujo mediador de ~3 cargas usa otras acciones). Para un listado directo se usó un **campo `List<Row>`
  (stereotype grid)**, cargable por `__load__`. (Integrar el flujo AutoCrud completo = fase posterior.)
- **`oj-table` hay que `require()`irla** (`ojs/ojtable`), como el resto.
- **Estructura del grid**: `FormField` con `stereotype='grid'`, `dataType='array'`; las **columnas** son nodos
  `GridColumn` (`id`, `label`; excluir `_select`, la de selección); las **filas** viven en
  `component.initialData[fieldId]` (array de objetos con las claves = ids de columna).
- **DataProvider**: `ArrayDataProvider(rows, {keyAttributes:'@index'})` (las filas no traen id) + columnas
  `[{headerText, field}]`. Los `FormField`/`GridColumn` vienen **duplicados** (children + metadata) → dedup.
- Falta (refinamiento): la **smart-search bar** y el **estado vacío** de una collection Redwood — el core
  de Fase 4 (tabla con filas) está. Evidencia: `frontoffice-renderer/shots/fase4-table.png`.

### Fase 5 — CRUD real vía mediador (2026-07-24) — CONTRATO CLAVE

El contrato mediador del AutoCrud (el "~3 sequential loads"), reverse-engineered y funcionando (listing):
- **Un crud carga por `handleRoute` con `actionId=""` (vacío), NO `__load__`** (que va a `handleAction`, y el
  crud no lo soporta → `UnsupportedOperationException: __load__ not supported`). `MultiView.handleRoute` solo
  actúa si `actionId == null || actionId == ""`. OJO en el bridge: `actionId || '__load__'` colapsa `""`→`__load__`
  (usar `actionId == null ? '__load__' : actionId`). `""` también sirve para pantallas normales → unificar.
- **Paso 1** (`route`, `""`, sst=app): el crud devuelve un `ServerSide` que envuelve un `App` con
  **`variant="MEDIATOR"`** (dice "recárgame con mi serverSideType"). Detectar ese App-MEDIATOR en el árbol.
- **Paso 2** (`route`, `""`, sst=**el crud**, **consumedRoute = la ruta del crud**): resuelve la LISTING
  (`ListRouteResolver` exige `route == consumedRoute` del crud — si `consumedRoute` va vacío, NO resuelve).
  Devuelve la estructura: nodos `GridColumn` + acciones `search`/`new`/`view`/`delete`.
- **Paso 3** (`route`, `"search"`, sst=el crud, consumedRoute=ruta crud): las FILAS llegan en un fragment
  data-only en **`fragment.data.crud.page.content`** (un `Page` con `content`=array de filas; cada fila trae
  `_rowNumber`, `id` y los campos de columna).
- Columnas = `GridColumn` (dedup; excluir `_select`); tabla = `oj-table` + `ArrayDataProvider('@index')`.
- **New/Edit/Delete (HECHO)**:
  - **New**: cargar `/{crud}/new` (actionId="") → form de creación (fields vacíos) → guardar con actionId
    **`create`** (`PersistActionHandler`) → re-`search()` para refrescar.
  - **Edit**: seleccionar fila → cargar `/{crud}/{id}/edit` (actionId="") → form poblado → guardar con actionId
    **`save`** → re-search. (Cargar `/{crud}/{id}` sin `/edit` da la VISTA read-only con botón Edit.)
  - **Delete**: actionId **`delete`** con `componentState.crud_selected_items = [fila completa]`
    (`getSelectedRows` lee esa clave). La fila SE BORRA aunque el re-render post-delete emita un
    `"id is null"` inofensivo → ignorar el mensaje y re-search.
  - Selección de fila: `oj-table selection-mode.row="single"` + `on-selected-changed` →
    `e.detail.value.row` (un KeySet; con `keyAttributes:'@index'` el valor es el índice de fila).
  - Evidencia: `frontoffice-renderer/shots/fase5-crud-full.png` (toolbar Nuevo/Editar/Borrar + tabla).

### Fase 6 — app compleja (2026-07-24): submenús + @AppContext + header actions

- **Submenú**: `@Menu` de un tipo que implementa `Submenu` (con sus propios `@Menu`). En el wire, el item de
  grupo trae `submenus:[...]` y las rutas van prefijadas (`/catalogo/products`). El item hijo lleva su
  serverSideType (app)/consumedRoute igual que los top-level, y cargar `/catalogo/products` resuelve por el
  mismo mediador. Navigator = `oj-navigation-list drill-mode="collapsible"` + **`ArrayTreeDataProvider`**
  (`ojs/ojarraytreedataprovider`; el menú se mapea a árbol con `children`). Mantener un `menuByRoute` PLANO
  (incl. anidados) para el contexto de loadRoute. **`item.selectable` rompió el render del árbol** (solo salía
  el primer item, sin error JS) → en su lugar, clic en grupo = expandir + navegar a su **primer hijo**
  (`groupChildFirst`).
- **@AppContext**: `contextSelectors[]` (fieldName/label/options) → `oj-c-select-single` (`oj-c/select-single`)
  por selector. El valor elegido se guarda en un `appContext` module-level y viaja en el `appState` de CADA
  `callMateu`. (Refinamiento: recargar la ruta actual al cambiarlo.)
- **Header actions**: `contextActions[]` (recursivo con `children` → dropdown). Dispatch **app-level**:
  `callMateu('', actionId, appSst)` (o incluso sin sst) → `Message`. Aplanadas a `oj-c-button` (Sync,
  Exportar: PDF/Excel); el botón lleva `:data-action-id` y una chain lo lee de `$event.currentTarget`.
  (Refinamiento: un dropdown `oj-menu-button` real para agrupar los hijos.)
- **Reactividad**: `contextSelectors`/`contextActions`/`tableColumns` son `ko.observableArray` — los for-each
  de la cabecera/tabla se bindean a `getX()` que LEE el observable, así re-renderizan cuando loadApp (async)
  los rellena (si no, salen vacíos porque el bind ocurre antes). Evidencia: `shots/fase6-complex-app.png`.

### Regla dura de presentación (decisión 2026-07-24)

**NADA de HTML/CSS que no venga de los ejemplos de VB. La capa de presentación es VB puro, sin añadidos.**
El chrome lo pinta `oj-sp`/Spectra (el `app-flow.js` del ejemplo solo hace
`define(['oj-sp/spectra-shell/config/config'], …)`); los nodos, fragmentos VB con markup `oj-*`/`oj-bind-*`
tal cual en los ejemplos. Consecuencias:
- **No hay harness/preview local de UI.** Un intento inicial de harness (index.html + CSS propios aproximando
  el chrome Redwood) se **eliminó** por violar esta regla. En local solo se prueba la **lógica** (reducer, Node)
  y el **contrato de wire** (fixtures). La validación **visual** se hace **dentro de una app VB real**.
- La presentación vive en `apps/redwood-vb/vb/`: `app-flow.js` (AMD bridge, sin markup) + `mateu-node.html`
  (fragmento recursivo, solo `oj-bind-*` + clases `oj-*`). El core (`src/core/reduceContexts.mjs`) es LÓGICA
  pura, sin HTML/CSS, y se carga en VB como módulo AMD `redwood-vb/reduceContexts`.
- El backend SUT del proyecto es `demo/demo-redwood-vb` (**:9001**), renderer-agnóstico: sirve solo la API
  `/mateu/v3` (sin dependencia de ningún renderer). Su único cliente es el kit VB.
- **Fase 1**: HomePage (`Text`) servida en :9001; presentación = fragmento `vb/mateu-node` rama `Text` sobre el
  shell Spectra → puerta visual DENTRO de VB.

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

## Próximo paso al retomar

1. `capture.mjs` (15 líneas, en el roadmap) contra un backend Mateu vivo (p.ej. un demo) → volcar increments
   REALES a `renderer-poc/fixtures/` y correr `test.mjs` para fijar el contrato de wire.
2. **Fase 1** del roadmap: hola mundo dentro del `oj-sp-simple-ui-shell` real → puerta visual del chrome.
   No avanzar sin que la captura sea indistinguible de una app Redwood nativa.
3. **Fases 1.x** (puertas de MECANISMO en runtime VB, antes de la Fase 2): 1.1 estado (variables +
   two-way round-trip), 1.2 aplicación de increments al target (re-render quirúrgico por id, islas), 1.3
   comandos UI → efectos, 1.4 resolución de ruta (4 campos de ruta salientes + composición), 1.5 sync con la
   URL (PushStateToHistory + deep-link + back/forward + dirtyGuard), y 1.6 (VISUAL) estilos alrededor del
   contenido = los tres modos de `pageWidth` (fixed/fullWidth/edgeToEdge) fieles a la medición RDS 24C.
   Verifican en VB real lo que la sección "State & aplicación de increments" diseña y el POC valida solo en Node.
   OJO: el reducer aún no mapea `PushStateToHistory` (hoy solo `NavigateTo`) — 1.5 lo añade.
