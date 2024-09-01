package io.mateu.dtos;

/**
 * Info about the journey
 *
 * @param type The journey type
 * @param status The journey status
 * @param statusMessage The journey status message
 * @param currentStepId The current step id
 * @param currentStepDefinitionId the current step definition id. Used for bpmn engines
 */
public record Journey(
    String type,
    JourneyStatus status,
    String statusMessage,
    String currentStepId,
    String currentStepDefinitionId) {}
