package io.mateu.uidl.data;

import java.util.Map;
import lombok.Builder;

@Builder
public record UICommand(UICommandType type, Object data) {
  public static UICommand navigateTo(String route) {
    return new UICommand(UICommandType.NavigateTo, route);
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
