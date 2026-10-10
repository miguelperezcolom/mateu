package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

/**
 * One event on a {@link Calendar}: a title on a given {@code date} — through {@code endDate}
 * (inclusive) when it spans several days —, optionally between {@code startTime} and {@code
 * endTime} ("HH:mm", shown in the week, day and list views), with an optional {@code color} and an
 * {@code actionId} that makes the event chip clickable.
 */
@Builder
public record CalendarEvent(
    String id,
    String title,
    LocalDate date,
    LocalDate endDate,
    String startTime,
    String endTime,
    String color,
    String actionId) {

  public CalendarEvent(String id, String title, LocalDate date, String color, String actionId) {
    this(id, title, date, null, null, null, color, actionId);
  }
}
