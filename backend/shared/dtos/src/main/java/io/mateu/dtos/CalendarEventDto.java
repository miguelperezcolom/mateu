package io.mateu.dtos;

import lombok.Builder;

@Builder
public record CalendarEventDto(
    String id,
    String title,
    String date,
    String endDate,
    String startTime,
    String endTime,
    String color,
    String actionId) {}
