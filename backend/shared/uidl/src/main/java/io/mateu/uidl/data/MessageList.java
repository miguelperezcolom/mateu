package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A read-only chat-style list of {@link MessageListItem}s (Vaadin/PatternFly message list). */
@Builder
public record MessageList(String id, List<MessageListItem> items, String style, String cssClasses)
    implements Component {

  public MessageList(List<MessageListItem> items) {
    this(null, items, null, null);
  }
}
