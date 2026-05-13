package io.mateu.core.infra.declarative.crudorchestrator;

import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import lombok.extern.slf4j.Slf4j;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;

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
    log.info("route is {}, action is {}", route, httpRequest.runActionRq().actionId());
    try {

        if (httpRequest.runActionRq().actionId() == null
          || "".equals(httpRequest.runActionRq().actionId())) {

          if (!getClass().getName().equals(httpRequest.runActionRq().serverSideType())) {
              return wrapRoute(route, httpRequest);
          }

          if (route.endsWith("/new")) {
              return create(httpRequest);
          }

            if (route.endsWith("/list")) {
                return list(httpRequest);
            }

          if (route.endsWith("/edit")) {
              return edit(toId(route), httpRequest);
          }

          if (route.equals(httpRequest.runActionRq().consumedRoute())) {
              httpRequest.setAttribute("list", true);
              return wrap((Component) list(httpRequest),
                      this,
                      (String) httpRequest.getAttribute("baseUrl"),
                      httpRequest.runActionRq().consumedRoute(),
                      httpRequest.runActionRq().consumedRoute(),
                      null, httpRequest
              );
          }

          return view(toId(route), httpRequest);
      }
    } catch (Throwable e) {
      return "route not found:" + route;
    }
    return this;
  }

  public String getCrudRoute(HttpRequest httpRequest, Object id) {
    var registeredRoute = (String) httpRequest.getAttribute("resolvedPath");
    if (registeredRoute != null) {
      if (id != null && registeredRoute.endsWith("/" + id + "/edit")) {
        registeredRoute = registeredRoute.substring(0, registeredRoute.lastIndexOf("/" + id));
      }
      if (id != null && registeredRoute.endsWith("/" + id)) {
        registeredRoute = registeredRoute.substring(0, registeredRoute.lastIndexOf("/" + id));
      }
      if (registeredRoute.endsWith("/new")) {
        registeredRoute = registeredRoute.substring(0, registeredRoute.lastIndexOf("/new"));
      }
      return registeredRoute;
    }
    registeredRoute = (String) httpRequest.getAttribute("registeredRoute");
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
      if (id == null && registeredRoute.endsWith("/new")) {
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
