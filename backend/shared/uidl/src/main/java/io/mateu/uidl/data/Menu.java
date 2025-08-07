package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;

@Builder
public record Menu(
    String path,
    String label,
    List<Actionable> submenu,
    boolean selected,
    Component component,
    String className,
    boolean disabled,
    boolean disabledOnClick,
    Object itemData)
    implements Actionable {

  public Menu(String label, boolean selected) {
    this(null, label, List.of(), selected, null, null, false, false, null);
  }

  public Menu(String label, List<Actionable> submenu) {
    this(null, label, submenu, false, null, null, false, false, null);
  }
}
