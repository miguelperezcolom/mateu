package io.mateu.uidl.core.interfaces;

public record JourneyStarter(
    String uiId, String journeyTypeId, String baseUrl, String contextData) {}
