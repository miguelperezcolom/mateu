package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
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
    String status,
    /** Icon shown before the label (e.g. "vaadin:star" for a VIP); null for none. */
    @Experimental("planning board interactions (3.0-alpha.409)") String icon,
    /** What hovering the block shows (several lines separated by \n); null = label + dates. */
    @Experimental("planning board interactions (3.0-alpha.409)") String summary) {

  public PlanningBlock(
      String id,
      String resourceId,
      LocalDate start,
      LocalDate end,
      String label,
      String color,
      String status) {
    this(id, resourceId, start, end, label, color, status, null, null);
  }
}
