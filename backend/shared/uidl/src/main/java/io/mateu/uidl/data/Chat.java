package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Chat(String sseUrl, String uploadUrl, String style, String cssClasses)
    implements Component {

  public Chat(String sseUrl) {
    this(sseUrl, "", "", "");
  }

  public Chat(String sseUrl, String uploadUrl) {
    this(sseUrl, uploadUrl, "", "");
  }
}
