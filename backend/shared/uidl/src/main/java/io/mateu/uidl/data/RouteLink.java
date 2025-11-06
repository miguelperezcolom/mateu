package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record RouteLink(
    String route,
    String label,
    RouteTarget target,
    boolean selected,
    Component component,
    String className,
    boolean disabled,
    boolean disabledOnClick,
    Object itemData)
    implements Actionable {

  public RouteLink(String route) {
    this(route, null, null, false, null, null, false, false, null);
  }

  public RouteLink(String route, String label) {
    this(route, label, null, false, null, null, false, false, null);
  }

  public RouteLink(String route, String label, boolean selected) {
    this(route, label, null, selected, null, null, false, false, null);
  }

  @Override
  public String path() {
    return route;
  }
}
