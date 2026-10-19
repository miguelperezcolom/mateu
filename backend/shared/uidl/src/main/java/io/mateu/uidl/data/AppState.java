package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** Invisible holder that sets the app-wide state shared by all screens. */
@Builder
public record AppState(Object state, String style, String cssClasses) implements Component {

  public AppState(Object state) {
    this(state, "", "");
  }
}
