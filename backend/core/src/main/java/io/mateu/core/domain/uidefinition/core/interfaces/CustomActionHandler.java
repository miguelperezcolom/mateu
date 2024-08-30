package io.mateu.core.domain.uidefinition.core.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;
import java.util.Map;

public interface CustomActionHandler {

    List<String> getManagedActions();

    Object handle(String actionId, Map<String, Object> data, ServerHttpRequest serverHttpRequest);

}
