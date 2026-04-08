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
      var crudRoute = getCrudRoute(httpRequest);
      var actionId = route.substring(crudRoute.length());
      if (actionId.startsWith("/")) {
        actionId = actionId.substring(1);
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

  public String getCrudRoute(HttpRequest httpRequest) {
      return (String) httpRequest.getAttribute("resolvedRoute");
    //return "/" + httpRequest.runActionRq().route().split("/")[1];
  }
}
