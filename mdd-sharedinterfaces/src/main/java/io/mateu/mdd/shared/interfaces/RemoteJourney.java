package io.mateu.mdd.shared.interfaces;

public class RemoteJourney {

    private final String baseUrl;

    private final String journeyTypeId;

    public RemoteJourney(String baseUrl, String journeyTypeId) {
        this.baseUrl = baseUrl;
        this.journeyTypeId = journeyTypeId;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getJourneyTypeId() {
        return journeyTypeId;
    }
}
