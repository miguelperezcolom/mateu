package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getLabel;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BadgeColor;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.KPI;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;
import io.mateu.uidl.interfaces.ValidationDtoSupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class GenericForm
    implements TriggersSupplier,
        ActionSupplier,
        ValidationDtoSupplier,
        ComponentTreeSupplier,
        RuleSupplier {

  @Override
  public List<Action> actions() {
    return List.of();
  }

  @Override
  public List<Trigger> triggers() {
    return List.of();
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return Page.builder()
        .title(title())
        .header(List.of(new Text("This in header")))
        .badges(createBadges(this))
        .kpis(createKpis(this))
        .subtitle("This is a subtitle")
        .style("max-width:900px;margin: auto;")
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
    return getAllEditableFields(instance.getClass()).stream()
        .filter(field -> Status.class.equals(field.getType()))
        .map(field -> mapStatusToBadge((Status) getValue(field, instance)))
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
              case WARNING -> BadgeColor.contrast;
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
}
