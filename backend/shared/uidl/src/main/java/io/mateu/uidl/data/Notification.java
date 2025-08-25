package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Notification(String title, String text, String style, String cssClasses)
    implements Component {

  public Notification(String title, String text) {
    this(title, text, "", "");
  }

  public Notification(String text) {
    this("", text, "", "");
  }
}
