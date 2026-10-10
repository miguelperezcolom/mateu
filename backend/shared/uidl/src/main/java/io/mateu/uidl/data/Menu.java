package io.mateu.uidl.data;

import static io.mateu.uidl.Humanizer.toCamelCase;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;

@Builder
@lombok.With
public record Menu(
    String path,
    String label,
    List<Actionable> submenu,
    boolean selected,
    Component component,
    String className,
    boolean disabled,
    boolean disabledOnClick,
    Object itemData,
    String description,
    boolean hidden,
    @Experimental("card menus (3.0-alpha.409)") MenuPresentation presentation)
    implements Actionable {
  /** The entry without presentation (a plain list entry). */
  public Menu(
      String path,
      String label,
      List<Actionable> submenu,
      boolean selected,
      Component component,
      String className,
      boolean disabled,
      boolean disabledOnClick,
      Object itemData,
      String description,
      boolean hidden) {
    this(
        path,
        label,
        submenu,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        description,
        hidden,
        null);
  }

  /**
   * An entry the menu does not draw, still resolving its route (deep links, reloads, navigation
   * from elsewhere). Declared with {@code @Hidden} on the {@code @Menu} field.
   */
  public Menu(
      String path,
      String label,
      List<Actionable> submenu,
      boolean selected,
      Component component,
      String className,
      boolean disabled,
      boolean disabledOnClick,
      Object itemData,
      String description) {
    this(
        path,
        label,
        submenu,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        description,
        false);
  }

  public Menu(String label) {
    this(toCamelCase(label), label, List.of(), false, null, null, false, false, null, null);
  }

  public Menu(String label, boolean selected) {
    this(toCamelCase(label), label, List.of(), selected, null, null, false, false, null, null);
  }

  public Menu(String path, String label, boolean selected) {
    this(path, label, List.of(), selected, null, null, false, false, null, null);
  }

  public Menu(String path, String label, List<Actionable> submenu) {
    this(path, label, submenu, false, null, null, false, false, null, null);
  }

  public Menu withHidden(boolean hidden) {
    return new Menu(
        path,
        label,
        submenu,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        description,
        hidden,
        presentation);
  }
}
