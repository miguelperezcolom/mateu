package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;

public record Data(Object data, String style, String cssClasses) implements Component {

  public Data(Object data) {
    this(data, "", "");
  }
}
