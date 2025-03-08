package io.mateu.core.application.getui;

import io.mateu.uidl.interfaces.HttpRequest;

public record GetUIQuery(String uiId, String baseUrl, HttpRequest httpRequest) {}
