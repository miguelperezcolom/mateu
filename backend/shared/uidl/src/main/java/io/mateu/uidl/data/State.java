package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record State(Object state, String style, String cssClasses) implements Component {

  public State(Object state) {
    this(state, "", "");
  }
}
