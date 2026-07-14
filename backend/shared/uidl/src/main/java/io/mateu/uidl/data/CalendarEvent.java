package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

/**
 * One event on a {@link Calendar}: a title on a given {@code date}, with an optional {@code color}
 * and an {@code actionId} that makes the event chip clickable.
 */
@Builder
public record CalendarEvent(
    String id, String title, LocalDate date, String color, String actionId) {}
