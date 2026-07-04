package io.mateu.dtos;

import lombok.Builder;

/** One Gantt bar; start/end are ISO-8601 dates */
@Builder
public record GanttTaskDto(
    String id, String title, String start, String end, double progress, String color) {}
