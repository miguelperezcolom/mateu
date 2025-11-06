package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import lombok.Builder;
import lombok.With;

@Builder@With
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
    Object itemData)
    implements Actionable {

    public FieldLink(Class<?> type, String fieldName) {
        this(null, null, type.getName(), fieldName, false, null, null, false, false, null);
    }

  public FieldLink(String label, Class<?> type, String fieldName) {
    this(null, label, type.getName(), fieldName, false, null, null, false, false, null);
  }

  public FieldLink(String path, String label, Class<?> type, String fieldName) {
    this(path, label, type.getName(), fieldName, false, null, null, false, false, null);
  }
}
