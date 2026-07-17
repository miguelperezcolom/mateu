package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One row of a {@link PlanningBoard}: a bookable/assignable resource (room, vehicle, employee).
 * {@code group} is an optional swimlane caption (e.g. floor or room type) — consecutive resources
 * sharing the same group render under one caption.
 */
@Builder
public record PlanningResource(String id, String label, String group) {}
