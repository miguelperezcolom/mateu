package com.example.uis.travel;

import com.example.uis.travel.uidl.ActionType;
import com.example.uis.travel.uidl.Form;
import com.example.uis.travel.uidl.Intent;
import com.example.uis.travel.uidl.Action;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;

@Intent
public class CreateBookingForm implements Form {

  @NotEmpty
  CustomerSelector customer;

  String service;

  LocalDate startDate;

  LocalDate endDate;

  String comments;

  @Action(type = ActionType.Main)
  void create() {}
}
