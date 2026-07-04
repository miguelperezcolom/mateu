package io.mateu.dtos;

import lombok.Builder;

/** Responsive dashboard grid. Tiles travel as component children */
@Builder
public record DashboardLayoutDto(int columns) implements ComponentMetadataDto {}
