package io.mateu.dtos;

import lombok.Builder;

@Builder
public record CalendarEventDto(
    String id, String title, String date, String color, String actionId) {}
