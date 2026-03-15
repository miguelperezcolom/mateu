package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getLabel;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.declarative.CrudOrchestrator.createData;
import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.*;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FormViewModel
    implements TriggersSupplier,
        DataSupplier,
        StateSupplier,
        ActionSupplier,
        ValidationDtoSupplier,
        ComponentTreeSupplier,
        RuleSupplier,
        ActionHandler {

  @Hidden String _state = "";
  @Hidden Map<String, Object> _show_detail = new HashMap<>();
  @Hidden Map<String, Object> _editing = new HashMap<>();

  @Override
  public boolean supportsAction(String actionId) {
    return actionId.startsWith("search-");
  }

  @Override
  public List<Action> actions() {
    return List.of();
  }

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of();
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return Page.builder()
        .title(title())
        // .header(List.of(new Text("This in header")))
        .badges(createBadges(this))
        .kpis(createKpis(this))
        // .subtitle("This is a subtitle")
        .style(style())
        .content(
            getView(
                    this,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest,
                    false,
                    false)
                .stream()
                .toList())
        .toolbar(createToolbar())
        .buttons(createButtons())
        .build();
  }

  public static List<KPI> createKpis(Object instance) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    return getAllEditableFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.KPI.class))
        .map(field -> KPI.builder().title(getLabel(field)).text(getKpiText(field)).build())
        .toList();
  }

  private static String getKpiText(Field field) {
    if (Amount.class.equals(field.getType())) {
      return "${state." + field.getName() + ".value} ${state." + field.getName() + ".currency}";
    }
    return "${state." + field.getName() + "}";
  }

  public static List<Badge> createBadges(Object instance) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    Object finalInstance = instance;
    return getAllEditableFields(instance.getClass()).stream()
        .filter(field -> Status.class.equals(field.getType()))
        .map(field -> mapStatusToBadge((Status) getValue(field, finalInstance)))
        .filter(Objects::nonNull)
        .toList();
  }

  public static Badge mapStatusToBadge(Status value) {
    if (value == null) {
      return null;
    }
    return Badge.builder()
        .text(value.message())
        .color(
            switch (value.type()) {
              case SUCCESS -> BadgeColor.success;
              case WARNING -> BadgeColor.warning;
              case DANGER -> BadgeColor.error;
              default -> BadgeColor.normal;
            })
        .build();
  }

  @Override
  public List<Rule> rules() {
    return List.of();
  }

  @Override
  public List<ValidationDto> validationDtos() {
    return List.of();
  }

  public String title() {
    if (this.getClass().isAnnotationPresent(Title.class)) {
      return this.getClass().getAnnotation(Title.class).value();
    }
    return toUpperCaseFirst(getClass().getSimpleName());
  }

  private List<UserTrigger> createToolbar() {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method -> {
              toolbar.add(new Button(toUpperCaseFirst(method.getName()), method.getName()));
            });
    return toolbar;
  }

  private List<UserTrigger> createButtons() {
    var buttons = new ArrayList<UserTrigger>();
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
        .forEach(
            method -> {
              buttons.add(new Button(toUpperCaseFirst(method.getName()), method.getName()));
            });
    return buttons;
  }

  public Class<?> entityClass() {
    return getClass();
  }

  @SneakyThrows
  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if (actionId.startsWith("search-")) {
      // search-field-childfield
      String fieldName = actionId.substring(actionId.indexOf('-') + 1);
      ForeignKeyOptionsSupplier optionsSupplier = null;
      if (fieldName.contains("-")) {
        var parentFieldName = fieldName.substring(0, fieldName.indexOf('-'));
        var childFieldName = fieldName.substring(fieldName.indexOf('-') + 1);
        var rowClass =
            getGenericClass(
                (ParameterizedType) getFieldByName(getClass(), parentFieldName).getGenericType(),
                List.class,
                "E");
        var fkAnnotation = getFieldByName(rowClass, childFieldName).getAnnotation(ForeignKey.class);
        optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
      } else {
        var fkAnnotation = getFieldByName(getClass(), fieldName).getAnnotation(ForeignKey.class);
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
    if (!"".equals(actionId)) {
      log.info("state is {}", _state);
      for (Field field : getAllFields(entityClass())) {
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
    return null;
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
    addRowNumber(entityClass(), data);
  }

  private int getIndex(List<Map<String, Object>> list, Object rowNumber) {
    for (int i = 0; i < list.size(); i++) {
      if (rowNumber.equals(list.get(i).get("_rowNumber"))) {
        return i;
      }
    }
    throw new RuntimeException("Item with row number " + rowNumber + " not found");
  }

  @Override
  public Object state(HttpRequest httpRequest) {
    var data = toMap(this);
    getAllFields(entityClass()).stream()
        .filter(field -> field.isAnnotationPresent(GeneratedValue.class))
        .forEach(
            field -> {
              var generator =
                  MateuBeanProvider.getBean(field.getAnnotation(GeneratedValue.class).value());
              var value = generator.generate();
              data.put(field.getName(), value);
            });
    addRowNumberForEntityClass(data);
    return data;
  }

  @Override
  public Object data(HttpRequest httpRequest) {
    return createData(this, httpRequest);
  }
}
