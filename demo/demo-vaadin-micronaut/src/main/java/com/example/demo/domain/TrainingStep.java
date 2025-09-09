package com.example.demo.domain;

import lombok.With;

import java.time.LocalDateTime;

@With
public record TrainingStep(String id, String name, String text, boolean completed, LocalDateTime completionDate) {
}
