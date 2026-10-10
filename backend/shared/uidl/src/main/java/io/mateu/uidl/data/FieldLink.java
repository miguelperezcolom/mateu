package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record FieldLink(
    String path,
    String label,
    String serverSideType,
    String fieldName,
    boolean selected,
    Component component,
    String className,
    boolean disabled,
    boolean disabledOnClick,
    Object itemData,
    String description,
    boolean hidden,
    MenuPresentation presentation)
    implements Actionable {
  /** The entry without presentation (a plain list entry). */
  public FieldLink(
      String path,
      String label,
      String serverSideType,
      String fieldName,
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
        serverSideType,
        fieldName,
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
  public FieldLink(
      String path,
      String label,
      String serverSideType,
      String fieldName,
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
        serverSideType,
        fieldName,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        description,
        false);
  }

  public FieldLink(Class<?> type, String fieldName) {
    this(null, null, type.getName(), fieldName, false, null, null, false, false, null, null);
  }

  public FieldLink(String label, Class<?> type, String fieldName) {
    this(null, label, type.getName(), fieldName, false, null, null, false, false, null, null);
  }

  public FieldLink(String path, String label, Class<?> type, String fieldName) {
    this(path, label, type.getName(), fieldName, false, null, null, false, false, null, null);
  }
}
