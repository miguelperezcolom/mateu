package com.example.uis.travel;

import com.example.uis.travel.uidl.Intent;
import com.example.uis.travel.uidl.Listing;
import com.example.uis.travel.uidl.Page;
import com.example.uis.travel.uidl.Pageable;
import com.example.uis.travel.uidl.Route;
import com.example.uis.travel.uidl.RowAction;
import io.mateu.uidl.annotations.Action;
import reactor.core.publisher.Mono;

record Filters() {}

record Row(String bookingId) {}

@Intent
@Route("/bookings")
public class BookingsCrud implements Listing<Filters, Row> {

  @Action
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
