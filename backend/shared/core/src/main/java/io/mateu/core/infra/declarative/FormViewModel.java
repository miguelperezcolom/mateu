package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.*;
import java.util.*;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FormViewModel
    implements TriggersSupplier,
        ActionSupplier,
        ValidationSupplier,
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
  public List<Validation> validations() {
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
    return FormViewSerializer.toMap(instance);
  }
}
