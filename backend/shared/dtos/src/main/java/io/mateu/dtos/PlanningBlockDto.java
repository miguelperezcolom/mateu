package io.mateu.dtos;

import lombok.Builder;

/** One planning board block; start/end are ISO-8601 dates (inclusive) */
@Builder
public record PlanningBlockDto(
    String id,
    String resourceId,
    String start,
    String end,
    String label,
    String color,
    String status) {}
