package io.mateu.sample1;

import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;

/**
 * A listing whose rows come from an arbitrary REST endpoint, fetched CLIENT-SIDE. The columns come
 * from the Row record; the JSON is served same-origin by the app (static/rest-listing-demo.json)
 * and {@code itemsPath} navigates to the array. {@code search(...)} is never called — the rows are
 * fetched client-side — so it returns empty.
 */
@UI("/rest-listing")
@Title("REST Listing")
@RestListing(url = "/rest-listing-demo.json", itemsPath = "data.countries")
public class RestListingForm implements Listing<RestListingForm.Country> {

  public record Country(String code, String name, long population) {}

  @Override
  public ListingData<Country> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.of();
  }
}
