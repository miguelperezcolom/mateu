package io.mateu.dtos;

import lombok.Builder;

@Builder
public record StatusItemDto(
    String id,
    String icon,
    String title,
    String description,
    String status,
    String statusColor,
    String actionLabel,
    String actionId) {}
