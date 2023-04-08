package io.mateu.mdd.shared.interfaces;

public class RemoteUI {

    private final String baseUrl;

    private final String uiId;

    public RemoteUI(String baseUrl, String uiId) {
        this.baseUrl = baseUrl;
        this.uiId = uiId;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getUiId() {
        return uiId;
    }
}
