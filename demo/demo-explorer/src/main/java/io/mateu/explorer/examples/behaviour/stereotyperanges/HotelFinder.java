package io.mateu.explorer.examples.behaviour.stereotyperanges;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Ranges are FILTERS: a filters record field typed {@link DateRange} renders a from–to date picker,
 * {@link NumberRange} a min–max pair, and a {@code Set} of an enum a multi-select. They arrive in
 * {@link #search} as ready-made typed values, with {@code contains(...)} helpers.
 */
@Title("Hotels")
public class HotelFinder implements Listing<HotelFinder.Hotel>, Filterable<HotelFinder.Filters> {

  public enum Board {
    ROOM_ONLY,
    BREAKFAST,
    HALF_BOARD,
    ALL_INCLUSIVE
  }

  public record Hotel(String name, double price, LocalDate openedOn, Board board) {}

  public record Filters(NumberRange price, DateRange openedOn, Set<Board> board) {}

  static final List<Hotel> HOTELS =
      List.of(
          new Hotel("Sea Breeze", 89, LocalDate.of(2015, 5, 1), Board.BREAKFAST),
          new Hotel("Old Town Inn", 65, LocalDate.of(1998, 3, 12), Board.ROOM_ONLY),
          new Hotel("Palm Resort", 210, LocalDate.of(2021, 6, 20), Board.ALL_INCLUSIVE),
          new Hotel("Harbour View", 140, LocalDate.of(2010, 9, 9), Board.HALF_BOARD),
          new Hotel("Mountain Lodge", 120, LocalDate.of(2005, 11, 30), Board.HALF_BOARD));

  @Override
  public ListingData<Hotel> search(SearchRequest request, HttpRequest httpRequest) {
    var f = filters(request);
    return ListingData.of(
        HOTELS.stream()
            .filter(h -> f == null || f.price() == null || f.price().contains(h.price()))
            .filter(h -> f == null || f.openedOn() == null || f.openedOn().contains(h.openedOn()))
            .filter(h -> f == null || f.board() == null || f.board().isEmpty() || f.board().contains(h.board()))
            .toList());
  }
}
