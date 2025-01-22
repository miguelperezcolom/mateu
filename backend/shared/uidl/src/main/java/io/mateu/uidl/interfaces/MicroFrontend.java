package io.mateu.uidl.interfaces;

import java.util.Map;

public record MicroFrontend(String baseUrl, Map<String, Object> contextData) {

  public MicroFrontend(String baseUrl, String contextData) {
    this(baseUrl, Map.of("_raw", contextData));
  }

  public String baseUrl() {
    if (baseUrl == null) {
      return null;
    }
    if (baseUrl.contains("#")) {
      return baseUrl.substring(0, baseUrl.indexOf("#"));
    }
    return baseUrl;
  }

  public String journeyTypeId() {
    if (baseUrl == null) {
      return null;
    }
    var journeyTypeId = "____home____";
    if (baseUrl.contains("#")) {
      journeyTypeId = baseUrl.substring(baseUrl.indexOf("#") + 1);
    }
    return journeyTypeId;
  }
}
