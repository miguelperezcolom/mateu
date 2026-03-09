package io.mateu.core.infra.declarative;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.getValidations;
import static io.mateu.core.infra.JsonSerializer.*;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.*;
import static io.mateu.core.infra.declarative.CrudAdapterHelper.getIdField;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewModel.createKpis;
import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.data.UICommand.pushStateToHistory;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonVariant;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.ListingType;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CompositionCrudRepository;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.Deleteable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.RuleSupplier;
import io.mateu.uidl.interfaces.StateSupplier;
import io.mateu.uidl.interfaces.ValidationDtoSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class CrudOrchestrator<View, Editor extends CrudEditorForm<IdType>, CreationForm extends CrudCreationForm<IdType>, Filters, Row, IdType>
    implements ActionHandler,
        StateSupplier,
        TriggersSupplier,
        ActionSupplier,
        RouteHandler,
        ValidationDtoSupplier,
        ComponentTreeSupplier,
        RuleSupplier {

  String _state = "";
  Map<String, Object> _show_detail = new HashMap<>();
  Map<String, Object> _editing = new HashMap<>();

  public boolean oneToOne() {
    return false;
  }

  public Object parentId() {
    return null;
  }

  @Override
  public Object state(HttpRequest httpRequest) {
    if (httpRequest.getAttribute("selectedItem") != null) {
      var data = toMap();
      var selectedItem = httpRequest.getAttribute("selectedItem");
      if (selectedItem instanceof StateSupplier stateSupplier) {
        data.putAll(toMap(stateSupplier.state(httpRequest)));
      } else {
        data.putAll(toMap(selectedItem));
      }
      if (httpRequest.getAttribute("new") != null) {
        getAllFields(viewClass()).stream()
                .filter(field -> field.isAnnotationPresent(GeneratedValue.class))
                .forEach(
                        field -> {
                          var generator =
                                  MateuBeanProvider.getBean(field.getAnnotation(GeneratedValue.class).value());
                          var value = generator.generate();
                          data.put(field.getName(), value);
                        });
      }
      addRowNumberForEntityClass(data);
      return data;
    }
    var data = toMap();
    addRowNumberForEntityClass(data);
    return data;
  }

  protected Map<String, Object> toMap() {
    return toMap(this);
  }

  protected Map<String, Object> toMap(Object instance) {
    var map = fromJson(toJson(instance));
    getAllFields(instance.getClass()).stream()
        .filter(
            field ->
                !isBasic(field.getType())
                    && !field.getType().isEnum()
                    && !Collection.class.isAssignableFrom(field.getType())
                    && !Map.class.isAssignableFrom(field.getType())
                    && (instance.getClass().isRecord() || !Modifier.isFinal(field.getModifiers())))
        .forEach(
            field -> {
              var value = getValue(field, instance);
              if (value != null) {
                if (value instanceof Class || isBasic(value)) {
                  map.put(field.getName(), value);
                } else {
                  var nestedMap =
                      toMap(value).entrySet().stream()
                          .filter(entry -> entry.getValue() != null)
                          .collect(
                              Collectors.toMap(
                                  entry -> field.getName() + "-" + entry.getKey(),
                                  Map.Entry::getValue));
                  map.putAll(nestedMap);
                }
              }
            });
    return map;
  }

  protected void addRowNumberForEntityClass(Map<String, Object> data) {
    addRowNumber(viewClass(), data);
  }

  public abstract CrudAdapter<View, Editor, CreationForm, Filters, Row, IdType>
      adapter();

  @SneakyThrows
  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if (actionId.startsWith("action-on-row-")) {
      String methodName = actionId.substring("action-on-row-".length());
      for (Method method : getAllMethods(getClass()).reversed()) {
        if (methodName.equals(method.getName())) {
          method.setAccessible(true);
          Object result = null;
          if (method.getParameterCount() == 0) {
            result = method.invoke(this);
          } else {
            result = method.invoke(this, httpRequest);
          }
          if (result != null) {
            return result;
          }
          break;
        }
      }
    }
    if (actionId.startsWith("action-on-view-")) {
      String methodName = actionId.substring("action-on-view-".length());
      var item = toView(httpRequest, viewClass());

      for (Method method : getAllMethods(getClass())) {
        if (methodName.equals(method.getName())) {
          method.setAccessible(true);
          if (method.getParameterCount() == 1) {
            return method.invoke(this, item);
          }
          if (method.getParameterCount() == 2) {
            return method.invoke(this, item, httpRequest);
          }
        }
      }
    }
    if (actionId.startsWith("search-")) {
      // search-field-childfield
      String fieldName = actionId.substring(actionId.indexOf('-') + 1);
      ForeignKeyOptionsSupplier optionsSupplier = null;
      if (fieldName.contains("-")) {
        var parentFieldName = fieldName.substring(0, fieldName.indexOf('-'));
        var childFieldName = fieldName.substring(fieldName.indexOf('-') + 1);
        var rowClass =
            getGenericClass(
                (ParameterizedType) getFieldByName(viewClass(), parentFieldName).getGenericType(),
                List.class,
                "E");
        var fkAnnotation = getFieldByName(rowClass, childFieldName).getAnnotation(ForeignKey.class);
        optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
      } else {
        var fkAnnotation = getFieldByName(viewClass(), fieldName).getAnnotation(ForeignKey.class);
        optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
      }

      Pageable pageable = httpRequest.getParameters(Pageable.class);
      String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
      if (searchText == null) {
        searchText = "";
      }
      var cleanSearchText = searchText.toLowerCase();

      var listingData = optionsSupplier.search(cleanSearchText, pageable, httpRequest);

      return new Data(Map.of(fieldName, listingData.page()));
    }

    Object savedId = null;
    if ("create".equals(actionId)) {
      savedId = saveNew(httpRequest);
      actionId = "view";
    }
    if ("save".equals(actionId)) {
      savedId = save(httpRequest);
      //savedId = getValue(getIdField(viewClass()), entity);
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
      _show_detail = new HashMap<>();
      _editing = new HashMap<>();
      var idField = getIdFieldForRow();
      var id =
          savedId != null
              ? "" + savedId
              : (String) httpRequest.runActionRq().parameters().get(idField);
      var view = view(toId(id), httpRequest);
      if (childCrud()) {
        return List.of(view);
      }
      return List.of(view, pushStateToHistory(getCrudRoute(httpRequest) + "/" + id));
    }
    if ("edit".equals(actionId)) {
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
    if ("new".equals(actionId)) {
      _show_detail = new HashMap<>();
      _editing = new HashMap<>();
      var create = create(httpRequest);
      if (childCrud()) {
        return List.of(create);
      }
      return List.of(create, pushStateToHistory(getCrudRoute(httpRequest) + "/new"));
    }
    if ("search".equals(actionId)) {
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
    if (!"".equals(actionId)) {
      log.info("state is {}", _state);
      for (Field field : getAllFields(viewClass())) {
        if (List.class.isAssignableFrom(field.getType())
            && !field.isAnnotationPresent(ForeignKey.class)
            && !field.isAnnotationPresent(Composition.class)
            && !isBasic(field.getType())) {
          if (actionId.endsWith("_create")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            _show_detail.put(fieldId, true);
            _editing.put(fieldId, false);

            String rowClassName =
                httpRequest.runActionRq().componentState().get(fieldId + "_rowClass").toString();
            var rowClassx =
                getGenericClass((ParameterizedType) field.getGenericType(), List.class, "E");
            var rowClass = Class.forName(rowClassName);

            var filteredState =
                httpRequest.runActionRq().componentState().entrySet().stream()
                    .filter(entry -> entry.getKey().startsWith(fieldId + "-"))
                    .filter(entry -> entry.getValue() != null)
                    .collect(
                        Collectors.toMap(
                            entry -> entry.getKey().substring((fieldId + "-").length()),
                            Map.Entry::getValue));
            var item = MateuInstanceFactory.newInstance(rowClass, filteredState, null);

            var list =
                (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
            ;
            if (list == null) {
              list = List.of(fromJson(toJson(item)));
            } else {
              list = new ArrayList<>(list);
              list.add(fromJson(toJson(item)));
            }
            list.forEach(
                map -> {
                  if (!map.containsKey("_rowNumber")) {
                    map.put("_rowNumber", UUID.randomUUID().toString());
                  }
                });
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            newState.put(fieldId, list);
            addRowNumberForEntityClass(newState);
            return new State(newState);
          }
          if (actionId.endsWith("_add")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            _show_detail.put(fieldId, true);
            _editing.put(fieldId, false);

            String rowClassName =
                httpRequest.runActionRq().componentState().get(fieldId + "_rowClass").toString();
            var rowClass = Class.forName(rowClassName);

            var newState = toMap(this);
            getAllEditableFields(rowClass)
                .forEach(f -> newState.put(fieldId + "-" + f.getName(), null));
            addRowNumberForEntityClass(newState);
            return new State(newState);
          }
          if (actionId.endsWith("_select")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            _show_detail.put(fieldId, true);
            _editing.put(fieldId, true);

            var rowNumber = httpRequest.runActionRq().parameters().get("_rowNumber");

            var values =
                ((List<Map<String, Object>>)
                        httpRequest.runActionRq().componentState().get(fieldId))
                    .stream()
                        .filter(map -> rowNumber.equals(map.get("_rowNumber")))
                        .toList()
                        .get(0);
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            for (String key : values.keySet()) {
              newState.put(fieldId + "-" + key, values.get(key));
            }
            var items =
                (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
            var position = 0;
            newState.put("" + fieldId + "_position", "" + (position + 1) + "/" + items.size());

            return new State(newState);
          }
          if (actionId.endsWith("_selected")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));

            var values =
                ((List<Map<String, Object>>)
                        httpRequest.runActionRq().componentState().get(fieldId + "_selected_items"))
                    .get(0);
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            for (String key : values.keySet()) {
              newState.put(fieldId + "-" + key, values.get(key));
            }
            var items =
                (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
            var position = getIndex(items, new HashMap<>(values).get("_rowNumber"));
            newState.put("" + fieldId + "_position", "" + (position + 1) + "/" + items.size());

            return new State(newState);
          }
          if (actionId.endsWith("_prev")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            var items =
                (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
            var position =
                getIndex(
                    items, httpRequest.runActionRq().componentState().get(fieldId + "-_rowNumber"));

            if (position <= 0) {
              throw new RuntimeException("This is the first item. No previous item to select.");
            }

            var values = items.get(position - 1);
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            for (String key : values.keySet()) {
              newState.put(fieldId + "-" + key, values.get(key));
            }
            newState.put("" + fieldId + "_position", "" + (position) + "/" + items.size());

            return new State(newState);
          }
          if (actionId.endsWith("_next")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            var items =
                (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
            var position =
                getIndex(
                    items, httpRequest.runActionRq().componentState().get(fieldId + "-_rowNumber"));

            if (position >= items.size() - 1) {
              throw new RuntimeException("No more items");
            }

            var values = items.get(position + 1);
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            for (String key : values.keySet()) {
              newState.put(fieldId + "-" + key, values.get(key));
            }
            newState.put("" + fieldId + "_position", "" + (position + 2) + "/" + items.size());

            return new State(newState);
          }
          if (actionId.endsWith("_save")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            _show_detail.put(fieldId, false);
            _editing.put(fieldId, false);

            var items =
                (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
            var position =
                getIndex(
                    items, httpRequest.runActionRq().componentState().get(fieldId + "-_rowNumber"));
            var values = items.get(position);

            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            List<Map<String, Object>> list = (List<Map<String, Object>>) newState.get(fieldId);
            var row =
                list.stream()
                    .filter(l -> l.get("_rowNumber").equals(values.get("_rowNumber")))
                    .findFirst()
                    .orElseThrow();
            for (String key : values.keySet()) {
              row.put(key, newState.get(fieldId + "-" + key));
            }

            return new State(newState);
          }
          if (actionId.endsWith("_remove")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            _show_detail.put(fieldId, false);
            var selectedLines =
                (List) httpRequest.runActionRq().componentState().get(fieldId + "_selected_items");
            if (selectedLines != null) {
              var list =
                  ((List) httpRequest.runActionRq().componentState().get(fieldId))
                      .stream()
                          .filter(
                              line ->
                                  selectedLines.stream()
                                      .filter(selected -> selected.equals(line))
                                      .findAny()
                                      .isEmpty())
                          .toList();
              var newState = new HashMap<>(httpRequest.runActionRq().componentState());
              newState.put(fieldId, list);
              return new State(newState);
            }
            return new State(this);
          }
          if (actionId.endsWith("_cancel")) {
            String fieldId = actionId.substring(0, actionId.indexOf('_'));
            _show_detail.put(fieldId, false);
            _editing.put(fieldId, false);
            return new State(this);
          }
        }
      }
      return new State(this);
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

  private boolean readOnly() {
    if (getClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    if (viewClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    return false;
  }

  private int getIndex(List<Map<String, Object>> list, Object rowNumber) {
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

  public Component list(HttpRequest httpRequest) {
    _state = "list";
    var toolbar = new ArrayList<UserTrigger>();
    addButtons(toolbar);
    if (!readOnly()) {
      toolbar.add(new Button("New", "new"));
      if (Deleteable.class.isAssignableFrom(viewClass())) {
        toolbar.add(
            Button.builder()
                .label("Delete")
                .actionId("delete")
                .variant(ButtonVariant.error)
                .build());
      }
    }
    var columns =
        Stream.concat(
                getColumns(
                    rowClass(),
                    this,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest)
                    .stream(),
                Stream.of(
                    GridColumn.builder()
                        .label("Action")
                        .id("_action")
                        .stereotype(FieldStereotype.button)
                        .actionId("view")
                        .text("View")
                        .build()))
            .toList();
    return Page.builder()
        .title(title())
        .style(getStyleForList(columns))
        .content(
            List.of(
                Listing.builder()
                    .listingType(ListingType.table)
                    .title("Xxx")
                    .searchable(true)
                    .rowsSelectionEnabled(true)
                    .columns(columns)
                    .filters(
                        getFilters(
                            filtersClass(),
                            this,
                            "base_url",
                            httpRequest.runActionRq().route(),
                            httpRequest.runActionRq().consumedRoute(),
                            httpRequest.runActionRq().initiatorComponentId(),
                            httpRequest))
                    .style("min-width: 30rem; display: block;")
                    .build()))
        .toolbar(toolbar)
        .build();
  }

  private String getStyleForList(List<GridContent> columns) {
    if (getClass().isAnnotationPresent(Style.class)) {
      return getClass().getAnnotation(Style.class).value();
    }
    return columns.size() > 5 ? "width: 100%;" : "max-width:900px;margin: auto;";
  }

  public String title() {
    return toUpperCaseFirst(getClass().getSimpleName());
  }


  private Object create(HttpRequest httpRequest) {
    httpRequest.setAttribute("new", true);
    _state = "create";
    var view = adapter().getCreationForm();
    httpRequest.setAttribute("selectedItem", view);
    return wrap(
        Page.builder()
            .title(getTitle(view))
            .style(getStyleForView())
            .content(
                getView(
                        view,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        false,
                        true)
                    .stream()
                    .toList())
            .toolbar(List.of(new Button("Cancel", "cancel_create"), new Button("Create", "create")))
            .build(),
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        httpRequest);
  }

  private Object edit(IdType id, HttpRequest httpRequest) {
    var editor = adapter().getEditor(id);
//    var found = adapter().findById(id);
//    if (found.isEmpty()) {
//      throw new RuntimeException("No item found with id " + id);
//    }
//    var item = found.get();
    httpRequest.setAttribute("selectedItem", editor);
    _state = "edit";
    return wrap(
        Page.builder()
            .title(getTitle(editor))
            .style(getStyleForView())
            .badges(createBadges(editor))
            .content(
                getView(
                        editor,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        false,
                        false)
                    .stream()
                    .toList())
            .toolbar(List.of(new Button("Cancel", "cancel_edit"), new Button("Save", "save")))
            .build(),
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        addData(editor, httpRequest));
  }

  protected Object view(IdType id, HttpRequest httpRequest) {
    var view = adapter().getView(id);
//    if (found.isEmpty()) {
//      throw new RuntimeException("No item found with id " + id);
//    }
//    var item = found.get();
    httpRequest.setAttribute("selectedItem", view);
    _state = "view";
    return wrap(
            viewComponent(view, httpRequest),
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        addData(view, httpRequest));
  }

  protected Component viewComponent(View item, HttpRequest httpRequest) {
    var toolbar = createViewToolbar();
    return Page.builder()
        .title(getTitle(item))
        .style(getStyleForView())
        .badges(createBadges(item))
        .kpis(createKpis(item))
        .content(
            getView(
                    item,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest,
                    true,
                    false)
                .stream()
                .toList())
        .toolbar(toolbar)
        .build();
  }

  private String getStyleForView() {
    if (viewClass().isAnnotationPresent(Style.class)) {
      return viewClass().getAnnotation(Style.class).value();
    }
    return getFormColumns(viewClass()) > 2 ? "width: 100%;" : "max-width:900px;margin: auto;";
  }

  protected String getCrudRoute(HttpRequest httpRequest) {
    return "/" + httpRequest.runActionRq().route().split("/")[1];
  }

  private List<UserTrigger> createViewToolbar() {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
        .forEach(
            method -> {
              toolbar.add(
                  new Button(
                      toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName()));
            });
    toolbar.add(new Button("List", "cancel_view"));
    if (!readOnly()) {
      toolbar.add(new Button("Edit", "edit"));
    }
    return toolbar;
  }

  private void addButtons(ArrayList<UserTrigger> toolbar) {
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

  public static HttpRequest addData(Object item, HttpRequest httpRequest) {
    if (item == null) {
      return httpRequest;
    }
    var data = createData(item, httpRequest);
    httpRequest.setAttribute("data", data);
    return httpRequest;
  }

  public static HashMap<String, Object> createData(Object item, HttpRequest httpRequest) {
    var data = new HashMap<String, Object>();
    getAllFields(item.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(ForeignKey.class))
        .forEach(
            field -> {
              LabelSupplier labelSupplier =
                  MateuBeanProvider.getBean(field.getAnnotation(ForeignKey.class).label());
              if (Collection.class.isAssignableFrom(field.getType())) {
                var options = new ArrayList<Option>();

                var ids = (Collection<?>) getValue(field, item);
                if (ids != null) {
                  ids.forEach(
                      id -> {
                        var label = labelSupplier.label(id, httpRequest);
                        options.add(new Option(id, label));
                      });
                }
                data.put(
                    field.getName() + "-label",
                    options.stream().map(Option::label).collect(Collectors.joining(", ")));
                data.put(field.getName(), new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1, options));
              } else {
                var id = getValue(field, item);
                if (id != null) {
                  var label = labelSupplier.label(id, httpRequest);
                  data.put(field.getName() + "-label", label);
                  data.put(
                      field.getName(),
                      new io.mateu.uidl.data.Page<>(
                          label, 1, 0, 1, List.of(new Option(id, label))));
                }
              }
            });
    return data;
  }




  public Class<?> entityClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "EntityType");
  }

  public Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Filters");
  }

  public Class<Row> rowClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Row");
  }

  public Class<View> viewClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "View");
  }

  public Class<Editor> editorClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Editor");
  }

  public Class<CreationForm> creationFormClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "CreationForm");
  }

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    var triggers = new ArrayList<Trigger>();
    if (httpRequest.getAttribute("selectedItem") == null) {
      triggers.add(new OnLoadTrigger("search"));
    }
    triggers.add(new OnSuccessTrigger("search", "create", ""));
    triggers.add(new OnSuccessTrigger("search", "delete", ""));
    triggers.add(new OnSuccessTrigger("search", "save", ""));
    triggers.add(new OnSuccessTrigger("search", "cancel_view", ""));
    triggers.add(new OnSuccessTrigger("search", "cancel_create", ""));
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
        .forEach(
            method -> {
              triggers.add(new OnSuccessTrigger("search", "action-on-row-" + method.getName(), ""));
            });
    return triggers;
  }

  @Override
  public List<Action> actions() {
    var actions = new ArrayList<Action>();
    actions.add(
        Action.builder()
            .id("delete")
            .confirmationRequired(true)
            .rowsSelectedRequired(true)
            .build());
    actions.add(Action.builder().id("save").validationRequired(true).build());
    actions.add(Action.builder().id("create").validationRequired(true).build());
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
        .forEach(
            method -> {
              actions.add(
                  Action.builder()
                      .id("action-on-row-" + method.getName())
                      .confirmationRequired(
                          method.getAnnotation(ListToolbarButton.class).rowsSelectedRequired())
                      .rowsSelectedRequired(
                          method.getAnnotation(ListToolbarButton.class).rowsSelectedRequired())
                      .build());
            });
    return actions;
  }

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

  public abstract IdType toId(String s);

  public boolean childCrud() {
    return false;
  }

  @Override
  public List<ValidationDto> validationDtos() {
    if ("edit".equals(_state) || "create".equals(_state)) {
      List<ValidationDto> fieldLevelValidations = new ArrayList<>();
      getAllFields(viewClass()).stream()
          .flatMap(field -> getValidations(field).stream())
          .filter(Objects::nonNull)
          .forEach(fieldLevelValidations::add);
      return Stream.concat(
              fieldLevelValidations.stream(),
              Arrays.stream(
                      viewClass().getAnnotationsByType(io.mateu.uidl.annotations.Validation.class))
                  .map(ComponentTreeSupplierToDtoMapper::mapToValidation))
          .toList();
    }
    return List.of();
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return list(httpRequest);
  }

  @Override
  public List<Rule> rules() {
    if ("edit".equals(_state) || "create".equals(_state)) {
      List<Rule> rules = new ArrayList<>();
      getAllFields(viewClass()).stream()
          .filter(field -> field.isAnnotationPresent(Disabled.class))
          .forEach(
              field -> {
                rules.add(
                    Rule.builder()
                        .filter("true")
                        .action(RuleAction.SetDataValue)
                        .fieldName(field.getName())
                        // .fieldName("aButton,aField")
                        .fieldAttribute(RuleFieldAttribute.disabled)
                        .expression("true")
                        .result(RuleResult.Continue)
                        .build());
              });
      return rules;
    }
    return List.of();
  }
}
