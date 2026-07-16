package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Anchor(String text, String url, String target, String style, String cssClasses)
    implements Component {

  public Anchor(String text, String url) {
    this(text, url, null, "", "");
  }

  /** Backward-compatible constructor (pre-target callers). */
  public Anchor(String text, String url, String style, String cssClasses) {
    this(text, url, null, style, cssClasses);
  }
}
