package io.mateu.core.infra.declarative;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.getIdField;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.toView;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.ActionOnRowActionHandler.handleActionOnRow;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.ActionOnViewActionHandler.handleActionOnView;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.SearchOnFieldActionHandler.handleSearchOnField;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.data.UICommand.pushStateToHistory;

import io.mateu.core.infra.declarative.crudorchestrator.ListComponentLayer;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.*;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class CrudOrchestrator<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends ListComponentLayer<View, Editor, CreationForm, Filters, Row, IdType>
    implements ActionHandler, ActionSupplier, DtoSupplier {

  String xx = "hola";
  String _route = "";
  String _componentRoute = "";
  String instant = "";

  @Override
  public String route() {
    return _route;
  }

  @Override
  public void setRouteTo(String route) {
    _route = route;
  }

  @Override
  public void setComponentRouteTo(String route) {
    _componentRoute = route;
  }

  public boolean oneToOne() {
    return false;
  }

  public Object parentId() {
    return null;
  }

  private static final List<CrudActionHandler> CRUD_ACTION_HANDLERS =
      List.of(
          new CreateActionHandler(),
          new SaveActionHandler(),
          new DeleteActionHandler(),
          new CancelEditActionHandler(),
          new CancelViewActionHandler(),
          new CancelCreateActionHandler(),
          new ViewActionHandler(),
          new EditActionHandler(),
          new NewActionHandler());

  @Override
  public List<String> supportedActions() {
    return List.of();
    /*
    return List.of(
        "action-on-row-",
        "action-on-view-",
        "search-",
        "view",
        "edit",
        "new",
        "search",
        "create",
        "save",
        "delete",
        "cancel-edit",
        "cancel-view",
        "cancel-create");

       */
  }

  @SneakyThrows
  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
      instant = UUID.randomUUID().toString();
    if (actionId.startsWith("action-on-row-")) {
      return handleActionOnRow(this, actionId, httpRequest);
    }
    if (actionId.startsWith("action-on-view-")) {
      return handleActionOnView(this, actionId, httpRequest);
    }
    if (actionId.startsWith("search-")) {
      return handleSearchOnField(this, actionId, httpRequest);
    }

    // Resolve initial savedId from component state when already in view/edit mode
    Object savedId = null;
    if ("view".equals(httpRequest.runActionRq().componentState().get("_state"))
        || "edit".equals(httpRequest.runActionRq().componentState().get("_state"))) {
      var idField = getIdFieldForRow();
      savedId = httpRequest.getComponentState(Map.class).get(idField);
    }

    // Apply the matching CRUD action handler (create, save, delete, cancel-*)
    var result = CrudActionResult.of(actionId, savedId);
    for (var handler : CRUD_ACTION_HANDLERS) {
      if (handler.supports(actionId)) {
        result = handler.handle(this, result, httpRequest);
        var list = new ArrayList<>();
        setRouteTo(result.route());
        list.add(new State(this));
        list.addAll(result.messages());
        list.add(UICommand.pushStateToHistory(pathForHistory(result.route())));
        list.add(setWindowTitle(httpRequest));
        return list;
      }
    }

    if ("search".equals(actionId)) {
      return handleSearch(httpRequest);
    }

    if (oneToOne()) {
      var parentId = parentId();
      var found =
          ((CompositionCrudRepository) adapter())
              .search(null, null, parentId, new Pageable(0, 10, List.of()));
      if (found.page().totalElements() == 0) {
        if (readOnly()) {
          return new Text("No element.");
        } else {
          return new VerticalLayout(
              new Text("No element yet. Click on New to create one."),
              Button.builder().label("New").actionId("" + "-new").build());
        }
      } else {
        var entity = found.page().content().get(0);
        var idFieldName = getIdField(entity.getClass());
        var id = getValue(getFieldByName(entity.getClass(), idFieldName), entity);
        var view = view((IdType) id, httpRequest);
        if (childCrud()) {
          return List.of(view);
        }
        return List.of(
            view,
            pushStateToHistory(getCrudRoute(httpRequest, id) + "/" + id),
            setWindowTitle(httpRequest));
      }
    } else {
      throw new RuntimeException("Action not supported: " + actionId);
    }
  }

  private String pathForHistory(String route) {
    if ("/list".equals(route)) {
      return _componentRoute;
    }
    return _componentRoute + route;
  }

  private Object handleSearch(HttpRequest httpRequest) {
    String searchText = (String) httpRequest.runActionRq().componentState().get("searchText");
    Pageable pageable =
        new Pageable(
            (Integer) httpRequest.runActionRq().componentState().get("page"),
            (Integer) httpRequest.runActionRq().componentState().get("size"),
            (List<Sort>) httpRequest.runActionRq().componentState().get("sort"));
    if (searchText == null) {
      searchText = "";
    }
    return new Data(Map.of("crud", search(searchText, null, pageable, httpRequest)));
  }

  private UICommand setWindowTitle(HttpRequest httpRequest) {
    return new UICommand(UICommandType.SetWindowTitle, httpRequest.getAttribute("windowTitle"));
  }

  public String getIdFieldForRow() {
    return getIdField(viewClass());
  }

  public Object save(HttpRequest httpRequest) {
    Object savedId;
    var view = toView(httpRequest, editorClass());
    view.save(httpRequest);
    savedId = view.id();
    return savedId;
  }

  public Object saveNew(HttpRequest httpRequest) {
    Object savedId;
    var view = toView(httpRequest, creationFormClass());
    savedId = view.create(httpRequest);
    return savedId;
  }

  public static int getIndex(List<Map<String, Object>> list, Object rowNumber) {
    for (int i = 0; i < list.size(); i++) {
      if (rowNumber.equals(list.get(i).get("_rowNumber"))) {
        return i;
      }
    }
    throw new RuntimeException("Item with row number " + rowNumber + " not found");
  }

  public ListingData<Row> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
    return adapter().search(searchText, filters, pageable, httpRequest);
  }

  @Override
  public ComponentDto dto(HttpRequest httpRequest) {
    return wrapRoute((String) httpRequest.getAttribute("resolvedPath"), httpRequest);
  }

  @Override
  public ServerSideComponentDto wrapRoute(String route, HttpRequest httpRequest) {
    httpRequest.setAttribute("mediator", true);
    var consumedRoute = (String) httpRequest.getAttribute("resolvedPath");
    if (!route.equals(consumedRoute)) setRouteTo(route.substring(consumedRoute.length()));
    return wrap(
        App.builder()
            .homeRoute(route)
            .serverSideType(getClass().getName())
            .homeConsumedRoute(consumedRoute)
            .variant(AppVariant.MEDIATOR)
            .style("width: 100%;")
            .build(),
        this,
        (String) httpRequest.getAttribute("baseUrl"),
        consumedRoute,
        consumedRoute,
        null,
        httpRequest);
  }
}
