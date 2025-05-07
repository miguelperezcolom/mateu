package com.example.uis.travel;

import com.example.uis.travel.uidl.Form;
import com.example.uis.travel.uidl.Intent;
import com.example.uis.travel.uidl.MainAction;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;

@Intent
public class CreateBookingForm implements Form {

  @NotEmpty
  CustomerRef customer;

  String service;

  LocalDate startDate;

  LocalDate endDate;

  String comments;

  @MainAction
  void create() {}
}
