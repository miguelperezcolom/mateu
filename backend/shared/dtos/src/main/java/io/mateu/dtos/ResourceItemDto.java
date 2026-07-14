package io.mateu.dtos;

import lombok.Builder;

@Builder
public record ResourceItemDto(
    String id,
    String title,
    String subtitle,
    String statusLabel,
    String statusColor,
    String note,
    String noteColor,
    boolean disabled,
    boolean recommended,
    boolean selected) {}
