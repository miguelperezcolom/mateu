package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OrgChartDto(OrgNodeDto root) implements ComponentMetadataDto {}
