package io.mateu.mdd.shared.interfaces;

public class UserJourney {

    private final String baseUrl;

    private final String journeyType;

    public UserJourney(String baseUrl, String journeyType) {
        this.baseUrl = baseUrl;
        this.journeyType = journeyType;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getJourneyType() {
        return journeyType;
    }
}
