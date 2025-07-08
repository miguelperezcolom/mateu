package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.IconKey;
import lombok.Builder;

@Builder
public record Icon(IconKey icon, String style, String cssClasses) implements Component {

  public Icon(IconKey icon) {
    this(icon, "", "");
  }
}
