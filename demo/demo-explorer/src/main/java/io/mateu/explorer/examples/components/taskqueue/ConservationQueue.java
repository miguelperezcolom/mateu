package io.mateu.explorer.examples.components.taskqueue;

import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A work queue: groups of cards. A click on a card runs the queue's {@code actionId} with the card
 * id in {@code _item} — typically to load that item into a detail pane (the CollectionDetail and
 * TodoList archetypes are built on it). Here the selection is the view's state, so the clicked card
 * stays marked.
 */
public class ConservationQueue implements ComponentTreeSupplier {

  String selected = "w2";

  @Override
  public Component component(HttpRequest httpRequest) {
    return TaskQueue.builder()
        .actionId("pick")
        .groups(
            List.of(
                QueueGroup.builder()
                    .label("Due today")
                    .items(
                        List.of(
                            item("w1", "Humidity check", "Gallery 3 · Water Lilies", new Chip("urgent", "error")),
                            item("w2", "Condition report", "Store B · The Kiss", new Chip("loan", "info"))))
                    .build(),
                QueueGroup.builder()
                    .label("This week")
                    .items(List.of(item("w3", "Reframe", "Lab · The Starry Night", new Chip("2 days", "contrast"))))
                    .build()))
        .build();
  }

  QueueItem item(String id, String title, String caption, Chip badge) {
    return QueueItem.builder()
        .id(id)
        .title(title)
        .caption(caption)
        .badges(List.of(badge))
        .selected(id.equals(selected))
        .build();
  }

  public Object pick(HttpRequest httpRequest) {
    selected = (String) httpRequest.runActionRq().parameters().get("_item");
    return List.of(this, new Message("Loaded task " + selected));
  }
}
