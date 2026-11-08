package io.mateu.explorer.examples.behaviour.stereotypelookup;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.List;
import java.util.Locale;

/**
 * A lookup is a FOREIGN KEY: the field stores an id, the user searches by name. {@code
 * search} pages through the candidates as the user types (on the server — the list can be huge);
 * {@code label} turns a stored id back into the text shown, so a pre-filled field is readable.
 */
@Title("Booking")
public class BookingForm {

  @Lookup(search = Guests.class, label = Guests.class)
  String guestId = "g2";

  @Button
  Message book() {
    return Message.success("Booking for guest id " + guestId);
  }

  /** Both suppliers in one class: built with its no-args constructor (or a bean, if there is one). */
  public static class Guests implements LookupOptionsSupplier, LookupLabelSupplier {

    static final List<Option> ALL =
        List.of(
            new Option("g1", "Ada Lovelace"),
            new Option("g2", "Alan Turing"),
            new Option("g3", "Grace Hopper"),
            new Option("g4", "Margaret Hamilton"),
            new Option("g5", "Linus Torvalds"));

    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      var text = searchText == null ? "" : searchText.toLowerCase(Locale.ROOT);
      return ListingData.of(
          ALL.stream().filter(o -> o.label().toLowerCase(Locale.ROOT).contains(text)).toList());
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      return ALL.stream().filter(o -> o.value().equals(id)).map(Option::label).findFirst().orElse("" + id);
    }
  }
}
