package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.data.SearchRequest;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * A listing, under {@link HotelApp}'s menu, whose detail route ({@code /hotel/stays/:id}) can name a record that does not exist — a stay
 * deleted since the link was shared. {@code view(id)} throws {@link NoSuchElementException} with a
 * user-facing message, and Mateu renders its not-found page with that message as the heading
 * instead of an error and an empty page.
 */
@Title("Stays")
public class StaysListing implements Listing<StaysListing.Stay>, Navigable<StaysListing.Stay, String> {

  public record Stay(String id, String guest) {}

  private static final List<Stay> STAYS = List.of(new Stay("FO-1", "Ana Pérez"));

  @Override
  public ListingData<Stay> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(STAYS);
  }

  @Override
  public Stay view(String id, HttpRequest httpRequest) {
    return STAYS.stream()
        .filter(stay -> stay.id().equals(id))
        .findFirst()
        .orElseThrow(() -> new NoSuchElementException("Stay " + id + " not found"));
  }
}
