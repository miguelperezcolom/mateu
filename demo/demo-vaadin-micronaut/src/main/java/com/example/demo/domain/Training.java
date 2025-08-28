package com.example.demo.domain;

import lombok.Builder;

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
