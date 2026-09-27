package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record MethodLink(
    String path,
    String label,
    String serverSideType,
    String methodName,
    boolean selected,
    Component component,
    String className,
    boolean disabled,
    boolean disabledOnClick,
    Object itemData,
    boolean hidden)
    implements Actionable {

  /**
   * An entry the menu does not draw, still resolving its route (deep links, reloads, navigation
   * from elsewhere). Declared with {@code @Hidden} on the {@code @Menu} field.
   */
  public MethodLink(
      String path,
      String label,
      String serverSideType,
      String methodName,
      boolean selected,
      Component component,
      String className,
      boolean disabled,
      boolean disabledOnClick,
      Object itemData) {
    this(
        path,
        label,
        serverSideType,
        methodName,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        false);
  }

  public MethodLink(Class<?> type, String fieldName) {
    this(null, null, type.getName(), fieldName, false, null, null, false, false, null);
  }

  public MethodLink(String label, Class<?> type, String fieldName) {
    this(null, label, type.getName(), fieldName, false, null, null, false, false, null);
  }

  public MethodLink(String path, String label, Class<?> type, String fieldName) {
    this(path, label, type.getName(), fieldName, false, null, null, false, false, null);
  }
}
