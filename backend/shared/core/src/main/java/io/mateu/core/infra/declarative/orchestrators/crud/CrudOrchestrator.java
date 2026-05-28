package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapToTrigger;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.ViewOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.ActionOnRowActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.ActionOnViewActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CancelEditActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CancelNewActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CancelViewActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CreateActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CrudOrchestratorActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.DeleteEditActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.EditActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.NewActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.SaveActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.SearchActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.ViewActionHandler;
import io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.*;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.*;
import java.util.ArrayList;
import java.util.List;

public abstract class CrudOrchestrator<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends ViewOrchestrator {

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
      if (actionHandler.supports(actionId, httpRequest)) {
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
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "View");
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

  public abstract CrudAdapter<View, Editor, CreationForm, Filters, Row, IdType> adapter();

  public Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Filters");
  }

  public Class<Row> rowClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Row");
  }

  public Class<?> entityClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "EntityType");
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
  public List<TriggerDto> triggers(String viewName, HttpRequest httpRequest) {
    var triggers = new ArrayList<TriggerDto>();
    if (httpRequest.getAttribute("list") != null) {
      triggers.add(new OnLoadTriggerDto("search", 0, 1, null));
      /*
      triggers.add(new OnSuccessTrigger("search", "create", ""));
      triggers.add(new OnSuccessTrigger("search", "delete", ""));
      triggers.add(new OnSuccessTrigger("search", "save", ""));
      triggers.add(new OnSuccessTrigger("search", "cancel-view", ""));
      triggers.add(new OnSuccessTrigger("search", "cancel-create", ""));
      getAllMethods(getClass()).stream()
          .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
          .forEach(
              method -> {
                triggers.add(
                    new OnSuccessTrigger("search", "action-on-row-" + method.getName(), ""));
              });
       */
    }

    for (io.mateu.uidl.annotations.Trigger annotation :
        getClass().getAnnotationsByType(io.mateu.uidl.annotations.Trigger.class)) {
      triggers.add(mapToTrigger(annotation));
    }

    return triggers;
  }
}
