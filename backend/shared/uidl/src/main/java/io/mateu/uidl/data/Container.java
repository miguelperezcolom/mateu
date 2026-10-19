package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A plain wrapper around one component, used for styling or grouping. */
@Builder
public record Container(Component content, String style, String cssClasses) implements Component {

  public Container(Component content) {
    this(content, "", "");
  }
}
