package io.mateu.mdd.shared.interfaces;

public class RemoteSubmenu {

  private final String baseUrl;

  private final String uiId;

  private final String caption;

  public RemoteSubmenu(String baseUrl, String uiId, String caption) {
    this.baseUrl = baseUrl;
    this.uiId = uiId;
    this.caption = caption;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public String getUiId() {
    return uiId;
  }

  public String getCaption() {
    return caption;
  }
}
