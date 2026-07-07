package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

/**
 * A from/to date interval for TYPED filter fields on declarative listings: declare a {@code
 * DateRange} field in the Filters class and the smart search bar renders it as a from–to date
 * widget; on search the {@code <field>_from}/{@code <field>_to} state keys are assembled back into
 * a {@code DateRange} instance (see {@link io.mateu.uidl.interfaces.FilterStateAssembler}), so
 * {@code search(...)} receives it ready to apply. Either bound may be null (open-ended).
 */
@Builder
public record DateRange(LocalDate from, LocalDate to) {

  public boolean isEmpty() {
    return from == null && to == null;
  }

  /** True when {@code date} falls inside the interval, treating null bounds as open. */
  public boolean contains(LocalDate date) {
    if (date == null) {
      return false;
    }
    return (from == null || !date.isBefore(from)) && (to == null || !date.isAfter(to));
  }

  @Override
  public String toString() {
    return from + " - " + to;
  }
}
