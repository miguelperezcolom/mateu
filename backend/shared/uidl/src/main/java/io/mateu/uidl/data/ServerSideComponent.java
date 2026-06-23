package io.mateu.uidl.data;

import io.mateu.dtos.*;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import java.util.List;
import lombok.Builder;

@Builder
public record ServerSideComponent(
    String id,
    String serverSideType,
    String route,
    List<Component> children,
    Object initialData,
    String style,
    String cssClasses,
    List<Action> actions,
    List<Trigger> triggers,
    List<Rule> rules,
    List<Validation> validations,
    String slot,
    String containerId,
    boolean confirmOnNavigationIfDirty,
    String emitsName)
    implements Component {
  @Override
  public List<Component> children() {
    return children != null ? children : List.of();
  }

  @Override
  public List<Action> actions() {
    return actions != null ? actions : List.of();
  }

  @Override
  public List<Trigger> triggers() {
    return triggers != null ? triggers : List.of();
  }

  @Override
  public List<Rule> rules() {
    return rules != null ? rules : List.of();
  }

  @Override
  public List<Validation> validations() {
    return validations != null ? validations : List.of();
  }
}
