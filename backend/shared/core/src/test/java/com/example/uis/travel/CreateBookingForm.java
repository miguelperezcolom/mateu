package com.example.uis.travel;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.interfaces.Page;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;

public class CreateBookingForm implements Page {

  @NotEmpty CustomerSelector customer;

  String service;

  LocalDate startDate;

  LocalDate endDate;

  String comments;

  @Button
  void create() {}
}
