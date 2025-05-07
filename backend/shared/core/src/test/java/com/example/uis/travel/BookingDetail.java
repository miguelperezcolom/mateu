package com.example.uis.travel;

import com.example.uis.travel.uidl.DetailPage;
import com.example.uis.travel.uidl.Intent;
import com.example.uis.travel.uidl.Route;
import com.example.uis.travel.uidl.Subresource;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.NoArgsConstructor;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

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

  @Subresource
  BookingServicesList services;

  @Subresource
  BookingPaymentsList payments;


  Mono<BookingDetail> load(String bookingId) {
    return Mono.empty();
  }

  @Override
  public Mono<Object> handle(String route, HttpRequest httpRequest) {
    // todo: hydrate
    return Mono.just(this);
  }
}
