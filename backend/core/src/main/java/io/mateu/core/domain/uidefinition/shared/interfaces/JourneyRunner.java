package io.mateu.core.domain.uidefinition.shared.interfaces;

public class JourneyRunner {

  private String baseUrl;

  private String journeyType;

  public JourneyRunner(String baseUrl, String journeyType) {
    this.baseUrl = baseUrl;
    this.journeyType = journeyType;
  }

  public JourneyRunner() {}

  public String getBaseUrl() {
    return baseUrl;
  }

  public String getJourneyType() {
    return journeyType;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public void setJourneyType(String journeyType) {
    this.journeyType = journeyType;
  }
}
