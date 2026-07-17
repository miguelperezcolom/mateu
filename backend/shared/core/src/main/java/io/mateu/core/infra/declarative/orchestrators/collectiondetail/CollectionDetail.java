package io.mateu.core.infra.declarative.orchestrators.collectiondetail;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.AutoSaveTrigger;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * Collection-detail page (the Oracle Redwood "Collection Detail" template): a searchable list of
 * items on the left — clickable cards with title, caption and badges — and the selected item's
 * detail on the right, re-rendered in place on every selection without leaving the page.
 *
 * <p>Extend it, implement {@link #rows}, {@link #idOf}, {@link #titleOf} and {@link #detail}, and
 * route the class with {@code @UI}/{@code @Route}. The search box filters as the user types
 * (debounced); {@link #captionOf}/{@link #badgesOf} enrich the list cards, {@link #emptyDetail}
 * customizes the right pane before any selection, {@link #listWidth} sizes the list column.
 *
 * <p>The detail pane can be any component — from a simple property card to an embedded routed
 * island (the {@code DetailIsland} pattern) when the detail must run its own actions.
 */
public abstract class CollectionDetail<Row> implements TriggersSupplier {

  @Hidden public String _selectedId;

  @Label("Search")
  public String search;

  @io.mateu.uidl.annotations.Colspan(2)
  @Label("")
  public Callable<Component> _collectionDetail = this::build;

  // ── Developer API ─────────────────────────────────────────────────────────

  /** The (already filtered) rows to list, in display order. */
  protected abstract List<Row> rows(String searchText, HttpRequest httpRequest);

  /** Stable id of a row (used to track the selection). */
  protected abstract String idOf(Row row);

  /** Main line of the row's list card. */
  protected abstract String titleOf(Row row);

  /** The detail pane for the selected row. */
  protected abstract Component detail(Row row, HttpRequest httpRequest);

  /** Secondary line of the row's list card. Null for none. */
  protected String captionOf(Row row) {
    return null;
  }

  /** Badges of the row's list card. */
  protected List<Chip> badgesOf(Row row) {
    return List.of();
  }

  /** Label over the list. Default: a results counter. */
  protected String listLabel(int count) {
    return count + " items";
  }

  /** What the right pane shows before any selection. */
  protected Component emptyDetail() {
    return EmptyState.builder()
        .icon("👈")
        .title("Select an item")
        .description("Pick an item from the list to see its detail.")
        .style("flex: 1; margin-top: 3rem;")
        .build();
  }

  /** CSS flex-basis of the list column. */
  protected String listWidth() {
    return "24rem";
  }

  // ── Wiring ────────────────────────────────────────────────────────────────

  private HttpRequest currentRequest;

  private Component build() {
    var rows = rows(search, currentRequest);
    var items = new ArrayList<QueueItem>();
    Row selected = null;
    for (var row : rows) {
      var id = idOf(row);
      var isSelected = id != null && id.equals(_selectedId);
      if (isSelected) {
        selected = row;
      }
      items.add(
          QueueItem.builder()
              .id(id)
              .title(titleOf(row))
              .caption(captionOf(row))
              .badges(badgesOf(row))
              .selected(isSelected)
              .build());
    }
    var list =
        TaskQueue.builder()
            .actionId("selectCollectionItem")
            .style("flex: 0 0 " + listWidth() + "; min-width: min(" + listWidth() + ", 100%);")
            .groups(
                List.of(QueueGroup.builder().label(listLabel(items.size())).items(items).build()))
            .build();
    var detail = selected == null ? emptyDetail() : detail(selected, currentRequest);
    return HorizontalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .style("align-items: flex-start; gap: 1.5rem; width: 100%;")
        .content(List.of(list, detail))
        .build();
  }

  @io.mateu.uidl.annotations.Action
  public Object selectCollectionItem(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _selectedId = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
    return this;
  }

  @io.mateu.uidl.annotations.Action
  public Object filterCollection(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    return this;
  }

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    // typing in the search box re-filters the list (debounced), like @AutoSave — declared here
    // because class annotations are not inherited by subclasses of this archetype
    return List.of(new AutoSaveTrigger("filterCollection", 400));
  }
}
