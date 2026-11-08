package io.mateu.explorer.examples.behaviour.rowroute;

import io.mateu.uidl.annotations.RowRoute;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.util.List;

/**
 * {@code @RowRoute}: clicking a row (anywhere on it, or Enter on a focused row) NAVIGATES to a
 * route built from the row — a real URL, so the record is addressable, shareable and survives a
 * reload. In YAML it is {@code rowRoute:} on a Listing.
 *
 * <p>In 3.0-beta.51 the annotation is read only on a listing served as a CRUD (a {@code Crud}, or a
 * capability listing such as this {@link Navigable} one); a bare {@code Listing} ignores it.
 */
@Title("Rooms")
@RowRoute("/x/behaviour/row-route/rooms/${row.id}")
public class RoomList implements Listing<RoomList.Room>, Navigable<RoomRecord, String> {

  public record Room(String id, String type, String status) {}

  static final List<Room> ROOMS =
      List.of(
          new Room("101", "Single", "Ready"),
          new Room("214", "Sea-view double", "Occupied"),
          new Room("305", "Suite", "Cleaning"));

  @Override
  public ListingData<Room> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.of(ROOMS);
  }

  /** The crud's own record view — bypassed: the row route wins. */
  @Override
  public RoomRecord view(String id, HttpRequest httpRequest) {
    var record = new RoomRecord();
    record.id = id;
    record.onHydrated(httpRequest);
    return record;
  }
}
