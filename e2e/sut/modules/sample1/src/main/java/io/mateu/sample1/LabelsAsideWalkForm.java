package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * Walkthrough fixture for labels-aside inference: a single-column form of six short, single-line
 * fields is the dense back-office idiom, so its labels go to the left of the inputs without the
 * developer saying so.
 */
@UI("/walk-labels-aside")
@Title("Labels aside walk")
@FormLayout(columns = 1)
@Getter
@Setter
public class LabelsAsideWalkForm {

  String code = "C-1";
  String name = "Acme";
  String city = "Madrid";
  String country = "Spain";
  int employees = 12;
  LocalDate since = LocalDate.of(2020, 1, 1);

  @Button
  public Message echo() {
    return new Message("echo: name=" + name + " employees=" + employees);
  }
}
