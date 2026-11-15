package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;

/**
 * Row actions stay on screen: a task-inbox-like listing with many wide columns and a per-row
 * actions column, LAST. The listing is wider than the viewport, and the actions column is pinned
 * to the grid's end edge so it can be used without scrolling sideways.
 */
@UI("/wide-row-actions")
@Title("Wide row actions")
public class WideRowActionsListing implements Listing<WideRowActionsListing.Row> {

  public record Row(
      String id,
      String task,
      String process,
      String assignee,
      String candidateGroup,
      String businessKey,
      String createdAt,
      String dueDate,
      String priority,
      String tenant,
      String description,
      ColumnActionGroup actions) {}

  private static Row row(int n) {
    return new Row(
        "T-" + n,
        "Review the purchase order number " + n + " before approval",
        "Purchase order approval process (procurement)",
        "someone.with.a.long.name" + n + "@example.com",
        "procurement-approvers-europe-west",
        "PO-2026-000000" + n,
        "2026-11-14 09:3" + n + ":00",
        "2026-11-21 18:00:00",
        "High priority",
        "tenant-of-the-north-region",
        "A rather long free text description of what the task is about, number " + n,
        new ColumnActionGroup(
            new ColumnAction[] {
              new ColumnAction("claimTask", "Claim"), new ColumnAction("completeTask", "Complete")
            }));
  }

  static final List<Row> ROWS = List.of(row(1), row(2), row(3));

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    return new ListingData<>(new Page<>("", ROWS.size(), 0, ROWS.size(), ROWS));
  }

  public Message claimTask(Row row) {
    return new Message("Claimed " + row.id());
  }

  public Message completeTask(Row row) {
    return new Message("Completed " + row.id());
  }
}
