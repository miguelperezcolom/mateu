package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Tab(String label, Component content, String style, String cssClasses)
    implements Component {

  public Tab(String label, Component content) {
    this(label, content, "", "");
  }
}
