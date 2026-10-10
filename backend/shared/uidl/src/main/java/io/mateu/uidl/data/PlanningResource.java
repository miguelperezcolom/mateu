package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import lombok.Builder;

/**
 * One row of a {@link PlanningBoard}: a bookable/assignable resource (room, vehicle, employee).
 * {@code group} is an optional swimlane caption (e.g. floor or room type) — consecutive resources
 * sharing the same group render under one caption.
 */
@Builder
public record PlanningResource(
    String id,
    String label,
    String group,
    /** Values of the board's attribute columns, in order (e.g. "SUP", "Clean"). */
    @Experimental("planning board interactions (3.0-alpha.409)") List<String> attributes,
    /** Icon shown before the label (icon name, e.g. "vaadin:star"); null for none. */
    @Experimental("planning board interactions (3.0-alpha.409)") String icon) {

  public PlanningResource(String id, String label, String group) {
    this(id, label, group, List.of(), null);
  }
}
