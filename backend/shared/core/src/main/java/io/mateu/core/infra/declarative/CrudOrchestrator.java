package io.mateu.core.infra.declarative;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.getIdField;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.toView;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.ActionOnRowActionHandler.handleActionOnRow;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.ActionOnViewActionHandler.handleActionOnView;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.FieldCrudActionHandler.handleFieldCrudAction;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.SearchActionHandler.handleSearchOnField;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.data.UICommand.pushStateToHistory;

import io.mateu.core.infra.declarative.crudorchestrator.ListComponentLayer;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;

import java.awt.*;
import java.util.*;
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

    Object savedId = null;
    List<Message> messages = new ArrayList<>();
    if ("create".equals(actionId)) {
      savedId = saveNew(httpRequest);
      messages.add(Message.builder().variant(NotificationVariant.success).text("Item saved successfully").build());
      actionId = "view";
    }
    if ("save".equals(actionId)) {
      savedId = save(httpRequest);
      messages.add(Message.builder().variant(NotificationVariant.success).text("Item saved successfully").build());
      // savedId = getValue(getIdField(viewClass()), entity);
      actionId = "view";
    }
    if ("cancel_edit".equals(actionId)) {
      var idField = getIdFieldForRow();
      savedId = httpRequest.getComponentState(Map.class).get(idField);
      var view = adapter().getEditor((IdType) savedId);
      actionId = "view";
    }
    if ("cancel_view".equals(actionId)) {
      actionId = "";
    }
    if ("cancel_create".equals(actionId)) {
      actionId = "";
    }
    if ("delete".equals(actionId)) {
      List<?> selection =
          (List<?>)
              httpRequest
                  .runActionRq()
                  .componentState()
                  .getOrDefault("crud_selected_items", List.of());
      List<IdType> selectedIds =
          selection.stream()
              .map(map -> (IdType) ((Map<String, Object>) map).get(getIdFieldForRow()))
              .toList();
      adapter().deleteAllById(selectedIds);
    }
    if ("view".equals(actionId)) {
      return Stream.concat(handleView(httpRequest, savedId).stream(), messages.stream()).toList();
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
    if (!"".equals(actionId)) {
      return handleFieldCrudAction(this, actionId, httpRequest, _state, _show_detail, _editing);
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
        return List.of(view, pushStateToHistory(getCrudRoute(httpRequest) + "/" + id));
      }
    } else {
      var list =
          wrap(
              list(httpRequest),
              this,
              "base_url",
              httpRequest.runActionRq().route(),
              httpRequest.runActionRq().consumedRoute(),
              httpRequest.runActionRq().initiatorComponentId(),
              httpRequest);
      if (childCrud()) {
        return list;
      }
      return List.of(list, pushStateToHistory(getCrudRoute(httpRequest)));
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
    return new Data(Map.of("crud", search(searchText, null, pageable)));
  }

  private List<?> handleNew(HttpRequest httpRequest) {
    _show_detail = new HashMap<>();
    _editing = new HashMap<>();
    var create = create(httpRequest);
    if (childCrud()) {
      return List.of(create);
    }
    return List.of(create, pushStateToHistory(getCrudRoute(httpRequest) + "/new"));
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
    return List.of(edit, pushStateToHistory(getCrudRoute(httpRequest) + "/" + id + "/edit"));
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
    return List.of(view, pushStateToHistory(getCrudRoute(httpRequest) + "/" + id));
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

  public int getIndex(List<Map<String, Object>> list, Object rowNumber) {
    for (int i = 0; i < list.size(); i++) {
      if (rowNumber.equals(list.get(i).get("_rowNumber"))) {
        return i;
      }
    }
    throw new RuntimeException("Item with row number " + rowNumber + " not found");
  }

  public ListingData<Row> search(String searchText, Filters filters, Pageable pageable) {
    return adapter().search(searchText, filters, pageable);
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return list(httpRequest);
  }
}
