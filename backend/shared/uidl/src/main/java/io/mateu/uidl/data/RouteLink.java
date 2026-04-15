package io.mateu.uidl.data;

import static io.mateu.uidl.Humanizer.toCamelCase;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record RouteLink(
    String path,
    String route,
    String label,
    RouteTarget target,
    boolean selected,
    Component component,
    String className,
    boolean disabled,
    boolean disabledOnClick,
    Object itemData,
    String appServerSideType,
    String consumedRoute)
    implements Actionable {

  public RouteLink(String label) {
    this(
        toCamelCase(label),
        toCamelCase(label),
        label,
        null,
        false,
        null,
        null,
        false,
        false,
        null,
        null,
        null);
  }

  public RouteLink(String path, String label) {
    this(path, path, label, null, false, null, null, false, false, null, null, null);
  }

  public RouteLink(String path, String label, boolean selected) {
    this(path, path, label, null, selected, null, null, false, false, null, null, null);
  }

  public RouteLink(String label, boolean selected) {
    this(
        toCamelCase(label),
        toCamelCase(label),
        label,
        null,
        selected,
        null,
        null,
        false,
        false,
        null,
        null,
        null);
  }
}
