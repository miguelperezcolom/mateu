package io.mateu.core.application.presence;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.act.ActionRunner;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Map;
import reactor.core.publisher.Flux;

/**
 * The {@value Presence#ACTION_ID} app-level action: a record page reports itself — {@code route},
 * {@code view} (its class), {@code tab}, {@code state} ({@code viewing} | {@code editing} | {@code
 * leave}) — and is answered with a {@code PresenceChanged} command listing the others who have the
 * same record open. An anonymous caller, an app without {@code @App(presence = true)} and a page
 * that is no record (a create page) are answered with nothing.
 */
@Named
@Singleton
public class PresenceActionRunner implements ActionRunner {

  private final io.mateu.core.application.runaction.RouteRegistry routeRegistry;
  private final io.mateu.core.application.security.WireTypePolicy wireTypePolicy;

  @jakarta.inject.Inject
  public PresenceActionRunner(
      io.mateu.core.application.runaction.RouteRegistry routeRegistry,
      io.mateu.core.application.security.WireTypePolicy wireTypePolicy) {
    this.routeRegistry = routeRegistry;
    this.wireTypePolicy = wireTypePolicy;
  }

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return Presence.ACTION_ID.equals(actionId);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var principal = Presence.principalOf(httpRequest);
    if (principal == null || !Presence.enabledFor(instance, command)) {
      return Flux.just(UIIncrementDto.builder().build());
    }
    Map<String, Object> parameters =
        httpRequest.runActionRq() != null && httpRequest.runActionRq().parameters() != null
            ? httpRequest.runActionRq().parameters()
            : Map.of();
    var record = Presence.recordOf(text(parameters.get("route")), text(parameters.get("view")));
    if (record == null
        || !mayOpen(text(parameters.get("route")), text(parameters.get("view")), command)) {
      // a record the caller may not open: they learn nothing about it and are not shown there
      // (GA review S9) — answered exactly like a page that is no record
      return Flux.just(UIIncrementDto.builder().build());
    }
    var scope = Presence.scopeOf(instance, command);
    var tab = text(parameters.get("tab"));
    var state = text(parameters.get("state"));
    Presence.sweep();
    if ("leave".equals(state)) {
      Presence.leave(scope, record, principal, tab);
      return Flux.just(UIIncrementDto.builder().build());
    }
    // the name shown is the authenticated principal's (a PrincipalResolver can make it a full name)
    Presence.touch(scope, record, principal, principal, tab, "editing".equals(state));
    return Flux.just(
        UIIncrementDto.builder()
            .commands(List.of(Presence.command(Presence.snapshot(scope, record, principal))))
            .build());
  }

  /**
   * Whether the caller may open the record: its route is reachable for them (the {@code access:} of
   * the authored entries answering it, as a load would check) and its view is a type the
   * application exposes that they may see (class-level {@code @EyesOnly}, as for any request).
   */
  boolean mayOpen(String route, String view, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    if (routeRegistry != null) {
      if (!routeRegistry.isReachable(route, httpRequest)) {
        return false;
      }
      var mount = io.mateu.core.application.MountPaths.mountOf(command);
      if (!mount.isEmpty()
          && !io.mateu.core.application.MountPaths.startsWithMount(route, mount)
          && !routeRegistry.isReachable(
              io.mateu.core.application.MountPaths.withMount(mount, route), httpRequest)) {
        return false;
      }
    }
    if (wireTypePolicy != null && view != null && !view.isBlank()) {
      try {
        wireTypePolicy.check(view.trim(), route, httpRequest);
      } catch (io.mateu.core.application.security.MateuForbiddenException refused) {
        return false;
      }
    }
    return true;
  }

  private static String text(Object value) {
    return value == null ? null : value.toString();
  }
}
