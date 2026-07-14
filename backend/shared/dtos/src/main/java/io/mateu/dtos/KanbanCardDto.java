package io.mateu.dtos;

import lombok.Builder;

@Builder
public record KanbanCardDto(
    String id, String title, String description, String badge, String color, String actionId) {}
