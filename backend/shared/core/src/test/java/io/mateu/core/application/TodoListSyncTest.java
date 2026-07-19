package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.todolist.TodoList;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.EmptyStateDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TaskQueueDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * TodoList archetype (the Redwood "To-do list" template): the pending work as grouped, clickable
 * cards — buckets with counters, due/priority badges — where clicking an item acts on it (navigates
 * to the task) instead of selecting it for a detail pane.
 */
class TodoListSyncTest {

  record Task(String id, String title, String project, String bucket, String due) {}

  static final List<Task> TASKS =
      List.of(
          new Task("t1", "Approve expenses", "Finance", "Today", "overdue"),
          new Task("t2", "Sign contract", "Legal", "Today", "today"),
          new Task("t3", "Review candidate", "HR", "This week", "in 3 days"),
          new Task("t4", "Renew license", "IT", "Later", "in 2 weeks"));

  @UI("/my-tasks")
  @Title("My tasks")
  public static class MyTasks extends TodoList<Task> {

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
      return task.project();
    }

    @Override
    protected List<Chip> badgesOf(Task task) {
      return List.of(Chip.builder().label(task.due()).build());
    }

    @Override
    protected String groupOf(Task task) {
      return task.bucket();
    }

    @Override
    protected Object actionOn(Task task, HttpRequest httpRequest) {
      return URI.create("/tasks/" + task.id());
    }
  }

  @UI("/ordered-tasks")
  @Title("Ordered tasks")
  public static class OrderedTasks extends MyTasks {
    @Override
    protected List<String> groupOrder() {
      return List.of("Later", "Today");
    }
  }

  @UI("/no-tasks")
  @Title("No tasks")
  public static class NoTasks extends MyTasks {
    @Override
    protected List<Task> rows(HttpRequest httpRequest) {
      return List.of();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(MyTasks.class, OrderedTasks.class, NoTasks.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private UIIncrementDto run(
      String route, String serverSideType, String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(serverSideType)
            .actionId(actionId)
            .initiatorComponentId("td_app")
            .parameters(parameters)
            .build());
  }

  private static TaskQueueDto queueOf(String route) {
    var increment = mateu.sync(route);
    var queues =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), TaskQueueDto.class);
    assertThat(queues).hasSize(1);
    return queues.get(0);
  }

  @Test
  void initialRenderGroupsTheRowsIntoCountedBucketsInFirstAppearanceOrder() {
    var queue = queueOf("/my-tasks");
    assertThat(queue.groups())
        .extracting(group -> group.label())
        .containsExactly("Today (2)", "This week (1)", "Later (1)");
    assertThat(queue.groups().get(0).items())
        .extracting(item -> item.title())
        .containsExactly("Approve expenses", "Sign contract");
    assertThat(queue.groups().get(0).items().get(0).caption()).isEqualTo("Finance");
    assertThat(queue.groups().get(0).items().get(0).badges())
        .extracting(badge -> badge.label())
        .containsExactly("overdue");
  }

  @Test
  void explicitGroupOrderWinsOverFirstAppearance() {
    var queue = queueOf("/ordered-tasks");
    assertThat(queue.groups())
        .extracting(group -> group.label())
        .containsExactly("Later (1)", "Today (2)", "This week (1)");
  }

  @Test
  void clickingAnItemRunsItsActionInsteadOfSelectingIt() {
    var increment =
        run("/my-tasks", MyTasks.class.getName(), "openTodoItem", Map.of("_item", "t2"));
    var navigations =
        increment.commands().stream()
            .filter(command -> command.type() == UICommandTypeDto.NavigateTo)
            .toList();
    assertThat(navigations).hasSize(1);
    assertThat(navigations.get(0).data()).isEqualTo("/tasks/t2");
  }

  @Test
  void nothingPendingShowsTheAllCaughtUpEmptyState() {
    var increment = mateu.sync("/no-tasks");
    var states =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), EmptyStateDto.class);
    assertThat(states).isNotEmpty();
    assertThat(states.get(0).title()).isEqualTo("All caught up!");
    assertThat(
            FieldKindsSyncTest.collect(
                increment.fragments().get(0).component(), TaskQueueDto.class))
        .isEmpty();
  }
}
