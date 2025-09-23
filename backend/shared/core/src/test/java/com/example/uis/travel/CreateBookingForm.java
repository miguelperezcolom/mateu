package com.example.uis.travel;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.annotations.Intent;
import io.mateu.uidl.interfaces.Page;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;

@Intent
public class CreateBookingForm implements Page {

  @NotEmpty CustomerSelector customer;

  String service;

  LocalDate startDate;

  LocalDate endDate;

  String comments;

  @Action(type = ActionType.Main)
  void create() {}
}
