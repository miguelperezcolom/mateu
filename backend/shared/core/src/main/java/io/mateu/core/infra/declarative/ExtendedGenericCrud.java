package io.mateu.core.infra.declarative;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.getValidations;
import static io.mateu.core.infra.JsonSerializer.*;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.data.UICommand.pushStateToHistory;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.PrimaryKey;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonVariant;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
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
import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import io.mateu.uidl.interfaces.Repository;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.StateSupplier;
import io.mateu.uidl.interfaces.ValidationDtoSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class ExtendedGenericCrud<
        EntityType, Filters, Row, CreationForm, ViewForm, EditForm>
    implements ActionHandler,
        StateSupplier,
        TriggersSupplier,
        ActionSupplier,
        RouteHandler,
        ValidationDtoSupplier,
        ComponentTreeSupplier {

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
    if (httpRequest.getAttribute("new") != null) {
      var data = toMap();
      getAllFields(entityClass()).stream()
          .filter(field -> field.isAnnotationPresent(GeneratedValue.class))
          .forEach(
              field -> {
                var generator =
                    MateuBeanProvider.getBean(field.getAnnotation(GeneratedValue.class).value());
                var value = generator.generate();
                data.put(field.getName(), value);
              });
      addRowNumber(data);
      return data;
    }
    if (httpRequest.getAttribute("selectedItem") != null) {
      var data = toMap();
      data.putAll(toMap(httpRequest.getAttribute("selectedItem")));
      addRowNumber(data);
      return data;
    }
    var data = toMap();
    addRowNumber(data);
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
                    && !Collection.class.isAssignableFrom(field.getType())
                    && !Map.class.isAssignableFrom(field.getType())
                    && !Modifier.isFinal(field.getModifiers()))
        .forEach(
            field -> {
              var value = getValue(field, instance);
              if (value != null) {
                if (value instanceof Class || isBasic(value)) {
                  map.put(field.getName(), value);
                } else {
                  var nestedMap =
                      toMap(value).entrySet().stream()
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

  protected void addRowNumber(Map<String, Object> data) {
    getAllFields(entityClass()).stream()
        .filter(field -> Collection.class.isAssignableFrom(field.getType()))
        .forEach(
            field -> {
              var list = (List<?>) data.get(field.getName());
              if (list != null) {
                for (int i = 0; i < list.size(); i++) {
                  if (list.get(i) instanceof Map map) {
                    map.put("_rowNumber", i);
                  }
                }
              }
            });
  }

  public abstract Repository<EntityType, String> repository();

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
      var idField = getIdField(entityClass());

      var found =
          repository().findById((String) httpRequest.runActionRq().componentState().get(idField));
      if (found.isEmpty()) {
        throw new RuntimeException(
            "No item found with id " + httpRequest.runActionRq().parameters().get(idField));
      }
      var item = found.get();

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
                (ParameterizedType) getFieldByName(entityClass(), parentFieldName).getGenericType(),
                List.class,
                "E");
        var fkAnnotation = getFieldByName(rowClass, childFieldName).getAnnotation(ForeignKey.class);
        optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
      } else {
        var fkAnnotation = getFieldByName(entityClass(), fieldName).getAnnotation(ForeignKey.class);
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

    if ("create".equals(actionId)) {
      repository().saveAll(List.of(toEntity(httpRequest)));
      actionId = "";
    }
    if ("save".equals(actionId)) {
      repository().saveAll(List.of(toEntity(httpRequest)));
      actionId = "";
    }
    if ("delete".equals(actionId)) {
      List<?> selection =
          (List<?>)
              httpRequest
                  .runActionRq()
                  .componentState()
                  .getOrDefault("crud_selected_items", List.of());
      List<String> selectedIds =
          selection.stream()
              .map(map -> (String) ((Map<String, Object>) map).get(getIdField(rowClass())))
              .toList();
      repository().deleteAllById(selectedIds);
    }
    if ("view".equals(actionId)) {
      _show_detail = new HashMap<>();
      _editing = new HashMap<>();
      var idField = getIdField(entityClass());
      var id = (String) httpRequest.runActionRq().parameters().get(idField);
      var view = view(id, httpRequest);
      if (childCrud()) {
        return List.of(view);
      }
      return List.of(view, pushStateToHistory(getCrudRoute(httpRequest) + "/" + id));
    }
    if ("edit".equals(actionId)) {
      _show_detail = new HashMap<>();
      _editing = new HashMap<>();
      var idField = getIdField(entityClass());
      var id = (String) httpRequest.runActionRq().componentState().get(idField);

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
      return new Data(Map.of("crud", search(searchText, pageable)));
    }
    if (!"".equals(actionId)) {
      log.info("state is {}", _state);
      for (Field field : getAllFields(entityClass())) {
        if (List.class.isAssignableFrom(field.getType())
            && !field.isAnnotationPresent(ForeignKey.class)
            && !field.isAnnotationPresent(Composition.class)
            && !isBasic(field.getType())) {
          var rowClass =
              getGenericClass((ParameterizedType) field.getGenericType(), List.class, "E");
          if ((field.getName() + "_create").equals(actionId)) {
            _show_detail.put(field.getName(), true);
            _editing.put(field.getName(), false);

            var filteredState =
                httpRequest.runActionRq().componentState().entrySet().stream()
                    .filter(entry -> entry.getKey().startsWith(field.getName() + "-"))
                    .collect(
                        Collectors.toMap(
                            entry -> entry.getKey().substring((field.getName() + "-").length()),
                            Map.Entry::getValue));
            var item = MateuInstanceFactory.newInstance(rowClass, filteredState, null);

            var list = (List) httpRequest.runActionRq().componentState().get(field.getName());
            ;
            if (list == null) {
              list = List.of(fromJson(toJson(item)));
            } else {
              list = new ArrayList<>(list);
              list.add(fromJson(toJson(item)));
            }
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            newState.put(field.getName(), list);
            addRowNumber(newState);
            return new State(newState);
          }
          if ((field.getName() + "_add").equals(actionId)) {
            _show_detail.put(field.getName(), true);
            _editing.put(field.getName(), false);

            return new State(this);
          }
          if ((field.getName() + "_selected").equals(actionId)) {
            _show_detail.put(field.getName(), true);
            _editing.put(field.getName(), true);

            var values =
                ((List<Map<String, Object>>)
                        httpRequest
                            .runActionRq()
                            .componentState()
                            .get(field.getName() + "_selected_items"))
                    .get(0);
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            for (String key : values.keySet()) {
              newState.put(field.getName() + "-" + key, values.get(key));
            }

            return new State(newState);
          }
          if ((field.getName() + "_save").equals(actionId)) {
            var values =
                ((List<Map<String, Object>>)
                        httpRequest
                            .runActionRq()
                            .componentState()
                            .get(field.getName() + "_selected_items"))
                    .get(0);
            var newState = new HashMap<>(httpRequest.runActionRq().componentState());
            for (String key : values.keySet()) {
              newState.put(field.getName() + "-" + key, values.get(key));
            }

            return new State(newState);
          }
          if ((field.getName() + "_remove").equals(actionId)) {
            _show_detail.put(field.getName(), false);
            var selectedLines =
                (List)
                    httpRequest
                        .runActionRq()
                        .componentState()
                        .get(field.getName() + "_selected_items");
            if (selectedLines != null) {
              var list =
                  ((List) httpRequest.runActionRq().componentState().get(field.getName()))
                      .stream()
                          .filter(
                              line ->
                                  selectedLines.stream()
                                      .filter(selected -> selected.equals(line))
                                      .findAny()
                                      .isEmpty())
                          .toList();
              var newState = new HashMap<>(httpRequest.runActionRq().componentState());
              newState.put(field.getName(), list);
              return new State(newState);
            }
            return new State(this);
          }
          if ((field.getName() + "_cancel").equals(actionId)) {
            _show_detail.put(field.getName(), false);
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
          ((CompositionRepository) repository())
              .search(null, parentId, new Pageable(0, 10, List.of()));
      if (found.page().totalElements() == 0) {
        return new VerticalLayout(
            new Text("No element yet. Click on New to create one."),
            Button.builder().label("New").actionId("" + "-new").build());
      } else {
        var entity = found.page().content().get(0);
        var idFieldName = getIdField(entity.getClass());
        var id = getValue(getFieldByName(entity.getClass(), idFieldName), entity);
        var view = view((String) id, httpRequest);
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

  public ListingData<EntityType> search(String searchText, Pageable pageable) {
    return repository().search(searchText, pageable);
  }

  public Component list(HttpRequest httpRequest) {
    _state = "list";
    var toolbar = new ArrayList<UserTrigger>();
    addButtons(toolbar);
    toolbar.add(new Button("New", "new"));
    if (Deleteable.class.isAssignableFrom(entityClass())) {
      toolbar.add(
          Button.builder().label("Delete").actionId("delete").variant(ButtonVariant.error).build());
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
                        .stereotype(FieldStereotype.link)
                        .actionId("view")
                        .text("View")
                        .build()))
            .toList();
    return Page.builder()
        .title(title())
        .style(columns.size() > 5 ? "width: 100%;" : "max-width:900px;margin: auto;")
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

  public String title() {
    return toUpperCaseFirst(getClass().getSimpleName());
  }

  private EntityType toEntity(HttpRequest httpRequest) {
    var map = new HashMap<>(httpRequest.runActionRq().componentState());
    reduce("", map, entityClass());
    return pojoFromJson(toJson(map), entityClass());
  }

  private void reduce(String prefix, HashMap<String, Object> map, Class<?> type) {
    getAllFields(type).stream()
        .filter(field -> !isBasic(field.getType()) && !List.class.isAssignableFrom(field.getType()))
        .forEach(
            field -> {
              reduce(prefix + field.getName() + "-", map, field.getType());
            });
    if (!"".equals(prefix)) {
      map.put(
          prefix.substring(0, prefix.length() - 1),
          map.entrySet().stream()
              .filter(entry -> entry.getKey().startsWith(prefix))
              .filter(entry -> entry.getValue() != null)
              .collect(
                  Collectors.toMap(
                      entry -> entry.getKey().substring(prefix.length()), Map.Entry::getValue)));
    }
  }

  private Object create(HttpRequest httpRequest) {
    httpRequest.setAttribute("new", true);
    _state = "create";
    return wrap(
        Page.builder()
            .title("New " + toUpperCaseFirst(entityClass().getSimpleName()))
            .style("max-width:900px;margin: auto;")
            .content(
                getView(
                        entityClass(),
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        false,
                        true)
                    .stream()
                    .toList())
            .toolbar(List.of(new Button("Create", "create")))
            .build(),
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        httpRequest);
  }

  private Object edit(String id, HttpRequest httpRequest) {
    var found = repository().findById(id);
    if (found.isEmpty()) {
      throw new RuntimeException("No item found with id " + id);
    }
    var item = found.get();
    httpRequest.setAttribute("selectedItem", mapToRow(item));
    _state = "edit";
    return wrap(
        Page.builder()
            .title(toUpperCaseFirst(entityClass().getSimpleName()) + " " + getEntityName(item))
            .style("max-width:900px;margin: auto;")
            .content(
                getView(
                        item,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        false,
                        false)
                    .stream()
                    .toList())
            .toolbar(List.of(new Button("Save", "save")))
            .build(),
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        addData(item, httpRequest));
  }

  protected Object view(String id, HttpRequest httpRequest) {
    var found = repository().findById(id);
    if (found.isEmpty()) {
      throw new RuntimeException("No item found with id " + id);
    }
    var item = found.get();
    httpRequest.setAttribute("selectedItem", mapToRow(item));
    _state = "view";
    var view = viewComponent(item, httpRequest);
    return wrap(
        view,
        this,
        "base_url",
        httpRequest.runActionRq().route(),
        httpRequest.runActionRq().consumedRoute(),
        httpRequest.runActionRq().initiatorComponentId(),
        addData(item, httpRequest));
  }

  protected Component viewComponent(EntityType item, HttpRequest httpRequest) {
    var toolbar = createViewToolbar();
    return Page.builder()
        .title(toUpperCaseFirst(entityClass().getSimpleName()) + " " + getEntityName(item))
        .style("max-width:900px;margin: auto;")
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
    toolbar.add(new Button("Edit", "edit"));
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

  private HttpRequest addData(EntityType item, HttpRequest httpRequest) {
    if (item == null) {
      return httpRequest;
    }
    var data = new HashMap<String, Object>();
    getAllFields(entityClass()).stream()
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
                    options.stream().map(Option::label).collect(Collectors.joining()));
                data.put(field.getName(), new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1, options));
              } else {
                var id = getValue(field, item);
                if (id != null) {
                  var label = labelSupplier.label(id, httpRequest);
                  data.put(field.getName() + "-label", label);
                  data.put(
                      field.getName(),
                      new io.mateu.uidl.data.Page<>(
                          "xxxx", 1, 0, 1, List.of(new Option(id, label))));
                }
              }
            });
    httpRequest.setAttribute("data", data);
    return httpRequest;
  }

  private String getEntityName(EntityType item) {
    if (item == null) {
      return "No item found";
    }
    Object name = null;
    try {
      name = getValue(getFieldByName(item.getClass(), "name"), item);
      if (name != null) {
        return "" + name;
      }
    } catch (Exception ignored) {
    }
    try {
      name = getValue(getFieldByName(item.getClass(), getIdField(item.getClass())), item);
      if (name != null) {
        return "" + name;
      }
    } catch (Exception ignored) {
    }
    return item.toString();
  }

  protected String getIdField(Class<?> entityClass) {
    boolean hasIdField = false;
    String firstField = null;
    for (Field field : getAllFields(entityClass)) {
      if (field.isAnnotationPresent(PrimaryKey.class)) {
        return field.getName();
      }
      hasIdField |= "id".equals(field.getName());
      if (firstField == null) {
        firstField = field.getName();
      }
    }
    return hasIdField ? "id" : firstField;
  }

  private Row mapToRow(EntityType item) {
    return (Row) item;
  }

  public Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), ExtendedGenericCrud.class, "Filters");
  }

  public Class<Row> rowClass() {
    return getGenericClass(this.getClass(), ExtendedGenericCrud.class, "Row");
  }

  public Class<EntityType> entityClass() {
    return getGenericClass(this.getClass(), ExtendedGenericCrud.class, "EntityType");
  }

  @Override
  public List<Trigger> triggers() {
    var triggers = new ArrayList<Trigger>();
    triggers.add(new OnLoadTrigger("search"));
    triggers.add(new OnSuccessTrigger("search", "create", ""));
    triggers.add(new OnSuccessTrigger("search", "delete", ""));
    triggers.add(new OnSuccessTrigger("search", "save", ""));
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
          return edit(actionId.split("/")[0], httpRequest);
        }
        return view(actionId, httpRequest);
      }
    }
    return this;
  }

  public boolean childCrud() {
    return false;
  }

  @Override
  public List<ValidationDto> validationDtos() {
    if ("edit".equals(_state) || "create".equals(_state)) {
      List<ValidationDto> fieldLevelValidations = new ArrayList<>();
      getAllFields(entityClass()).stream()
          .flatMap(field -> getValidations(field).stream())
          .filter(Objects::nonNull)
          .forEach(fieldLevelValidations::add);
      return Stream.concat(
              fieldLevelValidations.stream(),
              Arrays.stream(
                      entityClass()
                          .getAnnotationsByType(io.mateu.uidl.annotations.Validation.class))
                  .map(ComponentTreeSupplierToDtoMapper::mapToValidation))
          .toList();
    }
    return List.of();
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return list(httpRequest);
  }
}
