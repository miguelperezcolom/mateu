package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * A listing an ACTION returns (demo-vb-pms {@code FolioWindows}: drop rows on a window, the action
 * answers {@code List.of(this, message)}). The header above the table re-rendered with the new
 * numbers but the table kept its OLD rows until the next search — the listing's OnLoad search
 * counted as already fired. Now the returned listing loads like on opening.
 *
 * <p>The header holds the count and an "Add a row" button whose action appends a row and returns
 * the page again; the table must show the new row with no search of its own.
 */
@UI("/returned-listing")
@Title("Returned listing")
public class ReturnedListingForm implements Listing<ReturnedListingForm.Row>, HeaderSupplier {

  public record Row(String id, String name) {}

  static final List<Row> ROWS =
      new CopyOnWriteArrayList<>(List.of(new Row("1", "First row"), new Row("2", "Second row")));

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    var rows = new ArrayList<>(ROWS);
    return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
  }

  @Override
  public List<Component> header(HttpRequest httpRequest) {
    return List.of(
        new Text("returned-listing-count", ROWS.size() + " rows"),
        new Button("Add a row", "addRow"));
  }

  @Override
  public boolean supportsAction(String actionId) {
    return "search".equals(actionId) || "addRow".equals(actionId);
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<>(Listing.super.actions(httpRequest));
    actions.add(Action.builder().id("addRow").build());
    return actions;
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if (!"addRow".equals(actionId)) {
      return Listing.super.handleAction(actionId, httpRequest);
    }
    var row = new Row(String.valueOf(ROWS.size() + 1), "Added row " + (ROWS.size() + 1));
    ROWS.add(row);
    return List.of(this, new Message(row.name() + " added"));
  }
}
