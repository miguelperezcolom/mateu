package io.mateu.core.domain.uidefinitionlanguage.shared.interfaces;

public record JourneyStarter(
    String uiId, String journeyTypeId, String baseUrl, String contextData) {}
