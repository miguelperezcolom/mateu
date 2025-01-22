package io.mateu.uidl.data;

public record RemoteJourney(
    String remoteBaseUrl, String remoteUiId, String remoteJourneyType, String contextData) {}
