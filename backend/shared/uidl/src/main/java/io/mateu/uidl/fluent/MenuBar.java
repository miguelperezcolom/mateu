package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

@Builder
public record MenuBar(@Singular List<Actionable> options, String style, String cssClasses)
    implements Component {

  public MenuBar {
    options = options != null ? options : List.of();
  }
}
