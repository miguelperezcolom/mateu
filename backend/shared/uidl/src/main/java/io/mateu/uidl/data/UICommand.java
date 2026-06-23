package io.mateu.uidl.data;

import io.mateu.uidl.fluent.CustomEvent;
import java.util.Map;
import lombok.Builder;

@Builder
public record UICommand(UICommandType type, Object data) {
  public static UICommand navigateTo(String route) {
    return new UICommand(UICommandType.NavigateTo, route);
  }

  /** Emits a named custom event with no payload. Subscribers react via {@code @SubscribeTo}. */
  public static UICommand dispatchEvent(String eventName) {
    return new UICommand(UICommandType.DispatchEvent, new CustomEvent(eventName, null));
  }

  /** Emits a named custom event carrying {@code payload} as its detail. */
  public static UICommand dispatchEvent(String eventName, Object payload) {
    return new UICommand(UICommandType.DispatchEvent, new CustomEvent(eventName, payload));
  }

  public static UICommand runAction(String actionId) {
    return new UICommand(UICommandType.RunAction, Map.of("actionId", actionId));
  }

  public static UICommand runAction(String actionId, String targetComponentId) {
    return new UICommand(
        UICommandType.RunAction,
        Map.of(
            "actionId", actionId,
            "targetComponentId", targetComponentId));
  }

  public static UICommand pushStateToHistory(String url) {
    return new UICommand(UICommandType.PushStateToHistory, url);
  }

  /** Marks the current component as dirty so the frontend warns on navigation. */
  public static UICommand markAsDirty() {
    return new UICommand(UICommandType.MarkAsDirty, null);
  }

  /** Clears the dirty state; return this from a save action after persisting changes. */
  public static UICommand markAsClean() {
    return new UICommand(UICommandType.MarkAsClean, null);
  }
}
