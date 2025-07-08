package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Chart(String style, String cssClasses) implements Component {

  public Chart() {
    this("", "");
  }
}
