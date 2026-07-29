package com.example.uis.travel;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveListing;
import io.mateu.uidl.interfaces.Searchable;
import reactor.core.publisher.Mono;

record BookingFilters() {}

record BookingRow(String bookingId) {}

@Route("/bookings")
public class BookingsCrud
    implements ReactiveListing<BookingRow>, Searchable, Filterable<BookingFilters> {

  @Override
  public Mono<ListingData<BookingRow>> search(SearchRequest request, HttpRequest httpRequest) {
    return Mono.empty();
  }
}
