package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

/**
 * One block of a {@link PlanningBoard}: a booking/assignment spanning {@code start} to {@code end}
 * (inclusive) on the resource identified by {@code resourceId}, with an optional color and status
 * caption (shown in the tooltip).
 */
@Builder
public record PlanningBlock(
    String id,
    String resourceId,
    LocalDate start,
    LocalDate end,
    String label,
    String color,
    String status) {}
