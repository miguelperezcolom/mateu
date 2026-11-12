package com.example.app;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;

/**
 * The submitted requests, read-only: a class implementing {@link Listing} answers {@code search};
 * {@link Searchable} adds the search box.
 */
@Title("Requests")
public class Requests implements Listing<IntakeRequest>, Searchable {

  @Override
  public ListingData<IntakeRequest> search(SearchRequest request, HttpRequest httpRequest) {
    var text = request.searchText().toLowerCase();
    return ListingData.of(
        RequestStore.INSTANCE.findAll().stream()
            .filter(
                r ->
                    text.isBlank()
                        || r.requester().toLowerCase().contains(text)
                        || r.summary().toLowerCase().contains(text))
            .toList());
  }
}
