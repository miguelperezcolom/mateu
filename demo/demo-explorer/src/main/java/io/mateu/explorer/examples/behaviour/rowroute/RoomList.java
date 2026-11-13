package io.mateu.explorer.examples.behaviour.rowroute;

import io.mateu.uidl.annotations.RowRoute;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;

/**
 * {@code @RowRoute}: clicking a row (anywhere on it, or Enter on a focused row) NAVIGATES to a
 * route built from the row — a real URL, so the record is addressable, shareable and survives a
 * reload. In YAML it is {@code rowRoute:} on a Listing. It works on any listing — this one is a
 * bare {@link Listing}, with no CRUD behind it.
 */
@Title("Rooms")
@RowRoute("/x/behaviour/row-route/rooms/${row.id}")
public class RoomList implements Listing<RoomList.Room> {

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
}
