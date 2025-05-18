package io.mateu.core.application.getui;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

public record GetUIQuery(
    String uiId,
    String baseUrl,
    String route,
    Map<String, Object> config,
    HttpRequest httpRequest) {}
