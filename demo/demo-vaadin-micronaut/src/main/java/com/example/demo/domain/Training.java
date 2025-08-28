package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
@Builder
public record Training(
        String id,
        String name,
        String image,
        TrainingStatus status,
        String url,
        int completedStepd,
        int totalSteps
) {
}
