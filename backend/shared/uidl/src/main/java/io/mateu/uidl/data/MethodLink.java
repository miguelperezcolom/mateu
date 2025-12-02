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
    Object itemData)
    implements Actionable {

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
