package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Anchor(String text, String url, String style, String cssClasses)
    implements Component {

  public Anchor(String text, String url) {
    this(text, url, "", "");
  }
}
