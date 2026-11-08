# definition-path-params

Pins a DEFINITION-ONLY page (a route with a `layout:` and no view model, served from this case's
own `specs/ui/`) under a `:param` route (`missions/:missionId`), loaded at `/missions/6`.

What it pins (Java's `ActionInstanceCreator.seedBareLayout`):

- a path parameter is NOT a seed: a page whose route seeds nothing else (no `state:`/`appState:`,
  no `data:`/`appData:`, no fixed/default params, no query string) and that declares no actions,
  triggers, page type or proxied source answers its BARE client-side layout — no server-side
  wrapper, no state carrying the parameter (the browser resolves `${state.missionId}` from the route);
- the window is named from the route's PATTERN (`Missions`), because the title's `${state.missionId}` has
  no value on the server: never from the concrete path's id (`6`).

Its sibling `definition-path-params-seeded` is the same page whose route also declares a default
parameter — that one IS wrapped, and its state carries the path parameter too.
