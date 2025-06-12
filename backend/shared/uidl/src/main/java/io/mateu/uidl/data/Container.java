package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Container(Component content, String style) implements Component {

  public Container(Component content) {
    this(content, "");
  }
}
