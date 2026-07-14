package io.mateu.dtos;

import lombok.Builder;

@Builder
public record AddOnDto(
    String id,
    String icon,
    String title,
    String description,
    Double price,
    String unit,
    String includedLabel,
    boolean added) {}
