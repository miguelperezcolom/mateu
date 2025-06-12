package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record FullWidth(Component content, String style) implements Component {

  public FullWidth(Component content) {
    this(content, "");
  }
}
