package io.mateu.core.infra.declarative.crudorchestrator;

import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class RouteHandlerLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends BaseLayer<View, Editor, CreationForm, Filters, Row, IdType> implements RouteHandler {

  @Override
  public Object handleRoute(String route, HttpRequest httpRequest) {
    log.info("route is {}", route);
    if (httpRequest.runActionRq().actionId() == null
        || "".equals(httpRequest.runActionRq().actionId())) {
      var crudRoute = getCrudRoute(httpRequest, null);
      var cleanRoute = route;
      if (cleanRoute.startsWith(httpRequest.runActionRq().consumedRoute())) {
        cleanRoute = route.substring(httpRequest.runActionRq().consumedRoute().length());
      }
      var actionId =
          (cleanRoute.length() >= crudRoute.length())
              ? cleanRoute.substring(crudRoute.length())
              : cleanRoute;
      if (actionId.startsWith("/")) {
        actionId = actionId.substring(1);
      }
      if (actionId.contains("?")) {
        actionId = actionId.substring(0, actionId.indexOf("?"));
      }
      if (!"".equals(actionId)) {
        if ("new".equals(actionId)) {
          return create(httpRequest);
        }
        if (actionId.endsWith("edit")) {
          return edit(toId(actionId.split("/")[0]), httpRequest);
        }
        return view(toId(actionId), httpRequest);
      }
    }
    return this;
  }

  public String getCrudRoute(HttpRequest httpRequest, Object id) {
    var registeredRoute = (String) httpRequest.getAttribute("resolvedPath");
    if (registeredRoute != null) {
      return registeredRoute;
    }
    registeredRoute = (String) httpRequest.getAttribute("resolvedRoute");
    if (registeredRoute != null) {
      if (id != null && registeredRoute.endsWith(id.toString() + "/edit")) {
        registeredRoute = registeredRoute.substring(0, registeredRoute.lastIndexOf("/"));
      }
      if (id != null && registeredRoute.endsWith(id.toString())) {
        registeredRoute = registeredRoute.substring(0, registeredRoute.lastIndexOf("/"));
      }
      return registeredRoute;
    }
    var route = httpRequest.runActionRq().route();
    if (route.startsWith(httpRequest.runActionRq().consumedRoute())) {
      route = route.substring(httpRequest.runActionRq().consumedRoute().length());
    }
    if (route.contains("/")) {
      return "/" + route.split("/")[1];
    }
    return route;
  }
}
