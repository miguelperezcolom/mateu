package io.mateu.mdd.demofrontoffice.ui.common;

import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;

/**
 * Mounts a routed view as an INDEPENDENT island inside a host page — the master-detail right pane
 * of the queue screens. Emits the same MEDIATOR {@link AppShell} shape the framework uses for
 * embedded orchestrator fields: the frontend mounts its own {@code <mateu-ux>} bound to the route,
 * so the detail loads and acts on its own without affecting the host. The
 * {@code _embeddedMediator=1} marker keeps the island from clobbering the window title (and lets
 * the loaded view detect it runs embedded); {@code GuestHeaders.idFromRoute} strips it.
 */
public final class DetailIsland {

  public static Component of(String route, Class<?> type) {
    var marked = route + (route.contains("?") ? "&" : "?") + "_embeddedMediator=1";
    return AppShell.builder()
        // stable per route: re-renders of the host keep the island alive; a new selection
        // (different route) mounts a fresh island
        .clientSideComponentId("island" + route.replaceAll("[^A-Za-z0-9]", "_"))
        .serverSideType(type.getName())
        .homeServerSideType(type.getName())
        .homeRoute(marked)
        .homeConsumedRoute(route)
        .homeBaseUrl("")
        .route(route)
        .variant(AppVariant.MEDIATOR)
        .style("flex: 1 1 0; min-width: 0;")
        .build();
  }

  private DetailIsland() {}
}
