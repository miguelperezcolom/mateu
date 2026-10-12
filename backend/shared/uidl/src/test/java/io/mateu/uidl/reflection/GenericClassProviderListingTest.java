package io.mateu.uidl.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import org.junit.jupiter.api.Test;

/**
 * The row and filters types of a listing, read off the class declaration — including when a base
 * class hands its own type variables to the interfaces in ANOTHER order. HeroSearch<Filters, Row>
 * implements Listing<Row>: Listing's Row (its position 0) was read as the base's position 0, the
 * Filters, and a hero search's result cards showed its filter fields.
 */
class GenericClassProviderListingTest {

  record F(String zone) {}

  record R(String name) {}

  abstract static class Base<Filters, Row> implements Listing<Row>, Filterable<Filters> {}

  static class Concrete extends Base<F, R> {
    @Override
    public ListingData<R> search(SearchRequest request, HttpRequest httpRequest) {
      return null;
    }
  }

  static class Direct implements Listing<R>, Filterable<F> {
    @Override
    public ListingData<R> search(SearchRequest request, HttpRequest httpRequest) {
      return null;
    }
  }

  @Test
  void aBaseThatReordersItsTypeVariablesResolvesEachInterfaceArgument() {
    assertThat(GenericClassProvider.getGenericClass(Concrete.class, Listing.class, "Row"))
        .isEqualTo(R.class);
    assertThat(GenericClassProvider.getGenericClass(Concrete.class, Filterable.class, "Filters"))
        .isEqualTo(F.class);
  }

  @Test
  void aDirectImplementationStillResolves() {
    assertThat(GenericClassProvider.getGenericClass(Direct.class, Listing.class, "Row"))
        .isEqualTo(R.class);
    assertThat(GenericClassProvider.getGenericClass(Direct.class, Filterable.class, "Filters"))
        .isEqualTo(F.class);
  }
}
