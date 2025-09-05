package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Serdeable
@Builder
public record Training(
        String id,
        String name,
        String image,
        LocalDate dueDate,
        TrainingStatus status,
        int completedSteps,
        int totalSteps,
        List<TrainingStep> steps
) {
}
