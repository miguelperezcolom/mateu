package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;

@Builder
public record MenuBar(List<Actionable> options) implements Component {

  public MenuBar {
    options = options != null ? options : List.of();
  }
}
