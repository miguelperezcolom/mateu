package io.mateu.explorer.examples.components.progress;

import io.mateu.uidl.data.Checklist;
import io.mateu.uidl.data.ChecklistItem;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.ProgressBar;
import io.mateu.uidl.data.ProgressSteps;
import io.mateu.uidl.data.Step;
import io.mateu.uidl.data.TaskProgress;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Progress in Java, with STATE: the checklist ticks are kept in this view's fields, so ticking an
 * item runs {@code toggleItem} (parameters {@code _item} = the item, {@code _done} = its new state) and the view re-renders
 * with the bar and the counter updated.
 */
public class RoomReadiness implements ComponentTreeSupplier {

  boolean bedMade = true;
  boolean bathroomCleaned = true;
  boolean minibarRestocked;

  @Override
  public Component component(HttpRequest httpRequest) {
    int done = (bedMade ? 1 : 0) + (bathroomCleaned ? 1 : 0) + (minibarRestocked ? 1 : 0);
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                ProgressBar.builder().min(0).max(3).value(done).text(done + " of 3 tasks done").build(),
                ProgressSteps.builder()
                    .steps(
                        List.of(
                            new Step("s1", "Identity", null, "done"),
                            new Step("s2", "Payment", null, "current"),
                            new Step("s3", "Room", null, "upcoming")))
                    .build(),
                TaskProgress.builder().label("Guests registered").done(1).total(3).actionLabel("Register next").actionId("registerNext").build(),
                Checklist.builder()
                    .title("Room 102")
                    .items(
                        List.of(
                            new ChecklistItem("bedMade", "Bed made", bedMade, "toggleItem"),
                            new ChecklistItem("bathroomCleaned", "Bathroom cleaned", bathroomCleaned, "toggleItem"),
                            new ChecklistItem("minibarRestocked", "Minibar restocked", minibarRestocked, "toggleItem")))
                    .build()))
        .build();
  }

  public RoomReadiness toggleItem(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var item = (Map<?, ?>) parameters.get("_item"); // the ticked item, as sent by the browser
    boolean done = Boolean.TRUE.equals(parameters.get("_done")); // its new state
    switch (String.valueOf(item.get("id"))) {
      case "bedMade" -> bedMade = done;
      case "bathroomCleaned" -> bathroomCleaned = done;
      case "minibarRestocked" -> minibarRestocked = done;
      default -> {}
    }
    return this;
  }

  public Message registerNext() {
    return new Message("Scanning the document of guest 2…");
  }
}
