package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * A message to be shown to the user.
 *
 * <p>What it MEANS travels as semantics — {@code variant} (severity), {@code persistence} (toast,
 * sticky, inbox), {@code actions}, {@code key} — and each renderer decides how to present it on its
 * platform. {@code position} is only a HINT (a web toast corner): renderers may ignore it.
 *
 * @param title The message title
 * @param text The message text
 * @param persistence toast (goes away), sticky (until dismissed), inbox (also lands in the inbox);
 *     null on a message from an older server = toast unless {@code duration} is 0
 * @param actions what the user can do from the message (Undo is one of them, style {@code undo})
 * @param key a message with the same key replaces the one on screen (and the inbox entry)
 */
@Builder
public record MessageDto(
    NotificationVariantDto variant,
    NotificationPositionDto position,
    String title,
    String text,
    int duration,
    String undoLabel,
    String undoActionId,
    java.util.Map<String, Object> undoParameters,
    MessagePersistenceDto persistence,
    List<MessageActionDto> actions,
    String key) {

  public MessageDto {
    actions = actions != null ? List.copyOf(actions) : List.of();
  }

  /** The shape before persistence, actions and key (kept for existing callers). */
  public MessageDto(
      NotificationVariantDto variant,
      NotificationPositionDto position,
      String title,
      String text,
      int duration,
      String undoLabel,
      String undoActionId,
      java.util.Map<String, Object> undoParameters) {
    this(
        variant,
        position,
        title,
        text,
        duration,
        undoLabel,
        undoActionId,
        undoParameters,
        null,
        List.of(),
        null);
  }
}
