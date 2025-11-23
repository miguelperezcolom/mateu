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

  public static UICommand pushStateToHistory(String url) {
    return new UICommand(UICommandType.PushStateToHistory, url);
  }
}
