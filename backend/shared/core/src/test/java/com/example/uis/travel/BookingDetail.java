package com.example.uis.travel;

import io.mateu.uidl.interfaces.DetailPage;
import io.mateu.uidl.annotations.Intent;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Subresource;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import lombok.NoArgsConstructor;
import reactor.core.publisher.Mono;

@Intent
@NoArgsConstructor
@Route("/bookings/:bookingId")
public class BookingDetail implements HandlesRoute, DetailPage {

  String bookingId;

  String customer;

  String service;

  LocalDate startDate;

  LocalDate endDate;

  String comments;

  @Subresource BookingServicesList services;

  @Subresource BookingPaymentsList payments;

  Mono<BookingDetail> load(String bookingId) {
    return Mono.empty();
  }

  @Override
  public Mono<Object> handle(String route, HttpRequest httpRequest) {
    // todo: hydrate
    return Mono.just(this);
  }
}
