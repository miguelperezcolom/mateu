package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.Map;
import lombok.Builder;

/**
 * An action offered by a {@link Message}, a finished {@link LongTask} or an inbox {@link
 * AppNotification}: {@code route} navigates; otherwise {@code actionId} (with {@code parameters})
 * runs — on the component that ran the action for a message or a task, through the app's {@code
 * NotificationsSupplier#onNotificationAction} for an inbox entry. {@code style} is a hint: {@code
 * primary}, {@code secondary}, {@code danger} or {@code undo}.
 *
 * <pre>{@code
 * MessageAction.run("Retry", "sync")
 * MessageAction.open("Open report", "/reports/42")
 * }</pre>
 */
@Experimental("progress and notifications patterns (3.0)")
@Builder
public record MessageAction(
    String label, String actionId, Map<String, Object> parameters, String route, String style) {

  /** An action that runs {@code actionId}. */
  public static MessageAction run(String label, String actionId) {
    return new MessageAction(label, actionId, null, null, null);
  }

  /** An action that runs {@code actionId} with {@code parameters}. */
  public static MessageAction run(String label, String actionId, Map<String, Object> parameters) {
    return new MessageAction(label, actionId, parameters, null, null);
  }

  /** An action that navigates to {@code route}. */
  public static MessageAction open(String label, String route) {
    return new MessageAction(label, null, null, route, null);
  }

  /** The same action with a style hint (primary, secondary, danger, undo). */
  public MessageAction withStyle(String style) {
    return new MessageAction(label, actionId, parameters, route, style);
  }
}
