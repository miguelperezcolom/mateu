package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Data;

@Data
@Caption("Dates")
public class DatesFieldsForm {

  @Section("Dates")
  private LocalDate date;

  private LocalDateTime dateAndTime;

  private LocalTime time;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + ", " + date + ", " + dateAndTime + ", " + time;
  }
}
