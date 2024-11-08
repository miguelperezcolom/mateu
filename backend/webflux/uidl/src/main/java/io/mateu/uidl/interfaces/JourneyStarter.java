package io.mateu.uidl.interfaces;

public record JourneyStarter(
    String uiId, String journeyTypeId, String baseUrl, String contextData) {}
