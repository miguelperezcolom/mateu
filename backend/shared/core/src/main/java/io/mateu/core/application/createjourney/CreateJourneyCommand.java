package io.mateu.core.application.createjourney;

import io.mateu.uidl.interfaces.HttpRequest;

public record CreateJourneyCommand(
    String uiId, String journeyType, String journeyId, String baseUrl, HttpRequest httpRequest) {}
