package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
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
    @Experimental("calendar views (3.0-alpha.409)") LocalDate endDate,
    @Experimental("calendar views (3.0-alpha.409)") String startTime,
    @Experimental("calendar views (3.0-alpha.409)") String endTime,
    String color,
    String actionId) {

  public CalendarEvent(String id, String title, LocalDate date, String color, String actionId) {
    this(id, title, date, null, null, null, color, actionId);
  }
}
