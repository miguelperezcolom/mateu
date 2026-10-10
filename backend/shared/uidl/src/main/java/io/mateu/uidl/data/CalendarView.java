package io.mateu.uidl.data;

/**
 * How a {@link Calendar} shows its period: the {@code month} grid, the {@code week} (Monday to
 * Sunday around the anchor date), a single {@code day}, or a {@code list} — the agenda of the
 * month, grouped by date.
 */
public enum CalendarView {
  month,
  week,
  day,
  list
}
