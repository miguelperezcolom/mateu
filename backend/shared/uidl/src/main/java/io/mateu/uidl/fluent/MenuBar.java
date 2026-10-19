package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/** A horizontal bar of menu entries, some of which may open submenus. */
@Builder
public record MenuBar(@Singular List<Actionable> options, String style, String cssClasses)
    implements Component {

  public MenuBar {
    options = options != null ? options : List.of();
  }
}
