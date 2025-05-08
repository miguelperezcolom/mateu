package com.example.uis.travel;

import io.mateu.uidl.annotations.Intent;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.RowAction;
import reactor.core.publisher.Mono;

record Filters() {}

record Row(String bookingId) {}

@Intent
@Route("/bookings")
public class BookingsCrud implements Listing<Filters, Row> {

  CreateBookingForm create() {
    return new CreateBookingForm();
  }

  @RowAction
  Mono<BookingDetail> view(Row row) {
    return new BookingDetail().load(row.bookingId());
  }

  @Override
  public Mono<Page<Row>> search(String text, Filters filters, Pageable pageable) {
    return Mono.empty();
  }
}
