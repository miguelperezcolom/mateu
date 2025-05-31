package io.mateu.uidl.data;

import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;

@Builder
public record Menu(String path, String label, List<Actionable> submenu, boolean selected)
    implements Actionable {

  public Menu(String label, boolean selected) {
    this(null, label, List.of(), selected);
  }

  public Menu(String label, List<Actionable> submenu) {
    this(null, label, submenu, false);
  }
}
