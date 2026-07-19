package io.mateu.core.infra.declarative.orchestrators.todolist;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.Callable;

/**
 * To-do list page (the Oracle Redwood/Fusion "To-do list" template): the user's pending work as a
 * {@link TaskQueue} of grouped, clickable cards — buckets such as <i>Today / This week / Later</i>
 * or per status, each labelled with its counter — where clicking an item <b>acts on it</b>
 * (typically navigating to the task) instead of selecting it for a side detail pane.
 *
 * <p>Extend it and implement {@link #rows}, {@link #idOf}, {@link #titleOf}, {@link #groupOf} and
 * {@link #actionOn}, and route the class with {@code @UI}/{@code @Route}. {@link #captionOf} and
 * {@link #badgesOf} enrich the cards (due date, priority), {@link #groupLabel} customizes the
 * bucket labels (default {@code "name (count)"}), {@link #groupOrder} fixes the bucket order
 * (default: first appearance), {@link #emptyState} customizes the all-caught-up pane shown when
 * there is nothing pending.
 */
public abstract class TodoList<Row> implements TriggersSupplier {

  @Hidden public String _itemId;

  @Colspan(2)
  @Label("")
  public Callable<Component> _todoList = this::build;

  // ── Developer API ─────────────────────────────────────────────────────────

  /** The pending rows to list, in display order within each bucket. */
  protected abstract List<Row> rows(HttpRequest httpRequest);

  /** Stable id of a row (used to find it back on click). */
  protected abstract String idOf(Row row);

  /** Main line of the row's card. */
  protected abstract String titleOf(Row row);

  /**
   * Bucket key of a row (e.g. "Today"); buckets render in first-appearance order unless {@link
   * #groupOrder} says otherwise.
   */
  protected abstract String groupOf(Row row);

  /**
   * What clicking the row's card does — typically a {@code URI} to navigate to the task, or any
   * other Mateu action result (a {@code Message}, a dialog {@code Component}, ...).
   */
  protected abstract Object actionOn(Row row, HttpRequest httpRequest);

  /** Secondary line of the row's card. Null for none. */
  protected String captionOf(Row row) {
    return null;
  }

  /** Badges of the row's card (due date, priority, ...). */
  protected List<Chip> badgesOf(Row row) {
    return List.of();
  }

  /** Label of a bucket. Default: {@code "name (count)"}. */
  protected String groupLabel(String group, int count) {
    return group + " (" + count + ")";
  }

  /**
   * Explicit bucket order (buckets not listed go last, in first-appearance order). Default: first
   * appearance.
   */
  protected List<String> groupOrder() {
    return List.of();
  }

  /** What the page shows when there is nothing pending. */
  protected Component emptyState() {
    return EmptyState.builder()
        .icon("🎉")
        .title("All caught up!")
        .description("There is nothing pending on your plate.")
        .build();
  }

  // ── Wiring ────────────────────────────────────────────────────────────────

  private HttpRequest currentRequest;

  private Component build() {
    var rows = rows(currentRequest);
    if (rows.isEmpty()) {
      return emptyState();
    }
    var buckets = new LinkedHashMap<String, List<QueueItem>>();
    for (var row : rows) {
      var id = idOf(row);
      buckets
          .computeIfAbsent(groupOf(row), key -> new ArrayList<>())
          .add(
              QueueItem.builder()
                  .id(id)
                  .title(titleOf(row))
                  .caption(captionOf(row))
                  .badges(badgesOf(row))
                  .selected(id != null && id.equals(_itemId))
                  .build());
    }
    var keys = new ArrayList<>(buckets.keySet());
    var explicit = groupOrder();
    if (!explicit.isEmpty()) {
      keys.sort(
          (a, b) -> {
            var ia = explicit.indexOf(a);
            var ib = explicit.indexOf(b);
            return Integer.compare(ia < 0 ? explicit.size() : ia, ib < 0 ? explicit.size() : ib);
          });
    }
    var groups =
        keys.stream()
            .map(
                key ->
                    QueueGroup.builder()
                        .label(groupLabel(key, buckets.get(key).size()))
                        .items(buckets.get(key))
                        .build())
            .toList();
    return TaskQueue.builder().actionId("openTodoItem").groups(groups).build();
  }

  @io.mateu.uidl.annotations.Action
  public Object openTodoItem(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _itemId = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
    return rows(httpRequest).stream()
        .filter(row -> Objects.equals(idOf(row), _itemId))
        .findFirst()
        .map(row -> actionOn(row, httpRequest))
        .orElse(this);
  }

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    return List.of();
  }
}
