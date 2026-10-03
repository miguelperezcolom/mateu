package io.mateu.federation.remote;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.interfaces.Searchable;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

/**
 * A listing with a detail page, inside the REMOTE app's menu.
 *
 * <p>The shape a pasted link has to survive in a federated deployment: shell + remote menu path +
 * listing + record id. Clicking a row inside the app is not the same journey as arriving cold from
 * a link — the second one is the only one that makes the shell resolve the whole path before any
 * of the apps involved have rendered anything.
 */
@Title("Remote Things")
public class RemoteThings
    implements Listing<RemoteThings.Row>,
        Searchable,
        Filterable<RemoteThings.Filters>,
        Navigable<RemoteThings.Detail, String> {

  public enum Kind {
    Odd,
    Even
  }

  public record Row(String id, String name, Kind kind) {}

  /**
   * Declared filters, settable from the URL by field name ({@code ?kind=Even}). The id-set filter
   * ({@code ?ids=t2,t5}) is declared by nobody: the framework narrows this listing to those rows,
   * though its search below never looks at {@code request.ids()}.
   */
  public static class Filters {
    Set<Kind> kind;
  }

  @Title("Remote Thing")
  public record Detail(String id, String name, String note) {}

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    var filters = filters(request);
    var text = request.searchText() == null ? "" : request.searchText().toLowerCase();
    var rows =
        IntStream.rangeClosed(1, 8)
            .mapToObj(i -> new Row("t" + i, "Remote thing " + i, i % 2 == 0 ? Kind.Even : Kind.Odd))
            .filter(row -> filters == null || filters.kind == null || filters.kind.isEmpty()
                || filters.kind.contains(row.kind()))
            .filter(row -> text.isBlank() || row.name().toLowerCase().contains(text))
            .toList();
    return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
  }

  @Override
  public Detail view(String id, HttpRequest httpRequest) {
    return new Detail(id, "Remote thing " + id, "Opened by its own URL.");
  }
}
