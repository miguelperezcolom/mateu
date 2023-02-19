package io.mateu.mdd.shared.interfaces;

public class RemoteUI {

    private final String baseUrl;

    private final String path;

    public RemoteUI(String baseUrl, String path) {
        this.baseUrl = baseUrl;
        this.path = path;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getPath() {
        return path;
    }
}
