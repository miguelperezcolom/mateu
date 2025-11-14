package com.example.uis.travel;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.RowAction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveListingBackend;
import reactor.core.publisher.Mono;

record Filters() {}

record Row(String bookingId) {}

@Route("/bookings")
public class BookingsCrud implements ReactiveListingBackend<Filters, Row> {

  CreateBookingForm create() {
    return new CreateBookingForm();
  }

  @RowAction
  Mono<BookingDetail> view(Row row) {
    return new BookingDetail().load(row.bookingId());
  }

  @Override
  public Mono<ListingData<Row>> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
    return Mono.empty();
  }
}
