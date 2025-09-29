package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;

public record AppState(Object state, String style, String cssClasses) implements Component {

  public AppState(Object state) {
    this(state, "", "");
  }
}
