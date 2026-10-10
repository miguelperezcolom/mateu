package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * One planning board row; group is an optional swimlane caption, attributes the values of the
 * board's attribute columns, icon an optional icon name before the label
 */
@Builder
public record PlanningResourceDto(
    String id, String label, String group, List<String> attributes, String icon) {}
