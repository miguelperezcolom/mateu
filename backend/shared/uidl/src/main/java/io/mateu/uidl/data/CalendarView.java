package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * How a {@link Calendar} shows its period: the {@code month} grid, the {@code week} (Monday to
 * Sunday around the anchor date), a single {@code day}, or a {@code list} — the agenda of the
 * month, grouped by date.
 */
@Experimental("calendar views (3.0-alpha.409)")
public enum CalendarView {
  month,
  week,
  day,
  list
}
