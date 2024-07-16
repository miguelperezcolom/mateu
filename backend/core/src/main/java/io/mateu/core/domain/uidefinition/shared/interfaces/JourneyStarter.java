package io.mateu.core.domain.uidefinition.shared.interfaces;

public class JourneyStarter {

  private String baseUrl;

  public JourneyStarter() {}

  public JourneyStarter(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }
}
