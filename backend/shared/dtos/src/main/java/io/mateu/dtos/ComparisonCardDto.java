package io.mateu.dtos;

import lombok.Builder;

@Builder
public record ComparisonCardDto(
    String title,
    String leftLabel,
    String leftValue,
    String rightLabel,
    String rightValue,
    String delta,
    String trend)
    implements ComponentMetadataDto {}
