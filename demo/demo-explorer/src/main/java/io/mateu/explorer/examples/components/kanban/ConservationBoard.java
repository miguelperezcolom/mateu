package io.mateu.explorer.examples.components.kanban;

import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanCard;
import io.mateu.uidl.data.KanbanColumn;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * A kanban board whose cards MOVE: drag a card to another column (or use its "Move to…" menu). The
 * board names {@code moveActionId = "moveTask"}, so Mateu runs {@link #moveTask} with {@code
 * _cardId}, {@code _fromColumnId}, {@code _toColumnId} and {@code _toIndex}; it updates where the
 * card lives and answers with the board again. A card's own {@code actionId} makes it clickable.
 *
 * <p>Where each card lives is this view's STATE (the {@code columnOf} field): it travels to the
 * browser and back with every action, so each visitor has a board of their own.
 */
public class ConservationBoard implements ComponentTreeSupplier {

  record Task(String id, String title, String artwork, String priority) {}

  static final List<Task> TASKS =
      List.of(
          new Task("t1", "Reframe", "The Starry Night", "high"),
          new Task("t2", "Clean varnish", "Girl with a Pearl Earring", "normal"),
          new Task("t3", "Condition report", "The Night Watch", "normal"),
          new Task("t4", "Humidity check", "Water Lilies", "low"),
          new Task("t5", "Photograph", "The Kiss", "normal"));

  /** card id → column id: the state of the board. */
  Map<String, String> columnOf =
      new LinkedHashMap<>(
          Map.of("t1", "todo", "t2", "todo", "t3", "doing", "t4", "done", "t5", "doing"));

  @Override
  public Component component(HttpRequest httpRequest) {
    return Kanban.builder()
        .moveActionId("moveTask")
        .columns(
            List.of(
                column("todo", "To do", "#64748b"),
                column("doing", "In progress", "#2563eb"),
                column("done", "Done", "#16a34a")))
        .build();
  }

  KanbanColumn column(String id, String title, String color) {
    var cards = new ArrayList<KanbanCard>();
    for (var task : TASKS) {
      if (id.equals(columnOf.get(task.id()))) {
        cards.add(
            KanbanCard.builder()
                .id(task.id())
                .title(task.title())
                .description(task.artwork())
                .badge(task.priority())
                .color("high".equals(task.priority()) ? "#dc2626" : null)
                .actionId("openTask")
                .build());
      }
    }
    return KanbanColumn.builder().id(id).title(title).color(color).cards(cards).build();
  }

  /** Runs when a card is dropped on a column. */
  public Object moveTask(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    var cardId = (String) p.get("_cardId");
    var to = (String) p.get("_toColumnId");
    columnOf.put(cardId, to);
    return List.of(this, Message.success(title(cardId) + " → " + to));
  }

  /** Runs when a card is clicked (its actionId). */
  public Message openTask(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    return new Message("Opened " + p);
  }

  static String title(String cardId) {
    return TASKS.stream().filter(t -> t.id().equals(cardId)).map(Task::title).findFirst().orElse(cardId);
  }
}
