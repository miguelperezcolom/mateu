package io.mateu.core.domain.uidefinition.shared.interfaces;

public record JourneyStarter(
    String journeyTypeId, String baseUrl, String journeyId, String stepId, String actionId) {}
