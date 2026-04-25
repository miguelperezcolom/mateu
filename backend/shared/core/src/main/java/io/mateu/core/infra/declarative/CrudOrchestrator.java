package io.mateu.core.infra.declarative;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.getIdField;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.toView;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.ActionOnRowActionHandler.handleActionOnRow;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.ActionOnViewActionHandler.handleActionOnView;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.SearchActionHandler.handleSearchOnField;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.data.UICommand.pushStateToHistory;

import io.mateu.core.infra.declarative.crudorchestrator.ListComponentLayer;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.CancelCreateActionHandler;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.CancelEditActionHandler;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.CancelViewActionHandler;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.CreateActionHandler;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.CrudActionHandler;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.CrudActionResult;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.DeleteActionHandler;
import io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.SaveActionHandler;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
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
    implements ActionHandler, ActionSupplier, ComponentTreeSupplier {

  String _state = "";
  Map<String, Object> _show_detail = new HashMap<>();
  Map<String, Object> _editing = new HashMap<>();

  @Override
  public String state() {
    return _state;
  }

  @Override
  public void setStateTo(String state) {
    _state = state;
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
          new CancelCreateActionHandler());

  @SneakyThrows
  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
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
        break;
      }
    }
    actionId = result.actionId();
    savedId = result.savedId();

    updateRegisteredRoute(savedId, httpRequest);

    if ("view".equals(actionId)) {
      return Stream.concat(handleView(httpRequest, savedId).stream(), result.messages().stream())
          .toList();
    }
    if ("edit".equals(actionId)) {
      return handleEdit(httpRequest);
    }
    if ("new".equals(actionId)) {
      return handleNew(httpRequest);
    }
    if ("search".equals(actionId)) {
      return handleSearch(httpRequest);
    }

    if (oneToOne()) {
      _show_detail = new HashMap<>();
      _editing = new HashMap<>();
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
      var list = list(httpRequest);
      var listDto =
          wrap(
              list,
              this,
              "base_url",
              httpRequest.runActionRq().route(),
              httpRequest.runActionRq().consumedRoute(),
              httpRequest.runActionRq().initiatorComponentId(),
              httpRequest);
      if (childCrud()) {
        return listDto;
      }
      return List.of(
          listDto,
          pushStateToHistory(getCrudRoute(httpRequest, savedId)),
          setWindowTitle(httpRequest));
    }
  }

  private void updateRegisteredRoute(Object id, HttpRequest httpRequest) {
    var registeredRoute = (String) httpRequest.getAttribute("resolvedRoute");
    if (registeredRoute != null) {
      if (id != null && registeredRoute.endsWith(id.toString() + "/edit")) {
        registeredRoute = registeredRoute.substring(0, registeredRoute.lastIndexOf("/"));
      }
      if (id != null && registeredRoute.endsWith(id.toString())) {
        registeredRoute = registeredRoute.substring(0, registeredRoute.lastIndexOf("/"));
      }
      httpRequest.setAttribute("registeredRoute", registeredRoute);
    }
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

  private List<?> handleNew(HttpRequest httpRequest) {
    _show_detail = new HashMap<>();
    _editing = new HashMap<>();
    var create = create(httpRequest);
    if (childCrud()) {
      return List.of(create);
    }
    return List.of(
        create,
        pushStateToHistory(getCrudRoute(httpRequest, null) + "/new"),
        setWindowTitle(httpRequest));
  }

  private UICommand setWindowTitle(HttpRequest httpRequest) {
    return new UICommand(UICommandType.SetWindowTitle, httpRequest.getAttribute("windowTitle"));
  }

  private List<?> handleEdit(HttpRequest httpRequest) {
    _show_detail = new HashMap<>();
    _editing = new HashMap<>();
    var idField = getIdFieldForRow();
    var id = (IdType) httpRequest.runActionRq().componentState().get(idField);

    var edit = edit(id, httpRequest);
    if (childCrud()) {
      return List.of(edit);
    }
    return List.of(
        edit,
        pushStateToHistory(getCrudRoute(httpRequest, id) + "/" + id + "/edit"),
        setWindowTitle(httpRequest));
  }

  private List<?> handleView(HttpRequest httpRequest, Object savedId) {
    _show_detail = new HashMap<>();
    _editing = new HashMap<>();
    var idField = getIdFieldForRow();
    var id = savedId != null ? "" + savedId : getIdForView(httpRequest, idField);
    var view = view(toId(id), httpRequest);
    if (childCrud()) {
      return List.of(view);
    }
    return List.of(
        view,
        pushStateToHistory(getCrudRoute(httpRequest, id) + "/" + id),
        setWindowTitle(httpRequest));
  }

  private String getIdForView(HttpRequest httpRequest, String idField) {
    if (httpRequest.runActionRq().parameters() != null
        && httpRequest.runActionRq().parameters().get(idField) != null) {
      return (String) httpRequest.runActionRq().parameters().get(idField);
    }
    if (httpRequest.runActionRq().componentState().get("id") != null) {
      return (String) httpRequest.runActionRq().componentState().get("id");
    }
    var path = httpRequest.path().replaceAll("/view", "");
    return path.substring(path.lastIndexOf("/") + 1);
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
  public Component component(HttpRequest httpRequest) {
    return list(httpRequest);
  }
}
