package io.mateu.dtos;

import lombok.Builder;

@Builder
public record MeterDto(
    String label,
    Double value,
    Double max,
    String unit,
    String caption,
    Double warnAt,
    Double dangerAt)
    implements ComponentMetadataDto {}
