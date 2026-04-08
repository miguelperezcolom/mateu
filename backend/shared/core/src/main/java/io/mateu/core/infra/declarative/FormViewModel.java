package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getLabel;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FormViewModel
    implements TriggersSupplier,
        ActionSupplier,
        ValidationDtoSupplier,
        ComponentTreeSupplier,
        RuleSupplier {

  @Hidden String _state = "";
  @Hidden Map<String, Object> _show_detail = new HashMap<>();
  @Hidden Map<String, Object> _editing = new HashMap<>();

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

  public static Map<String, Object> toMap(Object instance) {
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
}
