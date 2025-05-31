package io.mateu.uidl.data;

import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;

@Builder
public record RouteLink(String route, String label, RouteTarget target, boolean selected)
    implements Actionable {

  public RouteLink(String route) {
    this(route, null, null, false);
  }

  public RouteLink(String route, String label) {
    this(route, label, null, false);
  }

  public RouteLink(String route, String label, boolean selected) {
    this(route, label, null, selected);
  }

  @Override
  public String path() {
    return route;
  }
}
