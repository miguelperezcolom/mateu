package com.example.app;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanCard;
import io.mateu.uidl.data.KanbanColumn;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * A kanban board, built as a component tree: a {@link ComponentTreeSupplier} returns the components
 * to draw. The board names {@code moveActionId = "moveTask"}, so dropping a card on another column
 * runs {@link #moveTask} with {@code _cardId} and {@code _toColumnId}; it records the move and
 * answers with the board again. A card's {@code actionId} makes it clickable ({@link #openTask}).
 */
@Title("Board")
public class Board implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Kanban.builder()
        .moveActionId("moveTask")
        .columns(
            List.of(
                column(Task.Stage.Todo, "To do", "#64748b"),
                column(Task.Stage.Doing, "In progress", "#2563eb"),
                column(Task.Stage.Done, "Done", "#16a34a")))
        .build();
  }

  private KanbanColumn column(Task.Stage stage, String title, String color) {
    var cards =
        TaskStore.INSTANCE.findAll().stream()
            .filter(t -> t.stage() == stage)
            .map(
                t ->
                    KanbanCard.builder()
                        .id(t.id())
                        .title(t.title())
                        .description(t.assignee() + " · due " + t.due())
                        .badge(t.urgent() ? "urgent" : null)
                        .color(t.urgent() ? "#dc2626" : null)
                        .actionId("openTask")
                        .build())
            .toList();
    return KanbanColumn.builder().id(stage.name()).title(title).color(color).cards(cards).build();
  }

  /** Runs when a card is dropped on a column. */
  public Object moveTask(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    var to = Task.Stage.valueOf((String) p.get("_toColumnId"));
    var task = TaskStore.INSTANCE.findById((String) p.get("_cardId")).orElseThrow();
    TaskStore.INSTANCE.save(task.movedTo(to));
    return List.of(this, Message.success(task.title() + " → " + to));
  }

  /** Runs when a card is clicked: the card travels as {@code _clickedCard}. */
  public Message openTask(HttpRequest httpRequest) {
    var card = (Map<?, ?>) httpRequest.runActionRq().parameters().get("_clickedCard");
    var id = card != null ? String.valueOf(card.get("id")) : "";
    return TaskStore.INSTANCE
        .findById(id)
        .map(t -> new Message(t.title() + " — " + t.assignee() + ", due " + t.due()))
        .orElse(new Message("Task " + id));
  }
}
