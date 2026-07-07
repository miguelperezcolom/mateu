package io.mateu.uidl.data;

import lombok.Builder;

/**
 * A min/max numeric interval for TYPED filter fields on declarative listings — the numeric
 * counterpart of {@link DateRange}: renders as a from–to widget on the smart search bar and is
 * assembled back from the {@code <field>_from}/{@code <field>_to} state keys before hydration.
 * Either bound may be null (open-ended).
 */
@Builder
public record NumberRange(Double from, Double to) {

  public boolean isEmpty() {
    return from == null && to == null;
  }

  /** True when {@code value} falls inside the interval, treating null bounds as open. */
  public boolean contains(Number value) {
    if (value == null) {
      return false;
    }
    double v = value.doubleValue();
    return (from == null || v >= from) && (to == null || v <= to);
  }
}
