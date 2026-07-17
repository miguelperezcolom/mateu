package io.mateu.uidl.data;

import java.util.Map;
import lombok.Builder;

/**
 * A toast shown to the user. A message can carry an UNDO action ({@link #undoable}): the toast
 * renders an Undo button that dispatches {@code undoActionId} (with {@code undoParameters}) on the
 * initiator component — the standard recoverability affordance after destructive or bulk actions.
 * The undo method is a plain action of the same class (it must reverse the effect itself, e.g.
 * restore a soft-deleted row).
 */
@Builder
public record Message(
    NotificationVariant variant,
    NotificationPosition position,
    String title,
    String text,
    int duration,
    String undoLabel,
    String undoActionId,
    Map<String, Object> undoParameters) {

  public Message(String text) {
    this(
        NotificationVariant.success, NotificationPosition.middle, "", text, 5000, null, null, null);
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

  /** A toast with an Undo button dispatching the given action (10 s so there is time to react). */
  public static Message undoable(
      String text, String undoActionId, Map<String, Object> undoParameters) {
    return Message.builder()
        .variant(NotificationVariant.contrast)
        .text(text)
        .duration(10000)
        .undoLabel("Deshacer")
        .undoActionId(undoActionId)
        .undoParameters(undoParameters)
        .build();
  }
}
