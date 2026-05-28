package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.*;
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
  public List<Action> actions(HttpRequest httpRequest) {
    return List.of();
  }

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of();
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return PageView.builder()
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
    return FormViewBadgesBuilder.createKpis(instance);
  }

  public static List<Badge> createBadges(Object instance) {
    return FormViewBadgesBuilder.createBadges(instance);
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
    return FormViewToolbarBuilder.createToolbar(this);
  }

  private List<UserTrigger> createButtons() {
    return FormViewToolbarBuilder.createButtons(this);
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
