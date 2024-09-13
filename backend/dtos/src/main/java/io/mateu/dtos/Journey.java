package io.mateu.dtos;

/**
 * Info about the journey
 *
 * @param type The journey type
 * @param status The journey status
 * @param statusMessage The journey status message
 * @param currentStepId The current step targetId
 * @param currentStepDefinitionId the current step definition targetId. Used for bpmn engines
 */
public record Journey(
    String type,
    JourneyStatus status,
    String statusMessage,
    String currentStepId,
    String currentStepDefinitionId) {}
