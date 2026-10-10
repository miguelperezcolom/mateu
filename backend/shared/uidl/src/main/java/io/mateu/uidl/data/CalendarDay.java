package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.time.LocalDate;
import lombok.Builder;

/**
 * What a {@link Calendar} shows IN a date's cell, besides its events: a short {@code label} (e.g.
 * the maximum availability of a hotel's Property Calendar, a restriction) and a {@code tone} (info,
 * success, warning, danger, neutral) that tints the cell.
 */
@Builder
@Experimental("calendar views (3.0-alpha.409)")
public record CalendarDay(LocalDate date, String label, String tone) {}
