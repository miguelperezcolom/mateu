package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * External REST listing: a @RestListing class renders its columns from the Row type, and the
 * endpoint descriptor travels on CrudlDto.rowsSource so the frontend fetches the rows CLIENT-SIDE
 * (the listing surface of consuming non-Mateu endpoints). search() is never called.
 */
class RestListingSyncTest {

  @SuppressWarnings("unused")
  @UI("/restlist")
  @Title("Rest listing")
  @RestListing(
      url = "https://api.example.com/countries?q=${state.searchText}",
      method = "GET",
      headers = {"Authorization: Bearer ${state.token}"},
      itemsPath = "data.countries")
  public static class RestList implements Listing<RestList.Country> {

    public record Country(String code, String name, long population) {}

    @Override
    public ListingData<Country> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestList.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void restListingCarriesTheEndpointDescriptorAndColumnsFromTheRowType() {
    var increment = mateu.sync("/restlist");
    var crudls = new java.util.ArrayList<io.mateu.dtos.CrudlDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.CrudlDto.class, crudls);
    assertThat(crudls).isNotEmpty();
    var crudl = crudls.get(0);

    var source = crudl.rowsSource();
    assertThat(source).isNotNull();
    assertThat(source.url()).isEqualTo("https://api.example.com/countries?q=${state.searchText}");
    assertThat(source.method()).isEqualTo("GET");
    assertThat(source.headers()).containsEntry("Authorization", "Bearer ${state.token}");
    assertThat(source.itemsPath()).isEqualTo("data.countries");

    // columns come from the Row record as usual (the frontend keys each JSON item by column id)
    assertThat(crudl.columns()).isNotEmpty();
  }
}
