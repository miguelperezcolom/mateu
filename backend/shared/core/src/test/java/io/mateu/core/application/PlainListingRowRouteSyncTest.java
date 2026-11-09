package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.RowRoute;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * {@code @RowRoute} on a PLAIN {@link Listing} (no interaction capabilities, never promoted to the
 * CRUD mediator) makes its rows open the route, as it does on a CRUD. Only the CRUD path read the
 * annotation, so the plain listing's rows did nothing.
 */
class PlainListingRowRouteSyncTest {

  public record Planet(String id, String name) {}

  @UI("/plain-row-route")
  @RowRoute("/planets/${row.id}")
  public static class Planets implements Listing<Planet> {
    @Override
    public ListingData<Planet> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Planet("1", "Tatooine")));
    }
  }

  @Test
  void theRowsOfAPlainListingOpenItsRowRoute() throws Exception {
    try (var mateu = TestMateu.withUis(Planets.class)) {
      var json = new ObjectMapper().writeValueAsString(mateu.sync("/plain-row-route"));
      assertThat(json).contains("\"rowRoute\":\"/planets/${row.id}\"");
    }
  }
}
