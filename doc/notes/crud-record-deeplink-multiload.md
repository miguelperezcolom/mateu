# CRUD record deep-link: multi-phase cold-load ("reload flicker")

Status: **open / characterized**. Cosmetic. Engine-wide (not shell- or federation-specific).

## Symptom

Opening — or reloading — a deep-link to a **record inside a listing** (e.g. the EventConductor
demo's `/workflow/processes/{uuid}`) makes the content area repaint in visible stages: a brief
"the page is reloading" effect. It is **not** a "Not found" (no such text ever reaches the DOM or
the wire) and **not** a failed request — every load returns 200. The content ends up correct.

## Root cause (measured, 2026-09-12)

A deep-link to a CRUD record loads the **same route** in **three sequential phases**, and each
phase paints:

1. the **App** shell structure,
2. the **listing / CRUD** (a `ServerSide` component),
3. the **record detail** (a `ServerSide` component, carries `SetWindowTitle`).

### It is NOT the shell / federation

Decisive test: loading the remote CRUD **directly, with no shell in front** —
`http://localhost:8085/remote/things/t3` on the e2e federation SUT — also produced **3 loads** of
`/mateu/v3/sync/things/t3`, with exactly the App → listing → detail response sequence above. So the
multi-phase cold-load is **inherent to CRUD record deep-links across all of Mateu**. Behind a
federated shell the shell's own top `<mateu-ux>` is added on top (hence "2–3" loads of the remote
content route when measured through the shell, 3 direct).

This is the same family as the "listing drawn twice/thrice on cold load" issues the renderer has
chipped at before — see the comments in
`frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/ui/renderers/appRenderer.ts` (variant-flip
remount, stable `contentUxId`) and the load trigger in
`frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/ui/mateu-ux.ts` `updated()` (a load fires when
`id` / `baseurl` / `route` / `consumedRoute` / `instant` change).

## Where the phases originate (investigation map)

- **Phase 1 (App):** backend route resolution returns the `@UI` app for the route —
  `backend/shared/core/.../runaction/RouteInstanceCreator.java` (`resolveAsApp`) /
  `AppMenuResolver.java`. The top `<mateu-ux>` renders the app shell; its content `<mateu-ux>` is
  created for the route (see `renderApp` / `chooseRoute` in `appRenderer.ts`).
- **Phase 2 (listing):** the content ux loads the route; it resolves to the CRUD listing —
  `backend/shared/core/.../infra/declarative/orchestrators/crud/routeresolvers/ListRouteResolver.java`
  (consumes `/things`, leaves the `/t3` tail), `CapabilityCrud.java` / `Crud.java`. The listing
  renders via `mateu-table-crud.ts`.
- **Phase 3 (detail):** the `/t3` tail is resolved to the record — `CrudNavigationAdjuster.java`
  (rewrites the route for `view`/`edit`) and the `mateu-table-crud.ts` detail path
  (`rowRoute.ts` → `navigateToRoute`). This is the extra load that re-requests the route to open
  the record.

The surplus that reads as a "reload" is phases 2→3 (and, behind a shell, the extra top-ux hop):
the listing is brought up and then the record view replaces it, each as its own authoritative
load + paint.

## Candidate fixes (for the framework owner to choose — each has real blast radius)

1. **Resolve a record deep-link straight to the detail, server-side, in one load** — when the route
   tail identifies a record of a `Navigable` CRUD, return the detail as the content load instead of
   the listing-then-detail two-step. Risk: back-navigation to the list, master-detail (`SPLIT`)
   layouts that show list + detail together, and listings whose detail needs list context.
2. **Lazy the listing search when the cold route opens a record** — keep the CRUD structure but skip
   the list data fetch until the detail is closed / the list pane is shown. Risk: `SPLIT` layouts,
   filters/URL state restore.
3. **Coalesce same-route authoritative loads in the client** — if a `<mateu-ux>` is about to fire an
   authoritative load for a route whose detail load is already in flight (phase 3 superseding phase
   2), drop the superseded one. Risk: dropping a load that carried different `consumedRoute`/state.

All three touch the CRUD cold-load path that EVERY listing/CRUD/master-detail/back-nav in Mateu
rides, so any of them needs broad e2e coverage before shipping — which is why it is characterized
here rather than patched in passing.

## Repro + guard

- Repro harness: `e2e/sut/apps/fed-{remote,shell}-app` (:8085 / :8084), UI in
  `e2e/sut/modules/federation-{remote,shell}-ui`. A record deep-link is `/remote/things/t3`
  (`RemoteThings` is a `Navigable` listing). The remote alone reproduces it (no shell needed).
- Guard test: `e2e/tests/federation/remote-record-deeplink-load-count.spec.ts` — a passing
  characterization that records today's load count, plus a `test.fixme` that asserts the **target**
  (the record route loads once). When a fix above lands, drop `.fixme` to turn it into the
  regression guard.
