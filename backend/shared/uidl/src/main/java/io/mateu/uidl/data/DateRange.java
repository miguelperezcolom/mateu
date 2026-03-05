package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record DateRange(LocalDate from, LocalDate to) {

  @Override
  public String toString() {
    return from + " - " + to;
  }
}
