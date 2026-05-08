package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Chat(String sseUrl, String style, String cssClasses) implements Component {

  public Chat(String sseUrl) {
    this(sseUrl, "", "");
  }
}
