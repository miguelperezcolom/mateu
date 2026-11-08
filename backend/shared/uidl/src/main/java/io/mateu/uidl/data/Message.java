package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Builder;

/**
 * A message shown to the user (a toast, a balloon, a snackbar — each renderer draws it its own
 * way).
 *
 * <p>What it means is semantic: the {@code variant} (severity), the {@code persistence} (toast,
 * sticky, inbox — {@link MessagePersistence}), the {@code actions} it offers and an optional {@code
 * key} (a message with the same key replaces the one on screen). {@code position} is only a hint
 * for the web renderers.
 *
 * <p>A message can carry an UNDO action ({@link #undoable}): the toast renders an Undo button that
 * dispatches {@code undoActionId} (with {@code undoParameters}) on the initiator component — the
 * standard recoverability affordance after destructive or bulk actions. The undo method is a plain
 * action of the same class (it must reverse the effect itself, e.g. restore a soft-deleted row).
 */
@Builder(toBuilder = true)
public record Message(
    NotificationVariant variant,
    NotificationPosition position,
    String title,
    String text,
    int duration,
    String undoLabel,
    String undoActionId,
    Map<String, Object> undoParameters,
    @Experimental("progress and notifications patterns (3.0)") MessagePersistence persistence,
    @Experimental("progress and notifications patterns (3.0)") List<MessageAction> actions,
    @Experimental("progress and notifications patterns (3.0)") String key) {

  public Message {
    actions = actions != null ? List.copyOf(actions) : List.of();
  }

  /** The shape before persistence, actions and key (kept for existing callers). */
  public Message(
      NotificationVariant variant,
      NotificationPosition position,
      String title,
      String text,
      int duration,
      String undoLabel,
      String undoActionId,
      Map<String, Object> undoParameters) {
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

  /**
   * A toast with an Undo button dispatching the given action (10 s so there is time to react). The
   * undo travels both as the legacy {@code undo*} fields and as one of the {@code actions} (style
   * {@code undo}).
   */
  public static Message undoable(
      String text, String undoActionId, Map<String, Object> undoParameters) {
    return Message.builder()
        .variant(NotificationVariant.contrast)
        .text(text)
        .duration(10000)
        .undoActionId(undoActionId)
        .undoParameters(undoParameters)
        .actions(List.of(new MessageAction(null, undoActionId, undoParameters, null, STYLE_UNDO)))
        .build();
  }

  /** The style hint of an undo action (labelled by the renderer's own "Undo" when unlabelled). */
  @Experimental("progress and notifications patterns (3.0)")
  public static final String STYLE_UNDO = "undo";

  /** The same message offering one more action. */
  @Experimental("progress and notifications patterns (3.0)")
  public Message withAction(MessageAction action) {
    var more = new ArrayList<>(actions);
    more.add(action);
    return toBuilder().actions(more).build();
  }

  /** The same message with another persistence (toast, sticky, inbox). */
  @Experimental("progress and notifications patterns (3.0)")
  public Message withPersistence(MessagePersistence persistence) {
    return toBuilder().persistence(persistence).build();
  }

  /** The same message with a deduplication key: the same key replaces the one on screen. */
  @Experimental("progress and notifications patterns (3.0)")
  public Message withKey(String key) {
    return toBuilder().key(key).build();
  }
}
