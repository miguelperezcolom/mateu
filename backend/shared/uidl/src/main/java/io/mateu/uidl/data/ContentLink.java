package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record ContentLink(
    String path,
    String label,
    ComponentTreeSupplier componentSupplier,
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
  public ContentLink(
      String path,
      String label,
      ComponentTreeSupplier componentSupplier,
      boolean selected,
      Component component,
      String className,
      boolean disabled,
      boolean disabledOnClick,
      Object itemData) {
    this(
        path,
        label,
        componentSupplier,
        selected,
        component,
        className,
        disabled,
        disabledOnClick,
        itemData,
        false);
  }

  public ContentLink(ComponentTreeSupplier componentSupplier) {
    this(null, null, componentSupplier, false, null, null, false, false, null);
  }

  public ContentLink(String label, ComponentTreeSupplier componentSupplier) {
    this(null, label, componentSupplier, false, null, null, false, false, null);
  }

  public ContentLink(String path, String label, ComponentTreeSupplier componentSupplier) {
    this(path, label, componentSupplier, false, null, null, false, false, null);
  }
}
