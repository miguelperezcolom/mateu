// Mateu renderer on VB — the CORE, plain JS testable without VB, split by surface into
// core/*.mjs (it was one 5,300-line file). This module re-exports every piece so tests and the other
// poc modules keep importing from './reduceContexts.mjs'; make-amd concatenates the pieces in this
// order into the bridge's single scope.
//
// In the VB app these functions would be methods of app-flow.js; here they are free
// functions so they can be tested in Node.
//
// v3 (2026-07-24): adjusted to the REAL WIRE (fixtures/real/*.json, captured with capture.mjs
// against demo/demo-vb on :9005). Observed contract:
//   - Shell bootstrap: POST {base}/mateu/v3/components/_/action (route '', __load__) → App.
//     Everything else: POST {base}/mateu/v3/sync/{route|_no_route} with actionId '' for loads.
//   - `targetComponentId` is the ECHO of the request's `initiatorComponentId` ('' → host), and the
//     server DERIVES the internal ids from the initiator ('crud1' → 'crud1_app', 'crud1_list'): the
//     uniqueness of ids across surfaces is the CLIENT's responsibility (one contextId per surface).
//   - State travels in `fragment.state`; overlays (Drawer) carry `metadata.initialData`.
//   - A mediator (crud, island) arrives as a ServerSide whose child0 is a (chromeless) App: its
//     CONTENT is loaded with a second request with consumedRoute=rootRoute of the inner App
//     + serverSideType=homeServerSideType. `mediatorOf(ctx)` extracts that info.
//   - CloseModal carries data.eventName → the bus event (@SubscribeTo) has to be emitted;
//     e.g. the crud refreshes the listing subscribed to 'mateu-crud:saved-in-drawer'.
//   - An embedded island boundary is an inner ServerSide node with id = field name
//     ('_guestNote') and initialData with the markers (_embeddedMediator/_inline).


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
