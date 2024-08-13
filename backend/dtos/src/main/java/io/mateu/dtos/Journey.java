package io.mateu.dtos;

public record Journey(
    String type,
    JourneyStatus status,
    String statusMessage,
    String currentStepId,
    String currentStepDefinitionId) {}
