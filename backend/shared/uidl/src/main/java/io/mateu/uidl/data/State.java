package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * An action result that sets the enclosing component's STATE from an object's fields — typically
 * {@code return new State(this);} after the action changed the view model's fields, so the form
 * shows the new values without re-rendering the whole screen.
 */
@Builder
public record State(Object state, String style, String cssClasses) implements Component {

  public State(Object state) {
    this(state, "", "");
  }
}
