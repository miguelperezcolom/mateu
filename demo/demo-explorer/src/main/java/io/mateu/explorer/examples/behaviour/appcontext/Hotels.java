package io.mateu.explorer.examples.behaviour.appcontext;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.List;
import java.util.Locale;
import java.util.stream.IntStream;

/**
 * A searchable context: more than seven options, so the header picker becomes a search panel. The
 * first page (empty search) is loaded with the app; typing filters it and, debounced, asks this
 * supplier for matches it did not load.
 */
public class Hotels implements LookupOptionsSupplier {

  private static final String[] CITIES = {"Palma", "Madrid", "Lisbon", "Paris", "Rome", "Berlin"};

  static final List<Option> ALL =
      IntStream.rangeClosed(1, 40)
          .mapToObj(i -> new Option("H" + i, "Hotel " + CITIES[i % CITIES.length] + " " + i))
          .toList();

  @Override
  public ListingData<Option> search(
      String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase(Locale.ROOT);
    var matches =
        ALL.stream().filter(o -> o.label().toLowerCase(Locale.ROOT).contains(text)).limit(20).toList();
    return ListingData.from(matches);
  }
}
