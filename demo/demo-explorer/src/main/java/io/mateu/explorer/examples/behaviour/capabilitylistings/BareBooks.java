package io.mateu.explorer.examples.behaviour.capabilitylistings;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;

/**
 * Nothing declared: a grid with sorting and paging, and that is all — no search box, no filters,
 * no buttons, rows not clickable.
 */
@Title("Books (bare listing)")
public class BareBooks implements Listing<Books.Book> {

  @Override
  public ListingData<Books.Book> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(Books.BOOKS.subList(0, 8));
  }
}
