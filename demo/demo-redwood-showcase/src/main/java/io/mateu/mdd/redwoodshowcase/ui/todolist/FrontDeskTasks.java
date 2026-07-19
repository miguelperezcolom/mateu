package io.mateu.mdd.redwoodshowcase.ui.todolist;

import io.mateu.core.infra.declarative.orchestrators.todolist.TodoList;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * Demo of the {@link TodoList} archetype: the Oracle Redwood "To-do list" template — the front
 * desk's pending work as grouped, clickable cards (buckets Today / This week / Later with their
 * counters, due and priority badges on each card). Clicking a task acts on it: it navigates to the
 * booking detail of the foldout demo.
 */
@UI("/todo-list-demo")
@Title("Front desk tasks")
public class FrontDeskTasks extends TodoList<FrontDeskTasks.Task> {

  public record Task(
      String id, String title, String guest, String bucket, String due, String priority) {}

  private static final List<Task> TASKS =
      List.of(
          new Task(
              "T-101",
              "Review pending check-in — room 204",
              "Jane Smith",
              "Today",
              "overdue",
              "high"),
          new Task(
              "T-102",
              "Approve late checkout — room 318",
              "Omar Farouk",
              "Today",
              "today",
              "medium"),
          new Task(
              "T-103",
              "Call airport transfer for the 17:40 arrival",
              "Lucía Fernández",
              "Today",
              "today",
              ""),
          new Task(
              "T-104",
              "Log maintenance issue — broken AC, room 512",
              "Raj Patel",
              "Today",
              "today",
              "high"),
          new Task(
              "T-105",
              "Review security deposit hold — booking #4812",
              "Chen Wei",
              "This week",
              "in 2 days",
              ""),
          new Task(
              "T-106",
              "Confirm crib and extra bed — room 121",
              "Anna Kowalski",
              "This week",
              "in 3 days",
              "medium"),
          new Task(
              "T-107",
              "Prepare invoice for the corporate stay",
              "Diego Torres (Acme Corp.)",
              "This week",
              "in 4 days",
              ""),
          new Task(
              "T-108",
              "Renew the pool towels purchase order",
              "Housekeeping",
              "Later",
              "in 2 weeks",
              "low"),
          new Task(
              "T-109",
              "Plan the overbooking strategy for high season",
              "Front office",
              "Later",
              "in 3 weeks",
              ""));

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
    return task.guest();
  }

  @Override
  protected List<Chip> badgesOf(Task task) {
    var badges = new ArrayList<Chip>();
    badges.add(Chip.builder().label(task.due()).build());
    if (task.priority() != null && !task.priority().isBlank()) {
      badges.add(Chip.builder().label(task.priority()).build());
    }
    return badges;
  }

  @Override
  protected String groupOf(Task task) {
    return task.bucket();
  }

  @Override
  protected Object actionOn(Task task, HttpRequest httpRequest) {
    return URI.create("/foldout-demo");
  }
}
