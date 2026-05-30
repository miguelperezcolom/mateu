package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record Message(
    NotificationVariant variant,
    NotificationPosition position,
    String title,
    String text,
    int duration) {

  public Message(String text) {
    this(NotificationVariant.success, NotificationPosition.middle, "", text, 5000);
  }

  public static Message success(String message) {
    return Message.builder().variant(NotificationVariant.success).text(message).build();
  }
}
