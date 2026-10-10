package io.mateu.dtos;

/**
 * Info about the journey
 *
 * @param type The journey dataType
 * @param status The journey status
 * @param statusMessage The journey status message
 * @param currentStepId The current step targetId
 * @param currentStepDefinitionId the current step definition targetId. Used for bpmn engines
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record JourneyDto(
    String type,
    JourneyStatusDto status,
    String statusMessage,
    String currentStepId,
    String currentStepDefinitionId) {}
