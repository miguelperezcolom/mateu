package io.mateu.uidl.data;

import static io.mateu.uidl.Humanizer.toCamelCase;

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

  public Menu(String label) {
    this(toCamelCase(label), label, List.of(), false, null, null, false, false, null);
  }

  public Menu(String label, boolean selected) {
    this(toCamelCase(label), label, List.of(), selected, null, null, false, false, null);
  }

  public Menu(String path, String label, boolean selected) {
    this(path, label, List.of(), selected, null, null, false, false, null);
  }

  public Menu(String path, String label, List<Actionable> submenu) {
    this(path, label, submenu, false, null, null, false, false, null);
  }
}
