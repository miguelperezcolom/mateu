package io.mateu.core.domain.uidefinition.shared.data;

import com.google.common.base.Strings;
import java.time.LocalDate;

public class DatesRange {

  private LocalDate from;

  private LocalDate to;

  public DatesRange(LocalDate from, LocalDate to) {
    this.from = from;
    this.to = to;
  }

  public DatesRange() {}

  public DatesRange(String raw) {
    if (Strings.isNullOrEmpty(raw)) {
      return;
    }
    String[] rawValues = raw.split("#");
    if (rawValues.length > 0 && !Strings.isNullOrEmpty(rawValues[0])) {
      from = LocalDate.parse(rawValues[0]);
    }
    if (rawValues.length > 1 && !Strings.isNullOrEmpty(rawValues[1])) {
      to = LocalDate.parse(rawValues[1]);
    }
  }

  public LocalDate getFrom() {
    return from;
  }

  public void setFrom(LocalDate from) {
    this.from = from;
  }
}
