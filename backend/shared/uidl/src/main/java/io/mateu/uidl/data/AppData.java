package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record AppData(Object data, String style, String cssClasses) implements Component {

  public AppData(Object data) {
    this(data, "", "");
  }
}
