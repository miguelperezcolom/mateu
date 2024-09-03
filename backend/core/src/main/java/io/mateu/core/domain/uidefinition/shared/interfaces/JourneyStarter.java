package io.mateu.core.domain.uidefinition.shared.interfaces;

public record JourneyStarter(
    String uiId, String journeyTypeId, String baseUrl, String contextData) {}
