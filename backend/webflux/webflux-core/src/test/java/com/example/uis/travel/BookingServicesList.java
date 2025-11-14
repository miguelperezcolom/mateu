package com.example.uis.travel;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveListingBackend;
import reactor.core.publisher.Mono;

record BookingServicesListFilters() {}

record BookingServicesListRow() {}

public class BookingServicesList
    implements ReactiveListingBackend<BookingServicesListFilters, BookingServicesListRow> {

  @Override
  public Mono<ListingData<BookingServicesListRow>> search(
      String searchText,
      BookingServicesListFilters bookingServicesListFilters,
      Pageable pageable,
      HttpRequest httpRequest) {
    return Mono.empty();
  }
}
