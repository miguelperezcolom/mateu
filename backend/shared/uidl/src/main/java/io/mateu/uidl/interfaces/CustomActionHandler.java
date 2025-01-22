package io.mateu.uidl.interfaces;

import java.util.List;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface CustomActionHandler {

  List<String> getManagedActions();

  Object handle(String actionId, Map<String, Object> data, ServerHttpRequest serverHttpRequest);
}
