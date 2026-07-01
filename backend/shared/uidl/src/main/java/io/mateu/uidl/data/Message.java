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

  public static Message error(String message) {
    return Message.builder().variant(NotificationVariant.error).text(message).build();
  }

  public static Message warning(String message) {
    return Message.builder().variant(NotificationVariant.warning).text(message).build();
  }

  public static Message contrast(String message) {
    return Message.builder().variant(NotificationVariant.contrast).text(message).build();
  }
}
