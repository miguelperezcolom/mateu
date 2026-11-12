package com.example.app;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;

/**
 * A read-only listing: a class implementing {@link Listing} answers {@code search}, and each
 * capability it declares adds to the screen — {@link Searchable} adds the search box. Add {@code
 * Filterable}, {@code Navigable}, {@code Creatable}… to grow it; the Products screen is the full
 * CRUD.
 */
@Title("Orders")
public class Orders implements Listing<Order>, Searchable {

  @Override
  public ListingData<Order> search(SearchRequest request, HttpRequest httpRequest) {
    var text = request.searchText().toLowerCase();
    return ListingData.of(
        OrderStore.INSTANCE.findAll().stream()
            .filter(
                o ->
                    text.isBlank()
                        || o.id().toLowerCase().contains(text)
                        || o.customer().toLowerCase().contains(text)
                        || o.product().toLowerCase().contains(text))
            .toList());
  }
}
