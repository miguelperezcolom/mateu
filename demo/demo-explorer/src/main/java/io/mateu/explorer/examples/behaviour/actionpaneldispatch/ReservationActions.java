package io.mateu.explorer.examples.behaviour.actionpaneldispatch;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ActionPanel;
import io.mateu.uidl.data.ActionPanelCategory;
import io.mateu.uidl.data.ActionPanelItem;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * An "I want to…" panel: a trigger button (with a shortcut) opening an overlay of categorised
 * actions. Each item dispatches its {@code actionId} — with its {@code parameters} — exactly like a
 * button, so it lands on this view's methods. Items with data behind them ({@code populated} or a
 * {@code count}) come first and bold. The overlay itself is client-side: opening it costs nothing.
 */
@Title("Reservation ABC123")
public class ReservationActions {

  ActionPanel iWantTo =
      new ActionPanel(
          "iWantTo",
          "I want to…",
          "ctrl+i",
          List.of(
              new ActionPanelCategory(
                  "Stay",
                  List.of(
                      new ActionPanelItem("Change dates", "act", Map.of("what", "change dates"), null, false, false),
                      new ActionPanelItem("Upgrade room", "act", Map.of("what", "upgrade the room"), null, true, false))),
              new ActionPanelCategory(
                  "Billing",
                  List.of(
                      new ActionPanelItem("Open folios", "act", Map.of("what", "open the folios"), 3, false, false),
                      new ActionPanelItem("Refund deposit", "act", Map.of("what", "refund"), null, false, true)))),
          0,
          false,
          null,
          null);

  public Message act(HttpRequest httpRequest) {
    return Message.success("You chose to " + httpRequest.runActionRq().parameters().get("what"));
  }
}
