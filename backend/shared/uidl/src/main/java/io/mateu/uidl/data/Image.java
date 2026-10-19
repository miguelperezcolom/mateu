package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** An image shown from a URL or data URI. */
@Builder
public record Image(String src, String style, String cssClasses) implements Component {

  public Image(String src) {
    this(src, "", "");
  }
}
