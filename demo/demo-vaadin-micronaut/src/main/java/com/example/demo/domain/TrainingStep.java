package com.example.demo.domain;

import java.time.LocalDateTime;

public record TrainingStep(String id, String name, String text, boolean completed, LocalDateTime completionDate) {
}
