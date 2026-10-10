package io.mateu.dtos;

import lombok.Builder;

@Builder
public record CalendarDayDto(String date, String label, String tone) {}
