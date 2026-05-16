package com.example.uis.travel;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveListingBackend;
import reactor.core.publisher.Mono;

record BookingFilters() {}

record BookingRow(String bookingId) {}

@Route("/bookings")
public class BookingsCrud implements ReactiveListingBackend<BookingFilters, BookingRow> {

  @Override
  public Mono<ListingData<BookingRow>> search(
      String searchText, BookingFilters filters, Pageable pageable, HttpRequest httpRequest) {
    return Mono.empty();
  }
}
