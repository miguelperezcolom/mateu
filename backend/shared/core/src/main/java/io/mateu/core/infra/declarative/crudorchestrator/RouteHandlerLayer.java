package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.infra.declarative.crudorchestrator.DataLayer.addData;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.fluent.Component;
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
    log.info("route is {}, action is {}", route, httpRequest.runActionRq().actionId());
    try {

      // hande route if no action
      if (httpRequest.runActionRq().actionId() == null
          || "".equals(httpRequest.runActionRq().actionId())) {

        // if this is a first time, we return the mediator app
        if (!getClass().getName().equals(httpRequest.runActionRq().serverSideType())) {
          var componentRoute = (String) httpRequest.getAttribute("resolvedPath");
          if (componentRoute == null) {
            componentRoute = (String) httpRequest.getAttribute("resolvedRoute");
              httpRequest.setAttribute("resolvedPath", componentRoute);
          }
          setComponentRouteTo(componentRoute);
          setRouteTo(
              httpRequest.runActionRq().route().startsWith(componentRoute)
                  ? httpRequest
                      .runActionRq()
                      .route()
                      .substring(getConsumedRoute(httpRequest).length())
                  : "");
          return this;
        }

        if (route.endsWith("/list")) {
          return wrapView("list", this, list(httpRequest), httpRequest);
        }

        if (route.endsWith("/new")) {
          return wrapView(
              "new", adapter().getCreationForm(httpRequest), create(httpRequest), httpRequest);
        }

        if (route.endsWith("/edit")) {
          route = route.substring(0, route.lastIndexOf("/edit"));
          var id = route.substring(httpRequest.runActionRq().consumedRoute().length() + 1);
          return wrapView(
              "edit",
              adapter().getEditor(toId(id), httpRequest),
              edit(toId(id), httpRequest),
              httpRequest);
        }

        if (route.equals(getConsumedRoute(httpRequest))) {
          return wrapView("list", this, list(httpRequest), httpRequest);
        }

        var id = route.substring(getConsumedRoute(httpRequest).length() + 1);
        return wrapView(
            "/" + id,
            adapter().getView(toId(id), httpRequest),
            view(toId(id), httpRequest),
            httpRequest);
      }
    } catch (Throwable e) {
      e.printStackTrace();
      return Message.builder()
          .variant(NotificationVariant.error)
          .title(e.getClass().getSimpleName())
          .text(e.getMessage())
          .build();
    }
    // action handler will be called
    return this;
  }

  private String getConsumedRoute(HttpRequest httpRequest) {
    if (getComponentRoute() != null && !getComponentRoute().isEmpty()) {
      return getComponentRoute();
    }
    return httpRequest.runActionRq().consumedRoute();
  }

  private Object wrapView(
      String viewName, Object modelView, Component component, HttpRequest httpRequest) {
    httpRequest.setAttribute(viewName, true);
    if (modelView instanceof AutoNamedView<?> autoNamedView) {
      modelView = autoNamedView.entity();
    }
    addData(modelView, httpRequest);
    return wrap(
            component,
            modelView,
            (String) httpRequest.getAttribute("baseUrl"),
            getConsumedRoute(httpRequest),
            getConsumedRoute(httpRequest),
            null,
            httpRequest)
        .withId(httpRequest.runActionRq().initiatorComponentId() + "_" + viewName);
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
    if (route.startsWith(getConsumedRoute(httpRequest))) {
      route = route.substring(httpRequest.runActionRq().consumedRoute().length());
    }
    if (route.contains("/")) {
      return "/" + route.split("/")[1];
    }
    return route;
  }
}
