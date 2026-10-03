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

  /** A by-reference listing that opens a record by URL (the static VCN slice's listing). */
  @SuppressWarnings("unused")
  @UI("/restlist-by-ref")
  @Title("Rest listing by ref")
  @RestListing(source = "vcns", rowRoute = "vcns/${row.id}")
  public static class RestListByRef implements Listing<RestList.Country> {
    @Override
    public ListingData<RestList.Country> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestList.class, RestListByRef.class);
  }

  private static io.mateu.dtos.CrudlDto crudlOf(io.mateu.dtos.UIIncrementDto increment) {
    var crudls = new java.util.ArrayList<io.mateu.dtos.CrudlDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.CrudlDto.class, crudls);
    assertThat(crudls).isNotEmpty();
    return crudls.get(0);
  }

  @Test
  void aRowRouteOpensTheRecordByUrl() {
    assertThat(crudlOf(mateu.sync("/restlist-by-ref")).rowRoute()).isEqualTo("vcns/${row.id}");
    // and none by default: a row click does nothing
    assertThat(crudlOf(mateu.sync("/restlist")).rowRoute()).isNull();
  }

  @Test
  void aByReferenceListingLeavesTheMethodToTheCatalogue() {
    // the annotation's default GET must not override the entry's method (blank = the entry's)
    assertThat(crudlOf(mateu.sync("/restlist-by-ref")).rowsSource().method()).isBlank();
    // an inline url keeps its method
    assertThat(crudlOf(mateu.sync("/restlist")).rowsSource().method()).isEqualTo("GET");
  }

  @Test
  void aRestListingDoesNotAskTheServerToSearchOnLoad() {
    // the renderer fetches the REST rows itself; a server `search` on load is a round trip to a
    // search() that never runs — and, in a static bundle, a call to a server that is not there
    var component = mateu.sync("/restlist").fragments().get(0).component();
    assertThat(component).isInstanceOf(io.mateu.dtos.ServerSideComponentDto.class);
    var triggers = ((io.mateu.dtos.ServerSideComponentDto) component).triggers();
    assertThat(triggers)
        .noneMatch(
            t ->
                t instanceof io.mateu.dtos.OnLoadTriggerDto load
                    && "search".equals(load.actionId()));
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
