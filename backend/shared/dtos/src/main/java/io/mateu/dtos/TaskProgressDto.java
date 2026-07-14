package io.mateu.dtos;

import lombok.Builder;

@Builder
public record TaskProgressDto(
    String label, int total, int done, String actionLabel, String actionId)
    implements ComponentMetadataDto {}
