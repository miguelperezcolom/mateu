package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getFormColumns;
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
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
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
      List.of(new SearchActionHandler(),
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
              new ActionOnViewActionHandler()

      );

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
          var list = new ArrayList<>();
          setRouteTo(result.route()); // aquí controlamos la navegación
          list.add(new State(this));
          if (result.targetComponentId() != null) {
            httpRequest.setAttribute("targetComponentId", result.targetComponentId());
          }
          if (result.data() != null) {
            list.add(result.data());
          }
          if (result.state() != null) {
            list.add(result.state());
          }
          list.addAll(result.messages());
          if (result.actionToRun() != null) {
            list.add(UICommand.runAction(result.actionToRun(), result.targetComponentId() != null?result.targetComponentId():httpRequest.runActionRq().initiatorComponentId()));
          }
          list.add(UICommand.pushStateToHistory(pathForHistory(result.route())));
          list.add(setWindowTitle(httpRequest));
          /*
          if ("/list".equals(result.route())) {
              list.add(
                      UICommand.runAction(
                              "search",
                              "ux_"
                                      + httpRequest
                                      .runActionRq()
                                      .initiatorComponentId()
                                      .substring(
                                              0,
                                              httpRequest.runActionRq().initiatorComponentId().length()
                                                      - "_app".length())
                                      + "_cs_list"));
          }
           */
          return list;
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

  public void addButtonsToList(ArrayList<UserTrigger> toolbar) {
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
    if (getClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    if (viewClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    return false;
  }

  public Class<?> viewClass() {
    return getGenericClass(
        this.getClass(),
        CrudOrchestrator.class,
        "View");
  }

  public String title() {
    if (getClass().isAnnotationPresent(Title.class)) {
      return getClass().getAnnotation(Title.class).value();
    }
    return toUpperCaseFirst(getClass().getSimpleName());
  }

  public String getStyleForList(List<GridContent> columns) {
    if (getClass().isAnnotationPresent(Style.class)) {
      return getClass().getAnnotation(Style.class).value();
    }
    return columns.size() > 5 ? "width: 100%;" : StyleConstants.CONTAINER;
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
    return getGenericClass(
        this.getClass(),
        CrudOrchestrator.class,
        "Filters");
  }

  public Class<Row> rowClass() {
    return getGenericClass(
        this.getClass(),
        CrudOrchestrator.class,
        "Row");
  }

  public Class<?> entityClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "EntityType");
  }

  public Object view(IdType id, HttpRequest httpRequest) {
    return adapter().getView(id, httpRequest);
  }

  public String getStyleForView() {
    if (viewClass().isAnnotationPresent(Style.class)) {
      return viewClass().getAnnotation(Style.class).value();
    }
    if (getClass().isAnnotationPresent(Style.class)) {
      return getClass().getAnnotation(Style.class).value();
    }
    return getFormColumns(viewClass()) > 2 ? "width: 100%;" : "max-width:900px;margin: auto;";
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
    var actions = new ArrayList<Action>();
    if (httpRequest.getAttribute("mediator") != null) {
      actions.add(Action.builder().id("delete").build());
      actions.add(Action.builder().id("save").build());
      actions.add(Action.builder().id("create").build());
      actions.add(Action.builder().id("new").build());
      actions.add(Action.builder().id("view").build());
      actions.add(Action.builder().id("edit").build());
      actions.add(Action.builder().id("cancel-create").build());
      actions.add(Action.builder().id("cancel-view").build());
      actions.add(Action.builder().id("cancel-edit").build());
      actions.add(Action.builder().id("cancel-new").build());
      actions.add(Action.builder().id("action-on-row-*").build());
      actions.add(Action.builder().id("action-on-view-*").build());
    }
    if (httpRequest.getAttribute("list") != null) {
      actions.add(Action.builder().id("search").build());
      actions.add(
          Action.builder()
              .id("delete")
              .confirmationRequired(true)
              .rowsSelectedRequired(true)
              .bubble(true)
              .build());
      getAllMethods(getClass()).stream()
          .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
          .forEach(
              method -> {
                actions.add(
                    Action.builder()
                        .id("action-on-row-" + method.getName())
                        .confirmationRequired(
                            method.getAnnotation(ListToolbarButton.class).confirmationRequired())
                        .rowsSelectedRequired(
                            method.getAnnotation(ListToolbarButton.class).rowsSelectedRequired())
                        .bubble(true)
                        .build());
              });
    }
    if (httpRequest.getAttribute("view") != null) {
      getAllMethods(getClass()).stream()
          .filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
          .forEach(
              method -> {
                actions.add(
                    Action.builder()
                        .id("action-on-view-" + method.getName())
                        .confirmationRequired(
                            method.getAnnotation(ViewToolbarButton.class).confirmationRequired())
                        .bubble(true)
                        .build());
              });
    }

    return actions;
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
      triggers.add(
          switch (annotation.type()) {
            case OnLoad ->
                new OnLoadTriggerDto(
                    annotation.actionId(),
                    annotation.timeoutMillis(),
                    annotation.times(),
                    annotation.condition());
            case OnSuccess ->
                new OnSuccessTriggerDto(
                    annotation.actionId(),
                    annotation.calledActionId(),
                    annotation.condition(),
                    annotation.timeoutMillis());
            case OnError ->
                new OnErrorTriggerDto(
                    annotation.actionId(), annotation.calledActionId(), annotation.condition());
            case OnValueChange ->
                new OnValueChangeTriggerDto(
                    annotation.actionId(), annotation.calledActionId(), annotation.condition());
            case OnCustomEvent ->
                new OnCustomEventTriggerDto(
                    annotation.actionId(), annotation.eventName(), annotation.condition());
            case OnEnter -> new OnEnterTriggerDto(annotation.actionId(), annotation.condition());
          });
    }

    return triggers;
  }
}
