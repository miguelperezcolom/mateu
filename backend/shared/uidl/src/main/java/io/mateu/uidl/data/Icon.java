package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.IconKey;
import lombok.Builder;

/** A single icon from the built-in icon set. */
@Builder
public record Icon(IconKey icon, String style, String cssClasses) implements Component {

  public Icon(IconKey icon) {
    this(icon, "", "");
  }
}
