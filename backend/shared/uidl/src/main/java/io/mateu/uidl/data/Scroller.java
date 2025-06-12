package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Scroller(Component content, String style) implements Component {

  public Scroller(Component content) {
    this(content, "");
  }
}
