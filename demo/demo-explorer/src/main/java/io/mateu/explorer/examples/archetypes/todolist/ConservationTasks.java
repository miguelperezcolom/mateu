package io.mateu.explorer.examples.archetypes.todolist;

import io.mateu.core.infra.declarative.orchestrators.todolist.TodoList;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The {@code TodoList} archetype: pending work as counted buckets of cards. A click on a card ACTS
 * ({@link #actionOn}) — here a message; returning a {@code URI} would navigate.
 */
public class ConservationTasks extends TodoList<ConservationTasks.Task> {

  public record Task(
      String id, String title, String object, String bucket, String due, String priority) {}

  static final List<Task> TASKS =
      List.of(
          new Task("T-1", "Check the humidity log — gallery 4", "Room 4", "Today", "overdue", "high"),
          new Task("T-2", "Condition report before the loan", "Water Lilies", "Today", "today", "high"),
          new Task("T-3", "Re-frame the Dürer print", "Melencolia I", "This week", "in 2 days", ""),
          new Task("T-4", "Clean the bronze casts", "Sculpture hall", "This week", "in 4 days", "medium"),
          new Task("T-5", "Order archival boxes", "Photography store", "Later", "in 3 weeks", "low"));

  @Override
  protected List<Task> rows(HttpRequest httpRequest) {
    return TASKS;
  }

  @Override
  protected String idOf(Task task) {
    return task.id();
  }

  @Override
  protected String titleOf(Task task) {
    return task.title();
  }

  @Override
  protected String captionOf(Task task) {
    return task.object();
  }

  @Override
  protected List<Chip> badgesOf(Task task) {
    var due = Chip.builder().label(task.due()).build();
    return task.priority().isBlank()
        ? List.of(due)
        : List.of(due, Chip.builder().label(task.priority()).build());
  }

  @Override
  protected String groupOf(Task task) {
    return task.bucket();
  }

  @Override
  protected List<String> groupOrder() {
    return List.of("Today", "This week", "Later");
  }

  @Override
  protected Object actionOn(Task task, HttpRequest httpRequest) {
    return Message.success("Opening “" + task.title() + "”");
  }
}
