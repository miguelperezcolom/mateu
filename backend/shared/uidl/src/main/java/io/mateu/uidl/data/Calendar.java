package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

/**
 * A read-only month-grid calendar with events. {@code month} is any day in the month to show (the
 * grid is derived from it); each {@link CalendarEvent} is placed on its day. An event with an
 * {@code actionId} is clickable and dispatches the standard {@code action-requested} event.
 * Design-system neutral, dark-mode aware.
 */
@Builder
public record Calendar(
    String id, LocalDate month, List<CalendarEvent> events, String style, String cssClasses)
    implements Component {}
