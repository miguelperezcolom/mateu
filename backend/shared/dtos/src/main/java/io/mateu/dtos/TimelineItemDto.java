package io.mateu.dtos;

import lombok.Builder;

@Builder
public record TimelineItemDto(
    String id,
    String title,
    String description,
    String timestamp,
    String icon,
    String color,
    String actionId) {}
