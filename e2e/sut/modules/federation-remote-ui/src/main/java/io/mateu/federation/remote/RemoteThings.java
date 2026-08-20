package io.mateu.federation.remote;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.util.List;
import java.util.stream.IntStream;

/**
 * A listing with a detail page, inside the REMOTE app's menu.
 *
 * <p>The shape a pasted link has to survive in a federated deployment: shell + remote menu path +
 * listing + record id. Clicking a row inside the app is not the same journey as arriving cold from
 * a link — the second one is the only one that makes the shell resolve the whole path before any
 * of the apps involved have rendered anything.
 */
@Route(value = "/remote/things", parentRoute = "/remote")
@Title("Remote Things")
public class RemoteThings implements Listing<RemoteThings.Row>, Navigable<RemoteThings.Detail, String> {

  public record Row(String id, String name) {}

  @Title("Remote Thing")
  public record Detail(String id, String name, String note) {}

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    var rows = IntStream.rangeClosed(1, 8).mapToObj(i -> new Row("t" + i, "Remote thing " + i)).toList();
    return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
  }

  @Override
  public Detail view(String id, HttpRequest httpRequest) {
    return new Detail(id, "Remote thing " + id, "Opened by its own URL.");
  }
}
