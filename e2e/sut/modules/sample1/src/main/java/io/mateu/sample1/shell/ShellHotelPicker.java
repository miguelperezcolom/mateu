package io.mateu.sample1.shell;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.stream.IntStream;

/** Twelve hotels: more than 7, so the header picker is searchable (server-side search). */
public class ShellHotelPicker implements LookupOptionsSupplier {

  static final String[] NAMES = {
    "Alcudia", "Bilbao", "Cadiz", "Denia", "Elche", "Formentera", "Girona", "Huelva", "Ibiza",
    "Jaca", "Lugo", "Madrid"
  };

  @Override
  public ListingData<Option> search(
      String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase();
    return ListingData.of(
        IntStream.range(0, NAMES.length)
            .filter(i -> NAMES[i].toLowerCase().contains(text))
            .mapToObj(i -> new Option("h" + (i + 1), "Hotel " + NAMES[i]))
            .toArray(Option[]::new));
  }
}
