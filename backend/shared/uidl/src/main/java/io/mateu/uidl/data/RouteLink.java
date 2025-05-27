package io.mateu.uidl.data;

public record RouteLink(String route, RouteTarget target) {

  public RouteLink(String route) {
    this(route, null);
  }
}
