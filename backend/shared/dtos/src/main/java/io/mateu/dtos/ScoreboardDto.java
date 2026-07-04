package io.mateu.dtos;

import lombok.Builder;

/** Horizontal band of metric cards. Child metric cards travel as component children */
@Builder
public record ScoreboardDto() implements ComponentMetadataDto {}
