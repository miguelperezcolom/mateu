package io.mateu.dtos;

import lombok.Builder;

@Builder
public record ChecklistItemDto(String id, String label, boolean done, String actionId) {}
