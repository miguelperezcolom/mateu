// Renderer de Mateu sobre VB — the CORE, plain JS testable without VB, split by surface into
// core/*.mjs (it was one 5,300-line file). This module re-exports every piece so tests and the other
// poc modules keep importing from './reduceContexts.mjs'; make-amd concatenates the pieces in this
// order into the bridge's single scope.
//
// En la app VB estas funciones serían métodos de app-flow.js; aquí son funciones
// libres para testearlas en Node.
//
// v3 (2026-07-24): ajustado al WIRE REAL (fixtures/real/*.json, capturados con capture.mjs
// contra demo/demo-vb en :9005). Contrato observado:
//   - Bootstrap del shell: POST {base}/mateu/v3/components/_/action (route '', __load__) → App.
//     Todo lo demás: POST {base}/mateu/v3/sync/{route|_no_route} con actionId '' para cargas.
//   - `targetComponentId` es el ECO del `initiatorComponentId` de la request ('' → host), y el
//     server DERIVA los ids internos del initiator ('crud1' → 'crud1_app', 'crud1_list'): la
//     unicidad de ids entre superficies es responsabilidad del CLIENTE (un contextId por superficie).
//   - El estado viaja en `fragment.state`; los overlays (Drawer) llevan `metadata.initialData`.
//   - Un mediador (crud, isla) llega como ServerSide cuyo child0 es un App (chromeless): su
//     CONTENIDO se carga con una segunda request con consumedRoute=rootRoute del App interior
//     + serverSideType=homeServerSideType. `mediatorOf(ctx)` extrae esa info.
//   - CloseModal lleva data.eventName → hay que emitir el evento del bus (@SubscribeTo);
//     p.ej. el crud refresca el listado suscrito a 'mateu-crud:saved-in-drawer'.
//   - Una frontera de isla embebida es un nodo ServerSide interior con id = nombre de campo
//     ('_guestNote') y initialData con los marcadores (_embeddedMediator/_inline).


export * from './core/tree.mjs'
export * from './core/archetypes.mjs'
export * from './core/atoms.mjs'
export * from './core/overviews.mjs'
export * from './core/shellNav.mjs'
export * from './core/content.mjs'
export * from './core/pageHeader.mjs'
export * from './core/listing.mjs'
export * from './core/reducer.mjs'
export * from './core/rowEditor.mjs'
export * from './core/boards.mjs'
export * from './core/display.mjs'
