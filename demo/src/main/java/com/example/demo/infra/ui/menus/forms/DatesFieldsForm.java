package com.example.demo.infra.ui.menus.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.Section;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
