package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.util.List;

/**
 * Whole-row click (decision U1): a navigable listing opens the record wherever the row is clicked,
 * not only on its id link — except the cells with a click of their own. This one has all three
 * kinds the rule tells apart: plain cells (open the row), a button column (runs its own action and
 * stays) and the selection checkbox (selects and stays).
 */
@UI("/row-open")
@Title("Row open")
public class RowOpenListingForm
    implements Listing<RowOpenListingForm.Row>,
        Navigable<RowOpenListingForm.Row, String>,
        Deletable<String> {

  public record Row(String id, String name, String city, ColumnActionGroup actions) {}

  static final List<Row> ROWS =
      List.of(
          row("R-001", "Ada Lovelace", "London"),
          row("R-002", "Grace Hopper", "Arlington"),
          row("R-003", "Edsger Dijkstra", "Rotterdam"));

  private static Row row(String id, String name, String city) {
    return new Row(
        id, name, city, new ColumnActionGroup(new ColumnAction[] {new ColumnAction("approve", "Approve")}));
  }

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    return new ListingData<>(new Page<>("", ROWS.size(), 0, ROWS.size(), ROWS));
  }

  @Override
  public Row view(String id, HttpRequest httpRequest) {
    return ROWS.stream().filter(r -> r.id().equals(id)).findFirst().orElseThrow();
  }

  @Override
  public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}

  /** The button column's own action: runs on the clicked row and leaves the listing where it is. */
  public Message approve(Row row) {
    return new Message("Approved " + row.name());
  }
}
