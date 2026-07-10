package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A chat-style message input. On submit it dispatches {@code actionId} with the typed text as the
 * {@code message} parameter (the developer's @Action method reads it and, typically, appends to a
 * {@link MessageList}).
 */
@Builder
public record MessageInput(String id, String actionId, String style, String cssClasses)
    implements Component {

  public MessageInput(String actionId) {
    this(null, actionId, null, null);
  }
}
