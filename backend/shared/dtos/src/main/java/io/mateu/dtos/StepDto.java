package io.mateu.dtos;

import lombok.Builder;

@Builder
public record StepDto(String id, String title, String description, String status) {}
