package com.example.uis.travel;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.annotations.Intent;
import io.mateu.uidl.interfaces.Form;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;

@Intent
public class CreateBookingForm implements Form {

  @NotEmpty CustomerSelector customer;

  String service;

  LocalDate startDate;

  LocalDate endDate;

  String comments;

  @Action(type = ActionType.Main)
  void create() {}
}
