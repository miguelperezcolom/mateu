package io.mateu.uidl.data;

import static io.mateu.uidl.Humanizer.toCamelCase;

import io.mateu.uidl.annotations.Experimental;
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
    String serverSideType,
    String consumedRoute,
    String description,
    String icon,
    boolean hidden,
    @Experimental("card menus (3.0-alpha.409)") MenuPresentation presentation)
    implements Actionable {
  /** The entry without presentation (a plain list entry). */
  public RouteLink(
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
      String serverSideType,
      String consumedRoute,
      String description,
      String icon,
      boolean hidden) {
    this(
        path,
        route,
        label,
        target,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        serverSideType,
        consumedRoute,
        description,
        icon,
        hidden,
        null);
  }

  /**
   * An entry the menu does not draw, still resolving its route (deep links, reloads, navigation
   * from elsewhere). Declared with {@code @Hidden} on the {@code @Menu} field.
   */
  public RouteLink(
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
      String serverSideType,
      String consumedRoute,
      String description,
      String icon) {
    this(
        path,
        route,
        label,
        target,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        serverSideType,
        consumedRoute,
        description,
        icon,
        false);
  }

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
        null,
        null,
        null);
  }

  public RouteLink(String path, String label) {
    this(path, path, label, null, false, null, null, false, false, null, null, null, null, null);
  }

  public RouteLink(String path, String label, boolean selected) {
    this(path, path, label, null, selected, null, null, false, false, null, null, null, null, null);
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
        null,
        null,
        null);
  }
}
