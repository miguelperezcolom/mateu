package io.mateu.core.application.runaction;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.SneakyThrows;

/** Adjusts a {@link RunActionCommand} before route resolution for CRUD navigation actions. */
@Named
@Singleton
public class CrudNavigationAdjuster {

  public record AdjustedCommand(RunActionCommand command, boolean routeFirst) {}

  /**
   * When a Crud handles a "view", "edit", "new", or "cancel-view" action, the route
   * must be pre-adjusted so the correct sub-route resolves. Returns routeFirst=true to signal that
   * route resolution should be attempted before falling back to the known serverSideType.
   */
  @SneakyThrows
  AdjustedCommand adjust(RunActionCommand command) {
    if (command.serverSideType() == null || command.serverSideType().isEmpty()) {
      return new AdjustedCommand(command, false);
    }
    var type = Class.forName(command.serverSideType());
    if (!Crud.class.isAssignableFrom(type)) {
      return new AdjustedCommand(command, false);
    }

    if ("view".equals(command.actionId())) {
      var idField = command.componentState().get("idFieldForRow");
      if (idField != null && command.httpRequest().runActionRq().parameters() != null) {
        var id = command.httpRequest().runActionRq().parameters().get(idField);
        if (id != null) {
          command.httpRequest().setAttribute("oldRoute", command.route());
          command = command.withRoute(command.route() + "/" + id);
          command.httpRequest().setAttribute("updateUrl", command.route());
          return new AdjustedCommand(command, true);
        }
      }
    }

    if ("edit".equals(command.actionId())) {
      var idField = command.componentState().get("idFieldForRow");
      if (idField != null && command.httpRequest().runActionRq().parameters() != null) {
        var id = command.httpRequest().runActionRq().componentState().get(idField);
        if (id != null) {
          var baseRoute = command.route();
          if (baseRoute.endsWith("/" + id)) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/" + id));
          }
          command.httpRequest().setAttribute("oldRoute", baseRoute);
          command = command.withRoute(baseRoute + "/" + id + "/edit");
          command.httpRequest().setAttribute("updateUrl", command.route());
          return new AdjustedCommand(command, true);
        }
      }
    }

    if ("new".equals(command.actionId())) {
      var baseRoute = command.route();
      var idFieldName =
          command.componentState() != null
              ? (String) command.componentState().get("idFieldForRow")
              : null;
      if (idFieldName != null) {
        var id = command.componentState().get(idFieldName);
        if (id != null) {
          if (baseRoute.endsWith("/edit")) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/edit"));
          }
          if (baseRoute.endsWith("/" + id)) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/" + id));
          }
        }
      }
      command.httpRequest().setAttribute("oldRoute", baseRoute);
      // Set resolvedPath so getCrudRoute strips "/new" and returns the correct base route,
      // regardless of whether findRouteResolver or instantiateWithKnownType is used.
      command.httpRequest().setAttribute("resolvedPath", baseRoute + "/new");
      command = command.withRoute(baseRoute + "/new");
      return new AdjustedCommand(command, true);
    }

    if ("cancel-view".equals(command.actionId())) {
      var baseRoute = command.route();
      var idFieldName = (String) command.componentState().get("idFieldForRow");
      if (idFieldName != null) {
        var id = command.componentState().get(idFieldName);
        if (id != null) {
          if (baseRoute.endsWith("/edit")) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/edit"));
          }
          if (baseRoute.endsWith("/" + id)) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/" + id));
          }
        }
      }
      command = command.withRoute(baseRoute);
    }

    return new AdjustedCommand(command, false);
  }
}
