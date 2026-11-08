package io.mateu.explorer.examples.components.actionpanel;

import io.mateu.uidl.data.ActionPanel;
import io.mateu.uidl.data.ActionPanelCategory;
import io.mateu.uidl.data.ActionPanelItem;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * An "I want to…" panel: a trigger button (here also on Ctrl+I) that opens a layer of categorised
 * actions. Each item dispatches its {@code actionId} like a button, with its {@code parameters}.
 * Populated items (or a {@code count > 0}) come first and bold; the switch hides the empty ones.
 */
public class ArtworkActions implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return ActionPanel.builder()
        .label("I want to…")
        .shortcut("ctrl+i")
        .hideUnpopulatedToggle(true)
        .categories(
            List.of(
                ActionPanelCategory.builder()
                    .title("Loans")
                    .actions(
                        List.of(
                            item("Review open requests", "openLoans", Map.of("status", "open"), 3),
                            item("Extend a loan", "openLoans", Map.of("status", "extend"), 0),
                            item("Print the courier sheet", "print", Map.of(), null)))
                    .build(),
                ActionPanelCategory.builder()
                    .title("Conservation")
                    .actions(
                        List.of(
                            item("Report damage", "report", Map.of(), null),
                            item("Overdue checks", "openChecks", Map.of(), 27)))
                    .build()))
        .build();
  }

  static ActionPanelItem item(String label, String actionId, Map<String, Object> params, Integer count) {
    return ActionPanelItem.builder()
        .label(label)
        .actionId(actionId)
        .parameters(params)
        .count(count)
        .populated(count != null && count > 0)
        .build();
  }

  public Message openLoans(HttpRequest httpRequest) {
    return new Message("Loans filtered by " + httpRequest.runActionRq().parameters().get("status"));
  }

  public Message print(HttpRequest httpRequest) {
    return new Message("Sending the courier sheet to the printer…");
  }

  public Message report(HttpRequest httpRequest) {
    return new Message("Opening the damage report form…");
  }

  public Message openChecks(HttpRequest httpRequest) {
    return new Message("27 checks are overdue.");
  }
}
