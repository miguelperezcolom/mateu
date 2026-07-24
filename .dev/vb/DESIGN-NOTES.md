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

## Próximo paso al retomar

1. **Fase 1** del roadmap: hola mundo (`/hello` de demo-vb) dentro del `oj-sp-simple-ui-shell` real →
   puerta visual del chrome. No avanzar sin que la captura sea indistinguible de una app Redwood nativa.
   ⚠ El proceso se PARA al final de cada fase para verificación visual del usuario.
2. **Fases 1.x** (puertas de MECANISMO en runtime VB, antes de la Fase 2): 1.1 estado (variables +
   two-way round-trip), 1.2 aplicación de increments al target (re-render quirúrgico por id, islas), 1.3
   comandos UI → efectos, 1.4 resolución de ruta (4 campos de ruta salientes + composición), 1.5 sync con la
   URL (PushStateToHistory + deep-link + back/forward + dirtyGuard), y 1.6 (VISUAL) estilos alrededor del
   contenido = los tres modos de `pageWidth` (fixed/fullWidth/edgeToEdge) fieles a la medición RDS 24C.
3. Pendiente de capturar cuando toque: foldout/item-overview (F7+, añadir pantallas a demo-vb),
   un `PushStateToHistory` real (navegación de crud sin drawer) y el spike de SSE/LongTask en VB hosteado.
