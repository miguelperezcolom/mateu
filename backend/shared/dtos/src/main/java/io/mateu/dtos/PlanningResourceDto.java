package io.mateu.dtos;

import lombok.Builder;

/** One planning board row; group is an optional swimlane caption */
@Builder
public record PlanningResourceDto(String id, String label, String group) {}
