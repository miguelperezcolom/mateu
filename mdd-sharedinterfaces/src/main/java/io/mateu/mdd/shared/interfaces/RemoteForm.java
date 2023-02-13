package io.mateu.mdd.shared.interfaces;

public class RemoteForm {

    private final String baseUrl;

    private final String className;

    public RemoteForm(String baseUrl, String className) {
        this.baseUrl = baseUrl;
        this.className = className;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getClassName() {
        return className;
    }
}
