package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Image(String src, String style, String cssClasses) implements Component {

  public Image(String src) {
    this(src, "", "");
  }
}
