package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.*;
import io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.*;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.*;
import java.util.List;

public abstract class Crud<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends MultiView implements StateSupplier {

  private final List<CrudOrchestratorRouteResolver> routeResolvers =
      List.of(
          new MediatorRouteResolver(),
          new NewRouteResolver(),
          new EditRouteResolver(),
          new ListRouteResolver(),
          new ViewRouteResolver());
  private final List<CrudOrchestratorActionHandler> actionHandlers =
      List.of(
          new SearchActionHandler(),
          new ViewActionHandler(),
          new CancelViewActionHandler(),
          new NewActionHandler(),
          new CancelEditActionHandler(),
          new CancelNewActionHandler(),
          new CreateActionHandler(),
          new DeleteEditActionHandler(),
          new EditActionHandler(),
          new SaveActionHandler(),
          new ActionOnRowActionHandler(),
          new ActionOnViewActionHandler());

  @Override
  protected OrchestrationResult resolveInternalRoute(String route, HttpRequest httpRequest) {
    for (CrudOrchestratorRouteResolver routeResolver : routeResolvers) {
      if (routeResolver.supports(route, httpRequest, this)) {
        return routeResolver.resolve(route, httpRequest, this);
      }
    }
    throw new UnsupportedOperationException(
        route + " not supported by " + getClass().getSimpleName());
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    for (CrudOrchestratorActionHandler actionHandler : actionHandlers) {
      if (actionHandler.supports(actionId, httpRequest, this)) {
        var output = actionHandler.handleAction(actionId, httpRequest, this);

        if (output instanceof CrudActionResult result) {
          return CrudActionResultAssembler.assemble(result, this, httpRequest);
        }

        return output;
      }
    }
    throw new UnsupportedOperationException(
        actionId + " not supported by " + getClass().getSimpleName());
  }

  public Object list(HttpRequest httpRequest) {
    return this;
  }

  public void addButtonsToList(List<UserTrigger> toolbar) {
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
        .forEach(
            method -> {
              toolbar.add(
                  Button.builder()
                      .label(toUpperCaseFirst(method.getName()))
                      .actionId("action-on-row-" + method.getName())
                      .build());
            });
  }

  public boolean readOnly() {
    return CrudOrchestratorMetadata.readOnly(this);
  }

  public Class<?> viewClass() {
    return getGenericClass(this.getClass(), Crud.class, "View");
  }

  public String title() {
    return CrudOrchestratorMetadata.title(this);
  }

  public String getStyleForList(List<GridContent> columns) {
    return CrudOrchestratorMetadata.getStyleForList(this, columns);
  }

  public boolean searchable() {
    return true;
  }

  public boolean selectionEnabled() {
    return true;
  }

  public abstract String toId(String id);

  public abstract CrudAdapter<Editor, CreationForm, Filters, Row, IdType> adapter();

  public Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), Crud.class, "Filters");
  }

  public Class<Row> rowClass() {
    return getGenericClass(this.getClass(), Crud.class, "Row");
  }

  public Class<?> entityClass() {
    return getGenericClass(this.getClass(), Crud.class, "EntityType");
  }

  public Object view(IdType id, HttpRequest httpRequest) {
    return adapter().getView(id, httpRequest);
  }

  public String getStyleForView() {
    return CrudOrchestratorMetadata.getStyleForView(this);
  }

  public Object edit(IdType id, HttpRequest httpRequest) {
    return adapter().getEditor(id, httpRequest);
  }

  public abstract Class<Editor> editorClass();

  public abstract Class<CreationForm> creationFormClass();

  public abstract Object save(HttpRequest httpRequest);

  public abstract Object saveNew(HttpRequest httpRequest);

  public abstract String getIdFieldForRow();

  @Override
  public List<String> supportedActions() {
    return List.of();
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    return CrudActionsBuilder.buildActions(this, httpRequest);
  }

  public abstract Object search(
      String searchText, Object filters, Pageable pageable, HttpRequest httpRequest);

  @Override
  public List<Trigger> triggers(String viewName, HttpRequest httpRequest) {
    return CrudTriggersBuilder.build(this, viewName, httpRequest);
  }

  @Override
  protected AppLayout layout() {
    if (getClass().isAnnotationPresent(SplitCrud.class)) {
      return AppLayout.SPLIT;
    }
    return super.layout();
  }

  @Override
  public Object state(HttpRequest httpRequest) {
    var map = io.mateu.core.infra.declarative.FormViewModel.toMap(this);
    var route = httpRequest.runActionRq().route();
    if (route.contains("?")) {
      var params = route.substring(route.indexOf("?") + 1);
      var tokens = params.split("&");
      for (var token : tokens) {
        var key = token.substring(0, token.indexOf("="));
        var value = token.substring(token.indexOf("=") + 1);
        map.put(key, value);
      }
    }
    return map;
  }
}
