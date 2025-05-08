package com.example.uis.travel;

import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.Listing;
import reactor.core.publisher.Mono;

record BookingServicesListFilters() {}

record BookingServicesListRow() {}

public class BookingServicesList
    implements Listing<BookingServicesListFilters, BookingServicesListRow> {
  @Override
  public Mono<Page<BookingServicesListRow>> search(
      String text, BookingServicesListFilters bookingServicesListFilters, Pageable pageable) {
    return Mono.empty();
  }
}
