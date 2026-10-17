package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * An action result that sets the enclosing component's DATA — values the screen reads (options,
 * search results, anything referenced as {@code ${data.…}}) without being part of the form state.
 * {@code newState}, when set, also replaces the state.
 */
@Builder
public record Data(Object data, String style, String cssClasses, Object newState)
    implements Component {

  public Data(Object data) {
    this(data, "", "", null);
  }

  public Data(Object data, Object newState) {
    this(data, "", "", newState);
  }
}
